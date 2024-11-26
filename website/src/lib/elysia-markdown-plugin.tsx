import matter from 'gray-matter'
import mime from 'mime'
import yaml from 'js-yaml'
import * as domutils from 'domutils'
import domSerializer from 'dom-serializer'

import { Spiceflow } from 'spiceflow'

import { notifyError } from 'website/src/lib/errors'

import { prisma } from 'db/prisma'
import { marked } from 'marked'
import { Octokit } from 'octokit'
import { env } from 'website/src/lib/env'
import {
    checkGitHubIsInstalled,
    getGithubUserLogin,
    getOctokit,
    getRepoFiles,
    isMarkdown,
} from 'website/src/lib/github.server'
import { isTruthy } from 'website/src/lib/utils'
import { z } from 'zod'
import { redirect } from '@remix-run/react'
import DomHandler from 'domhandler'
import { Parser } from 'htmlparser2'
import { markdownToHtml } from 'website/src/lib/mdx'
import path from 'path'

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

export const markdownPluginApp = new Spiceflow({ basePath: '/markdownPlugin' })
    // .state('sessionKey', '')
    .state('githubUserLogin', '')
    .state('orgId', '')
    .state('userId', '')
    // .state('session', {} as Session)

    .use(async function addGithubUserLogin({ request, state: store }) {
        const pathname = new URL(request.url).pathname
        if (!pathname.includes('/markdownPlugin')) {
            return
        }
        const orgId = store.orgId
        if (!orgId) {
            return
        }
        const userId = store.userId
        if (!userId) {
            return
        }
        // console.log('getting github user login')
        const githubUserLogin = await getGithubUserLogin({ userId })
        if (!githubUserLogin) {
            throw new Error('Github login for user not found in database')
        }
        store.githubUserLogin = githubUserLogin
    })
    .get('/health', () => {
        return 'ok'
    })

    .post(
        '/githubRepoList',
        async ({ request, state: store }) => {
            const { githubAccountLogin } = await request.json()
            const orgId = store.orgId

            if (!orgId) {
                throw unauthorizedResponse
            }
            const installation = await prisma.githubInstallation.findFirst({
                where: {
                    status: 'active',
                    memberLogins: {
                        has: store.githubUserLogin,
                    },
                    appId: env.GITHUB_APP_ID,

                    accountLogin: githubAccountLogin,
                },
            })
            if (!installation) {
                throw new Error(
                    `No github installation found for ${githubAccountLogin} with user "${store.githubUserLogin}"`,
                )
            }

            const installationId = installation.installationId
            const octokit = await getOctokit({ installationId })
            const repos = await Promise.resolve().then(async () => {
                if (installation.accountType === 'ORGANIZATION') {
                    const { data } = await octokit.rest.repos.listForOrg({
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
                        await octokit.rest.repos.listForAuthenticatedUser({
                            page: 1,
                            per_page: 100,
                            direction: 'desc',
                            sort: 'pushed',
                            type: 'all',
                        })
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
            body: z.object({
                githubAccountLogin: z.string().min(1),
            }),
        },
    )
    .post(
        '/resolveFiles',
        async ({ request, state: store }) => {
            const body = await request.json()
            const { owner, basePath = '/', repo, paths } = body

            if (paths.length === 0) {
                throw new Error('Paths must be a non-empty array')
            }

            const orgId = store.orgId
            if (!orgId) {
                throw unauthorizedResponse
            }

            const githubInstallation =
                await prisma.githubInstallation.findFirst({
                    where: {
                        status: 'active',
                        memberLogins: {
                            has: store.githubUserLogin,
                        },
                        appId: env.GITHUB_APP_ID,
                        accountLogin: body.githubAccountLogin,
                    },
                })
            if (!githubInstallation) {
                throw new Error('No github installation found')
            }

            const installationId = githubInstallation.installationId
            const octokit = await getOctokit({ installationId })
            const [repoResult, ok] = await Promise.all([
                octokit.rest.repos.get({
                    owner,
                    repo,
                }),
                checkGitHubIsInstalled({ installationId }),
            ])

            if (!ok) {
                throw new Error('Github app no longer installed')
            }

            const branch = repoResult.data.default_branch
            const files = await getRepoFiles({
                fetchBlob(pagePath) {
                    return false
                },
                branch: branch,
                octokit: octokit.rest,
                owner,
                repo,
            })
            let allAssetPaths = files.map((x) => x.pagePath)

            const results = await Promise.all(
                paths.map(async (src) => {
                    const path = findMatchInPaths({
                        filePath: src,
                        paths: allAssetPaths,
                    })
                    if (!path) {
                        return null
                    }

                    try {
                        if (repoResult.data.private) {
                            const url = publicFileMapUrl({
                                owner,
                                repo,
                                branch,
                                imgPath: path,
                            })
                            const type = mime.getType(path)
                            return { url, type }
                        } else {
                            const { data: fileData } =
                                await octokit.rest.repos.getContent({
                                    owner,
                                    repo,
                                    path,
                                    ref: branch,
                                })

                            if (!('download_url' in fileData)) {
                                notifyError(
                                    new Error(
                                        'Could not get download url for image',
                                    ),
                                    'resolveFiles',
                                )
                                return null
                            }
                            if (fileData?.type !== 'file') {
                                notifyError(
                                    `Unsupported file type: ${fileData.type}`,
                                    'resolveFiles',
                                )
                                return null
                            }

                            const url = fileData.download_url
                            const type = mime.getType(fileData.name)
                            return { url, type }
                        }
                    } catch (error) {
                        console.error(
                            `Error resolving file at path ${path}:`,
                            error,
                        )
                        return null
                    }
                }),
            )

            return results.filter(Boolean)
        },
        {
            body: z.object({
                githubAccountLogin: z.string().min(1),
                owner: z.string().min(1),
                repo: z.string().min(1),
                basePath: z.string().optional(),
                paths: z.array(z.string().min(1)),
            }),
        },
    )
    .post(
        '/syncGithub',
        async ({ request, state: store }) => {
            const body = await request.json()
            let {
                owner,
                onlyGetFrontmatter,
                githubAccountLogin,
                basePath,
                repo,
            } = body
            if (!basePath) {
                basePath = ''
            }
            const orgId = store.orgId
            if (!orgId) {
                throw unauthorizedResponse
            }
            const githubInstallation =
                await prisma.githubInstallation.findFirst({
                    where: {
                        status: 'active',
                        memberLogins: {
                            has: store.githubUserLogin,
                        },
                        appId: env.GITHUB_APP_ID,
                        accountLogin: githubAccountLogin,
                    },
                })
            if (!githubInstallation) {
                throw new Error('No github installation found')
            }

            const installationId = githubInstallation.installationId
            const octokit = await getOctokit({ installationId })
            const [repoResult, ok] = await Promise.all([
                octokit.rest.repos.get({
                    owner,
                    repo,
                }),
                checkGitHubIsInstalled({ installationId }),
            ])
            if (!ok) {
                throw new Error('Github app no longer installed')
            }
            let branch = repoResult.data.default_branch
            const files = await getRepoFiles({
                fetchBlob(pagePath) {
                    return (
                        pagePath?.startsWith(basePath) && isMarkdown(pagePath)
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
                    x?.pagePath?.startsWith(basePath) && isMarkdown(x.pagePath)
                )
            })

            if (!filtered.length) {
                throw new Error(
                    `No files found in ${owner}/${repo} inside folder ${basePath || '/'}`,
                )
            }

            let mapImageUrl = publicFileMapUrl

            if (!onlyGetFrontmatter && repoResult.data.private) {
                mapImageUrl = async ({ imgPath, owner, repo, branch }) => {
                    try {
                        const res = await octokit.rest.repos.getContent({
                            owner,
                            repo,
                            path: imgPath,
                            ref: branch,
                        })
                        if (!('download_url' in res.data)) {
                            throw new Error(
                                'Could not get download url for image',
                            )
                        }
                        console.log('download url', res.data.download_url)
                        return res.data.download_url || ''
                    } catch (error) {
                        notifyError(
                            error,
                            'error getting download url for image',
                        )
                        throw error
                    }
                }
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
                        mapImageUrl,
                        extension: path.extname(x.pagePath),
                    })
                    return data
                }),
            )
            let properties: MarkdownPluginFrontMatter['properties'] = {}
            for (let file of withMarkdown) {
                if (!file?.frontMatter) {
                    continue
                }
                for (let [key, value] of Object.entries(file.frontMatter)) {
                    if (!properties[key]) {
                        properties[key] = {
                            values: [],
                            name: key,
                            id: key,
                        }
                    }
                    if (value != null) {
                        properties[key].values.push(value as any)
                    }
                }
            }
            const frontMatter: MarkdownPluginFrontMatter = {
                properties,
            }
            console.log(`finished syncing ${owner}/${repo}`)
            return {
                frontMatter,
                files: onlyGetFrontmatter ? [] : withMarkdown.filter(isTruthy),
            }
        },
        {
            body: z.object({
                owner: z.string(),
                repo: z.string(),
                basePath: z.string(),
                githubAccountLogin: z.string(),
                onlyGetFrontmatter: z.boolean().optional(),
                // userId: z.string(),
            }),
        },
    )

    .post(
        '/checkBasePath',
        async ({ request, state: store }) => {
            const body = await request.json()
            let { owner, githubAccountLogin, basePath, repo } = body

            const orgId = store.orgId
            if (!orgId) {
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
                        status: 'active',
                        memberLogins: {
                            has: store.githubUserLogin,
                        },
                        appId: env.GITHUB_APP_ID,
                        accountLogin: githubAccountLogin,
                    },
                })
            if (!githubInstallation) {
                throw new Error('No github installation found')
            }

            const installationId = githubInstallation.installationId
            const octokit = await getOctokit({ installationId })
            const [repoResult] = await Promise.all([
                octokit.rest.repos.get({
                    owner,
                    repo,
                }),
            ])
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
            body: z.object({
                owner: z.string(),
                repo: z.string(),
                basePath: z.string(),
                githubAccountLogin: z.string(),
                // userId: z.string(),
            }),
        },
    )

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
    values: string[]
    name: string
    id: string
}

export type MarkdownPluginFrontMatter = {
    properties: Record<string, MarkdownPluginFrontMatterProperty>
}

export async function publicFileMapUrl({
    owner,
    repo,
    branch,
    imgPath,
}: {
    owner: string
    repo: string
    branch: string
    imgPath: string
}) {
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}${imgPath}`
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
    onlyGetFrontmatter = false,
    mapImageUrl = publicFileMapUrl,
    extension,
}) {
    try {
        let imagesNotFound = [] as string[]
        const { frontmatter, html, foundMdx } = await markdownToHtml(
            content || '',
            extension,
        )
        if (onlyGetFrontmatter) {
            return {
                frontMatter: frontmatter,
            }
        }

        let title = ''

        // Parse HTML
        const handler = new DomHandler(async (error, dom) => {
            if (error) {
                throw error
            }

            // Find first h1 and set title to its content
            const walk = (nodes: any[]) => {
                for (const node of nodes) {
                    if (node.type === 'tag' && node.name === 'h1') {
                        const textNode = node.children[0]
                        if (textNode?.type === 'text') {
                            title = textNode.data
                            break
                        }
                    }
                    if (node.children) {
                        walk(node.children)
                    }
                }
            }
            walk(dom)
        })

        const parser = new Parser(handler, { decodeEntities: false })
        parser.write(html)
        parser.end()

        // Process links and images
        const processNodes = async (nodes: any[]) => {
            for (const [index, node] of nodes.slice().entries()) {
                if (node.type === 'tag') {
                    if (node.name === 'a') {
                        const href = node.attribs?.href
                        if (!isAbsoluteUrl(href)) {
                            const match = findMatchInPaths({
                                filePath: href,
                                paths: allAssetPaths,
                            })
                            if (match) {
                                const newHref = turnPagePathIntoSlug(
                                    match,
                                    basePath,
                                )
                                console.log(
                                    `replaced link href from ${JSON.stringify(href)} to ${JSON.stringify(newHref)}`,
                                )
                                node.attribs.href = newHref
                            }
                        }
                    }

                    if (node.name === 'img') {
                        try {
                            const src = node.attribs?.src
                            if (!src) {
                                console.log('no src found for img')
                                domutils.removeElement(node)
                                continue
                            }

                            const imgPath = findMatchInPaths({
                                filePath: src,
                                paths: allAssetPaths,
                            })
                            if (!imgPath) {
                                imagesNotFound.push(src)
                                console.log(`image not found in repo: ${src}`)
                                domutils.removeElement(node)
                                continue
                            }
                            if (!isAbsoluteUrl(imgPath)) {
                                console.log(
                                    `replaced link img from ${JSON.stringify(src)} to ${JSON.stringify(imgPath)}`,
                                )

                                let newSrc = await mapImageUrl({
                                    imgPath,
                                    owner,
                                    repo,
                                    branch,
                                })
                                if (!newSrc) {
                                    throw new Error(
                                        'Could not get github image url for image ' +
                                            imgPath,
                                    )
                                }
                                node.attribs.src = newSrc
                            }
                        } catch (e) {
                            notifyError(e, 'error transforming image src')
                            // Remove the image node
                            domutils.removeElement(node)
                        }
                    }

                    if (node.children) {
                        await processNodes(node.children)
                    }
                }
            }
        }

        await processNodes(handler.dom)

        const formattedHtml = domSerializer(handler.dom, {
            // xmlMode: true,
            encodeEntities: false,
            decodeEntities: false,
        })
        console.log('formattedHtml', formattedHtml)
        if (imagesNotFound.length) {
            console.log(
                `${imagesNotFound.length} images not found in ${pagePath}:`,
                imagesNotFound,
            )
        }

        let slug = turnPagePathIntoSlug(pagePath, basePath)
        if (!title) {
            console.log(`no title found for ${slug}, using page slug for it`)
            title = slug
        }
        if (frontmatter?.title) {
            title = frontmatter.title
        }

        return {
            pagePath,
            slug,
            path: pagePath,
            title,
            frontMatter: frontmatter.data,
            foundMdx,
            html: formattedHtml, // Using original HTML for now since we need to serialize DOM back to HTML
        }
    } catch (e) {
        onError?.(e)
    }
}
