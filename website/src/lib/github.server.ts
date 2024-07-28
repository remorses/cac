import { App, OAuthApp, Octokit } from 'octokit'
import { env } from './env'
import { isTruthy } from 'website/src/lib/utils'
import { Sema } from 'async-sema'
import { prisma } from 'db/prisma'
import { db } from 'db/kysely'

type OctokitRest = Octokit['rest']

// data passed back to framer after login, to tell it what org to use
export type GithubLoginRequestData = {
    githubAccountLogin: string
}

export function getGithubApp(): App {
    const app = new App({
        appId: env.GITHUB_APP_ID!,
        privateKey: env.GITHUB_APP_PRIVATE_KEY!,

        oauth: {
            clientId: env.GITHUB_CLIENT_ID!,
            clientSecret: env.GITHUB_CLIENT_SECRET!,
            allowSignup: true,
        },

        webhooks: {
            secret: env.SECRET!,
        },
    })
    return app
}

export async function checkGitHubIsInstalled({ installationId }) {
    try {
        const octokit = await getGithubApp()

        const installation = await octokit.octokit.rest.apps.getInstallation({
            installation_id: installationId,
        })
        return !!installation.data.id
    } catch (e) {
        if (e.status === 404) {
            await prisma.githubInstallation.updateMany({
                where: {
                    installationId: installationId,
                },
                data: {
                    status: 'suspended',
                },
            })
            return false
        }
        throw e
    }
}

export async function getOctokit({ installationId }): Promise<Octokit> {
    installationId = Number(installationId)
    // const cached = installationsCache.get(installationId)
    // if (cached) {
    //     return cached
    // }
    const app = getGithubApp()

    // https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation
    const octokit = await app.getInstallationOctokit(installationId)
    // .catch(handleOctokitError(installationId))
    // installationsCache.set(installationId, octokit)
    return octokit
}

export async function getRepoFiles({
    branch,
    owner,
    repo,
    octokit,
    commitSha,
    fetchBlob,
    baseUrl,
}: {
    octokit: OctokitRest
    owner: string
    repo: string
    branch: string
    commitSha?: string
    baseUrl?: string
    fetchBlob: (p: string) => boolean
}) {
    if (!commitSha) {
        console.log(`getting current commit for ${branch}`)
        let currentCommit = await getCurrentCommit({
            octokit,
            owner,
            repo,
            branch,
        })
        commitSha = currentCommit.commitSha
    }
    console.log(`getting github tree ${commitSha}`)
    const tree = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: commitSha,
        recursive: 'true',
        baseUrl,
    })

    const markdownFiles = tree.data.tree.filter((file) => {
        if (file.type !== 'blob') {
            return false
        }
        // if (filter) {
        //     return filter(file)
        // }
        return true
    })
    console.log(
        `found ${markdownFiles.length} markdown files in repo ${owner}/${repo}`,
    )
    const sema = new Sema(10)
    const downloadedFiles = await Promise.all(
        markdownFiles.map(async (file) => {
            try {
                await sema.acquire()
                let pagePath = githubPathToPagePath(file.path || '')
                if (!pagePath) {
                    return
                }
                // console.log(`getting blob for ${file.path}`)
                if (!fetchBlob(pagePath)) {
                    return {
                        pagePath,
                        size: file.size,
                    }
                }
                const { data } = await octokit.git.getBlob({
                    owner,
                    repo,
                    file_sha: file.sha!,
                    baseUrl,
                })
                const contents = Buffer.from(data.content, 'base64').toString(
                    'utf-8',
                )

                return {
                    pagePath: pagePath,
                    content: contents!,
                    size: file.size,
                    sha: file.sha,
                }
            } finally {
                sema.release()
            }
        }),
    )
    return downloadedFiles.filter(isTruthy)
}

// always adds the / at the front
export function githubPathToPagePath(path?: string) {
    if (!path) {
        return ''
    }
    if (!path.startsWith('/')) {
        path = `/${path}`
    }

    return path
}
export const getCurrentCommit = async ({
    octokit,
    owner,
    repo,
    branch,
}: {
    octokit: OctokitRest
    owner: string
    repo: string
    branch: string
}) => {
    console.log(`getting ref ${branch}`)
    const { data: refData } = await octokit.git.getRef({
        owner: owner,
        repo,
        ref: `heads/${branch}`,
    })
    const commitSha = refData.object.sha
    console.log(`getting commit ${commitSha}`)
    const { data: commitData } = await octokit.git.getCommit({
        owner: owner,
        repo,
        commit_sha: commitSha,
    })
    return {
        commitSha,
        treeSha: commitData.tree.sha,
    }
}

export function isMarkdown(p: string) {
    return p.endsWith('.md') || p.endsWith('.markdown') || p.endsWith('.mdx')
}

export async function getGithubUserLogin({ userId }) {
    const githubAccount = await db
        .selectFrom('auth.identities')
        .where('provider', '=', 'github')
        .where('user_id', '=', userId)
        .selectAll()
        .executeTakeFirst()
    if (!githubAccount) {
        throw new Error('Github account not found for user')
    }
    const githubLogin = (githubAccount?.identity_data as any)?.user_name
    if (!githubLogin) {
        throw new Error('Github login not found for user')
    }
    return githubLogin || ''
}
