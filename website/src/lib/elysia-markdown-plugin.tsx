import { Elysia, t } from 'elysia'
import { HTMLRewriter } from 'htmlrewriter'
import matter from 'gray-matter'

import { notifyError } from 'website/src/lib/errors'

import { prisma } from 'db/prisma'
import { marked } from 'marked'
import { Octokit } from 'octokit'
import {
    getOctokit,
    getRepoFiles,
    isMarkdown,
} from 'website/src/lib/github.server'
import { isTruthy } from 'website/src/lib/utils'

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

export const markdownPluginApp = new Elysia({ aot: false })
    .state('userId', '')
    .group('/markdownPlugin', (group) => {
        return group
            .get('/health', () => {
                return 'ok'
            })
            .get(
                '/githubRepoList',
                async ({ body, store }) => {
                    const userId = store.userId
                    if (!userId) {
                        throw unauthorizedResponse
                    }
                    const installation =
                        await prisma.githubInstallation.findFirst({
                            where: {
                                orgId: userId,
                            },
                        })
                    if (!installation) {
                        throw new Error('No github installation found')
                    }

                    const installationId = installation.installationId
                    const octokit = await getOctokit({ installationId })
                    const repos = await Promise.resolve().then(async () => {
                        if (installation.accountType === 'ORGANIZATION') {
                            const { data } =
                                await octokit.rest.repos.listForOrg({
                                    org: installation.accountLogin,
                                    per_page: 100,
                                    page: 1,
                                    direction: 'desc',
                                    type: 'all',
                                    sort: 'pushed',
                                })
                            return data.map((x) => {
                                const { private: p, url, name, owner } = x
                                return {
                                    repo: name,
                                    owner: owner.login,
                                    repoSlug: `${owner.login}/${name}`,
                                    private: p,
                                    url,
                                }
                            })
                        }
                        {
                            const octokit = new Octokit({
                                auth: installation.oauthToken,
                            })
                            const { data } =
                                await octokit.rest.repos.listForAuthenticatedUser(
                                    {
                                        page: 1,
                                        per_page: 100,
                                        direction: 'desc',
                                        sort: 'pushed',
                                        type: 'all',
                                    },
                                )
                            return data.map((x) => {
                                const { private: p, url, owner, name } = x
                                return {
                                    owner: owner.login,
                                    repo: name,
                                    repoSlug: `${owner.login}/${name}`,
                                    private: p,
                                    url,
                                }
                            })
                        }
                    })

                    return { repos }
                },
                {
                    // body: t.Object({
                    //     // userId: t.String(),
                    // }),
                },
            )
            .post(
                '/syncGithub',
                async ({ body, store }) => {
                    let { owner, basePath, repo } = body
                    if (!basePath) {
                        basePath = ''
                    }
                    const userId = store.userId
                    if (!userId) {
                        throw unauthorizedResponse
                    }
                    const githubInstallation =
                        await prisma.githubInstallation.findFirst({
                            where: {
                                orgId: userId,
                            },
                        })
                    if (!githubInstallation) {
                        throw new Error('No github installation found')
                    }

                    const installationId = githubInstallation.installationId
                    const octokit = await getOctokit({ installationId })
                    const repoResult = await octokit.rest.repos.get({
                        owner,
                        repo,
                    })
                    let branch = repoResult.data.default_branch
                    const files = await getRepoFiles({
                        fetchBlob(pagePath) {
                            return (
                                pagePath?.startsWith(basePath) &&
                                isMarkdown(pagePath)
                            )
                        },
                        branch: branch,
                        octokit: octokit.rest,
                        owner,
                        repo,
                    })
                    let allAssetPaths = files.map((x) => x.pagePath)
                    let filtered = files.filter((x) => {
                        return (
                            x?.pagePath?.startsWith(basePath) &&
                            isMarkdown(x.pagePath)
                        )
                    })

                    if (!filtered.length) {
                        throw new Error(
                            `No files found in ${owner}/${repo} inside folder ${basePath || '/'}`,
                        )
                    }
                    let withMarkdown = await Promise.all(
                        filtered.map(async (x) => {
                            if (!x?.content) {
                                return
                            }
                            const data = processMarkdown({
                                basePath,
                                allAssetPaths,
                                owner,
                                repo,
                                branch,
                                pagePath: x.pagePath,
                                content: x.content,
                                onError(e) {
                                    notifyError(e, 'error parsing markdown')
                                },
                            })
                            return data
                        }),
                    )
                    let properties: MarkdownPluginFrontMatter['properties'] = {}
                    for (let file of withMarkdown) {
                        if (!file?.frontMatter) {
                            continue
                        }
                        for (let [key, value] of Object.entries(
                            file.frontMatter,
                        )) {
                            if (!properties[key]) {
                                properties[key] = {
                                    values: [],
                                    name: key,
                                    id: key,
                                }
                            }
                            if (value != null) {
                                properties[key].values.push(value)
                            }
                        }
                    }
                    const frontMatter: MarkdownPluginFrontMatter = {
                        properties,
                    }
                    console.log(`finished syncing ${owner}/${repo}`)
                    return { frontMatter, files: withMarkdown.filter(isTruthy) }
                },
                {
                    body: t.Object({
                        owner: t.String(),
                        repo: t.String(),
                        basePath: t.String(),
                        // userId: t.String(),
                    }),
                },
            )
            .post(
                '/checkBasePath',
                async ({ body, store }) => {
                    let { owner, basePath, repo } = body

                    const userId = store.userId
                    if (!userId) {
                        throw unauthorizedResponse
                    }
                    if (basePath === '/') {
                        basePath = ''
                    }
                    if (!basePath.startsWith('/')) {
                        basePath = '/' + basePath
                    }

                    const githubInstallation =
                        await prisma.githubInstallation.findFirst({
                            where: {
                                orgId: userId,
                            },
                        })
                    if (!githubInstallation) {
                        throw new Error('No github installation found')
                    }

                    const installationId = githubInstallation.installationId
                    const octokit = await getOctokit({ installationId })
                    const repoResult = await octokit.rest.repos.get({
                        owner,
                        repo,
                    })
                    let baseBranch = repoResult.data.default_branch
                    const files = await getRepoFiles({
                        fetchBlob(pagePath) {
                            return false
                        },
                        branch: baseBranch,
                        octokit: octokit.rest,
                        owner,
                        repo,
                    })
                    const filtered = files
                        .filter((x) => {
                            return x.pagePath?.startsWith(basePath)
                        })
                        .filter((x) => {
                            let pagePath = x.pagePath
                            return isMarkdown(pagePath)
                        })
                    if (!filtered.length) {
                        return {
                            error: 'No files found in base path, use another one',
                            formattedBasePath: basePath,
                        }
                    }
                    return {
                        error: '',
                        formattedBasePath: basePath,
                    }
                },
                {
                    body: t.Object({
                        owner: t.String(),
                        repo: t.String(),
                        basePath: t.String(),
                        // userId: t.String(),
                    }),
                },
            )
    })

function turnPagePathIntoSlug(pagePath: string, basePath) {
    if (isAbsoluteUrl(pagePath)) {
        return pagePath
    }
    if (pagePath.startsWith(basePath)) {
        pagePath = pagePath.slice(basePath.length)
    }
    if (pagePath.startsWith('/')) {
        pagePath = pagePath.slice(1)
    }
    let res =
        '/' +
        pagePath
            .replace(/\.mdx?$/, '')
            .replace(/\/index$/, '')
            .replace(/\//g, '-') // framer does not support folders inside CMS, you will need to create separate collections for each folderF
    return res
}
function isAbsoluteUrl(url: string) {
    if (!url) {
        return false
    }
    let abs = [
        '#',
        'https://',
        'http://',
        'mailto:', //
    ].some((x) => url.startsWith(x))
    return abs
}
export function findMatchInPaths({
    filePath,
    paths,
}: {
    paths: string[]
    filePath: string
}) {
    // hashes are alright
    if (!filePath) {
        return ''
    }
    if (isAbsoluteUrl(filePath)) {
        return filePath
    }
    const normalized = normalizeFilePathForSearch(filePath)
    let found = paths.find((x) => {
        if (x === normalized) {
            return true
        }
        if (x.endsWith(normalized)) {
            return true
        }
        return false
    })
    return found || ''
}

function normalizeFilePathForSearch(filePath: string) {
    if (filePath.startsWith('/')) {
        filePath = filePath.slice(1)
    }
    let parts = filePath.split('/').filter(Boolean)
    // remove relative parts
    parts = parts.filter((x) => {
        if (x === '.') {
            return false
        }
        if (x === '..') {
            return false
        }
        return true
    })
    return parts.join('/')
}

export type MarkdownPluginFrontMatterProperty = {
    values: any[]
    name: string
    id: string
}

export type MarkdownPluginFrontMatter = {
    properties: Record<string, MarkdownPluginFrontMatterProperty>
}

export async function processMarkdown({
    basePath,
    allAssetPaths,
    owner,
    repo,
    branch,
    pagePath,
    onError,
    content,
}) {
    try {
        const grayMatter = matter(content || '')
        const html = await marked(grayMatter?.content || '')

        let title = ''
        let foundParagraph = false
        let formattedHtml = await new HTMLRewriter()
            .on('p,h2,h3', {
                element(element) {
                    foundParagraph = true
                },
            })
            .on('h1:first-child', {
                text(text) {
                    if (!foundParagraph) {
                        title += text.text
                    }
                },
            })
            .on('a', {
                element(element) {
                    // map relative links to absolute links using the same slug mapper
                    const href = element.getAttribute('href')
                    if (!href) {
                        return
                    }
                    const match = findMatchInPaths({
                        filePath: href,
                        paths: allAssetPaths,
                    })
                    if (match) {
                        let newHref = turnPagePathIntoSlug(match, basePath)
                        console.log(
                            `replaced link href from ${JSON.stringify(href)} to ${JSON.stringify(newHref)}`,
                        )
                        element.setAttribute('href', newHref)
                    }
                },
            })
            .on('img', {
                element(element) {
                    try {
                        //  map relative image sources to absolute links
                        const src = element.getAttribute('src')
                        if (!src) {
                            return
                        }
                        let imgPath = findMatchInPaths({
                            filePath: src,
                            paths: allAssetPaths,
                        })
                        if (imgPath) {
                            console.log(
                                `replaced link img from ${JSON.stringify(src)} to ${JSON.stringify(imgPath)}`,
                            )
                            let newSrc = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}${imgPath}`
                            element.setAttribute('src', newSrc)
                        }
                    } catch (e) {
                        notifyError(e, 'error transforming image src')
                    }
                },
            })
            .transform(new Response(html))
            .text()
            .catch((e) => {
                notifyError(e, 'error transforming html')
                return html
            })

        if (!formattedHtml && html) {
            notifyError(
                new Error(`htmlrewriter returned empty html`),
                'error transforming html',
            )
        }
        // TODO map relative image urls to github signed urls, make a proxy that also caches the images
        let slug = turnPagePathIntoSlug(pagePath, basePath)
        if (!title) {
            console.log(`no title found for ${slug}, using page slug for it`)
            title = slug
        }
        return {
            html: formattedHtml,
            frontMatter: grayMatter.data,
            pagePath,
            slug,
            title,
        }
    } catch (e) {
        onError?.(e)
    }
}
