import { App, OAuthApp, Octokit } from 'octokit'
import { env } from './env'
import { isTruthy } from 'website/src/lib/utils'
import { Sema } from 'async-sema'
import { GithubInstallation, prisma } from 'db'
import { db } from 'db/kysely'
import { AppError, notifyError } from 'website/src/lib/errors'
import * as https from 'https'

type OctokitRest = Octokit['rest']

// data passed back to framer after login, to tell it what org to use
export type GithubLoginRequestData = {
    githubAccountLogin: string
}

const agent = new https.Agent({ keepAlive: true })

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

        request: { agent },
    })
    return app
}

export async function checkGitHubIsInstalled({ installationId }) {
    try {
        const octokit = await getGithubApp()

        const installation = await withRetry(
            () =>
                octokit.octokit.rest.apps.getInstallation({
                    installation_id: installationId,
                }),
            { maxRetries: 3, initialDelay: 1000 },
        )
        return !!installation.data.id
    } catch (e) {
        if (e.status === 404) {
            await prisma.githubInstallation.updateMany({
                where: {
                    installationId: installationId,
                    // appId: env.GITHUB_APP_ID,
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
    const octokit = await withRetry(
        () => app.getInstallationOctokit(installationId),
        { maxRetries: 3, initialDelay: 1000 },
    )
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
    signal,
}: {
    octokit: OctokitRest
    owner: string
    repo: string
    branch: string
    commitSha?: string
    baseUrl?: string
    fetchBlob: (p: {
        path?: string
        sha?: string
        type?: string
        mode?: string
    }) => boolean
    signal?: AbortSignal
}) {
    if (!commitSha) {
        console.log(`getting current commit for ${branch}`)
        const { data: commitData } = await octokit.git.getRef({
            owner,
            repo,
            ref: `heads/${branch}`,
            request: { signal },
        })
        commitSha = commitData.object.sha
    }
    console.log(`getting github tree ${commitSha}`)
    const tree = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: commitSha,
        recursive: 'true',
        baseUrl,
        request: { signal },
    })

    const files = tree.data.tree.filter((file) => {
        if (file.type !== 'blob') {
            return false
        }
        // if (filter) {
        //     return filter(file)
        // }
        return true
    })
    console.log(`found ${files.length} files in repo ${owner}/${repo}`)
    const sema = new Sema(20)
    const downloadedFiles = await Promise.all(
        files.map(async (file) => {
            try {
                await sema.acquire()
                let pagePath = githubPathToPageSlug(file.path || '')
                if (!pagePath) {
                    return
                }
                // console.log(`getting blob for ${file.path}`)
                if (!fetchBlob(file)) {
                    return {
                        pagePath,
                        githubPath: file.path,
                        size: file.size,
                        sha: file.sha,
                        type: file.type,
                    }
                }
                console.log(
                    `fetching blog for ${file.path} in ${owner}/${repo}`,
                )
                const [{ data }] = await Promise.all([
                    octokit.git.getBlob({
                        owner,
                        repo,
                        file_sha: file.sha!,
                        baseUrl,
                        request: { signal },
                    }),
                    // octokit.repos.getCommit({
                    //     owner,
                    //     repo,
                    //     ref: file.sha!,
                    // }),
                ])

                const contents = Buffer.from(data.content, 'base64').toString(
                    'utf-8',
                )

                return {
                    pagePath: pagePath,
                    content: contents! || '',
                    size: file.size,
                    sha: file.sha,
                    githubPath: file.path,
                }
            } finally {
                sema.release()
            }
        }),
    )
    return downloadedFiles.filter(isTruthy)
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
        throw new Error(
            'Github account not found for user ' + JSON.stringify(userId),
        )
    }
    const githubLogin = (githubAccount?.identity_data as any)?.user_name
    if (!githubLogin) {
        throw new Error('Github login not found for user')
    }
    return githubLogin || ''
}

export async function upsertGithubFile({
    octokit,
    owner,
    repo,
    githubBranch,
    githubPath,
    code,
}: {
    octokit: Octokit
    owner: string
    repo: string
    githubBranch: string
    githubPath: string
    code: string
}): Promise<void> {
    const githubFile = await getGithubFile({
        githubBranch: githubBranch!,
        githubPath,
        owner,
        repo,
        octokit: octokit.rest,
    })

    const { content: pastContent, sha } = githubFile || {
        content: '',
        sha: undefined,
    }
    if (pastContent === code) {
        console.log(`Ignoring update for ${githubPath}, same content`)
        return
    }
    const base64New = Buffer.from(code).toString('base64')
    const { data } = await withRetry(
        () =>
            octokit.rest.repos.createOrUpdateFileContents({
                owner: owner,
                repo: repo,
                path: githubPath,
                message: getCommitMessage({
                    filePaths: [githubPath],
                }),
                content: base64New,
                sha,
                branch: githubBranch,
                committer: committer,
            }),
        { maxRetries: 3, initialDelay: 1000 },
    ).catch((e) => {
        notifyError(
            e,
            `Could not update github file ${owner}/${repo}/${githubBranch}, path ${githubPath} `,
        )
        return { data: null }
    })
    if (!data) {
        return
    }
    // https://github.com/org-for-testing-knowledg/test-uploads/commit/dc322ec5fa21803eb8108a5ef9bc10b58f087d8f
    let url = `https://github.com/${owner}/${repo}/commit/${data.commit.sha}`
}

export function githubPathToPageSlug(path?: string) {
    if (!path) {
        return ''
    }
    if (!path.startsWith('/')) {
        path = `/${path}`
    }

    return path
}

// Credit to https://dev.to/lucis/how-to-push-files-programatically-to-a-repository-using-octokit-with-typescript-1nj0

export async function doesRepoExist({
    octokit,
    owner,
    repo,
}: {
    octokit: OctokitRest
    owner: string
    repo: string
}) {
    try {
        const res = await withRetry(
            () =>
                octokit.repos.get({
                    owner,
                    repo,
                }),
            { maxRetries: 3, initialDelay: 1000 },
        )
        console.log(`Repository ${owner}/${repo} exists.`)
        return res.data
    } catch (error) {
        if (error.status === 404) {
            return null
        } else {
            throw new Error(
                `Error checking repository ${owner}/${repo}: ${error.message}`,
            )
        }
    }
}

export async function createNewRepo({
    // branch,
    files,
    repo,
    isGithubOrg,
    owner,
    octokit,
    privateRepo = true,
    oauthToken,
    addEmailAsContributor,
}: {
    owner
    isGithubOrg
    files: { filePath: string; content: string }[]
    repo: string
    octokit: Octokit['rest']
    privateRepo: boolean
    oauthToken?: string
    addEmailAsContributor?: string
}) {
    files = files.filter((x) => {
        return true
        // return githubPathToPageSlug(x.filePath) !== TUTORIAL_PAGE_SLUG
    })
    // const owner = github.accountLogin
    // const isGithubOrg = github.accountType === 'ORGANIZATION'
    // const installationId = github.installationId
    // const octokit = (await getOctokit({ installationId })).rest

    console.log(`uploading files to github ${owner}/${repo}`)
    console.log(`creating repo for ${isGithubOrg ? 'org' : 'user'} ${owner}`)
    // Use the correct octokit instance for subsequent operations
    let repoOctokit = octokit

    const create = async (
        args: Parameters<typeof octokit.repos.createInOrg>[0],
    ) => {
        if (isGithubOrg) {
            return await octokit.repos.createInOrg(args)
        } else {
            const octokit = new Octokit({
                auth: oauthToken,
            }).rest

            return await octokit.repos.createForAuthenticatedUser(args)
        }
    }
    const { data: repoResult } = await create({
        org: owner,
        name: repo,
        private: privateRepo,
        description: `Repository created using Unframer`,
        has_wiki: false,
        auto_init: true,
    }).catch((e) => {
        if (e.status === 422) {
            throw new AppError(`Repository name already used`)
        }
        throw e
    })
    const defaultBranch = repoResult.default_branch

    // Get the existing commit SHA from the auto-initialized repo
    const { data: refData } = await repoOctokit.git.getRef({
        owner: owner,
        repo,
        ref: `heads/${defaultBranch}`,
    })
    const commitSha = refData.object.sha
    console.log(`getting commit ${commitSha}`)
    const { data: commitData } = await repoOctokit.git.getCommit({
        owner: owner,
        repo,
        commit_sha: commitSha,
    })
    const treeSha = commitData.tree.sha
    // const baseBranchRef = await octokit.git.getRef({
    //     owner,
    //     repo,
    //     ref: `heads/${repoResult.default_branch}`,
    // })
    // await octokit.git.createRef({
    //     owner,
    //     repo,
    //     ref: `refs/heads/${branch}`,
    //     sha: baseBranchRef.data.object.sha,
    // })
    if (!files.length) {
        return
    }

    // Start collaborator lookup early but don't await it yet
    const addCollaboratorPromise = addGithubCollaboratorIfNeeded({
        addEmailAsContributor,
        owner,
        repo,
        octokit: repoOctokit,
    })

    console.log(`creating git blobs`)

    // Build tree in one call with inline content for small files
    const treeItems = await Promise.all(
        files.map(async (f) => {
            if (Buffer.byteLength(f.content, 'utf8') <= 100_000) {
                return {
                    path: f.filePath,
                    mode: '100644' as const,
                    type: 'blob' as const,
                    content: f.content,
                }
            }
            // Fallback for big files
            const { data: blob } = await repoOctokit.git.createBlob({
                owner,
                repo,
                content: f.content,
                encoding: 'utf-8',
            })
            return {
                path: f.filePath,
                mode: '100644' as const,
                type: 'blob' as const,
                sha: blob.sha,
            }
        }),
    )
console.log('creating tree with inline content')
    const { data: tree } = await repoOctokit.git.createTree({
        owner,
        repo,
        tree: treeItems,
        base_tree: treeSha,
    })

    // Create the first commit with all of the file changes
    console.log('creating commit')

    const { data: commit } = await repoOctokit.git.createCommit({
        owner: owner,
        repo,
        message: `Unframer Initial Commit`,
        tree: tree.sha,
        committer: committer,
        parents: [commitSha], // Use the existing commit as parent
    })

    try {
        console.log('updating branch')
        // Update the existing branch with our new commit
        await repoOctokit.git.updateRef({
            owner: owner,
            repo,
            ref: `heads/${defaultBranch}`,
            sha: commit.sha,
        })
    } catch (err) {
        throw err
    }

    console.log(`waiting for collaborator addition`)
    const addedCollaborator = await addCollaboratorPromise

    return {
        branch: defaultBranch,
        githubRepoId: String(repoResult.id),
        addedCollaborator,
    }
}

// Add collaborator if email is provided
async function addGithubCollaboratorIfNeeded({
    addEmailAsContributor,
    owner,
    repo,
    octokit,
}: {
    addEmailAsContributor?: string
    owner: string
    repo: string
    octokit: Octokit['rest']
}) {
    let addedCollaborator = false
    if (!addEmailAsContributor) {
        return addedCollaborator
    }
    try {
        // First, try to get the user by email with retry logic
        const { data: userData } = await withRetry(
            () =>
                octokit.search.users({
                    q: `${addEmailAsContributor} in:email`,
                    per_page: 1,
                }),
            { maxRetries: 3, initialDelay: 1000 },
        )

        if (userData.items && userData.items.length > 0) {
            const username = userData.items[0].login

            // Add the user as a collaborator with maintain permission with retry logic
            await withRetry(
                () =>
                    octokit.repos.addCollaborator({
                        owner,
                        repo,
                        username,
                        permission: 'maintain',
                    }),
                { maxRetries: 3, initialDelay: 1000 },
            )

            addedCollaborator = true
            console.log(
                `Successfully added ${username} as collaborator to ${owner}/${repo}`,
            )
        } else {
            console.log(
                `Could not find GitHub user with email ${addEmailAsContributor}`,
            )
        }
    } catch (error) {
        console.error(`Failed to add github collaborator: ${error.message}`)
        notifyError(
            error,
            `Failed to add collaborator ${addEmailAsContributor} to ${owner}/${repo}`,
        )
    } finally {
        return addedCollaborator
    }
}

export const createNewTree = async ({
    create,
    octokit,
    owner,
    parentTreeSha,
    repo,
}: {
    octokit: OctokitRest
    owner: string
    repo: string
    create: { filePath: string; blobSha: string }[]
    parentTreeSha: string
}) => {
    if (!parentTreeSha) {
        throw new AppError(`No parent tree sha`)
    }

    const tree = create.map(({ blobSha, filePath }, index) => ({
        path: filePath,
        mode: `100644`,
        type: `blob`,
        sha: blobSha as string | null,
    })) as any[]

    console.log('creating new tree')
    const { data } = await octokit.git.createTree({
        owner,
        repo,
        tree,
        base_tree: parentTreeSha,
    })
    return data
}

export async function pushChangesToNewBranch({
    files,
    owner,
    repo,
    branch,
    octokit,
    baseBranch,
}: {
    octokit: OctokitRest
    files: { filePath: string; content: string }[]
    owner: string
    repo: string
    branch: string
    baseBranch: string
}) {
    const { data: refData } = await octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`,
    })
    let commitSha = refData.object.sha
    console.log(`getting commit ${commitSha}`)
    const { data: commitData } = await octokit.git.getCommit({
        owner: owner,
        repo,
        commit_sha: commitSha,
    })
    const treeSha = commitData.tree.sha

    console.log(
        'creating blobs for',
        files.map((x) => x.filePath),
    )
    const withBlobs = await Promise.all(
        files.map(async (x) => {
            const encoding = 'utf-8'
            const blobData = await octokit.git.createBlob({
                owner,
                repo,
                content: x.content,
                encoding,
            })
            return {
                ...x,
                blobSha: blobData.data.sha,
                blob: blobData.data,
            }
        }),
    )

    const newTree = await createNewTree({
        octokit,
        owner,
        repo,
        create: withBlobs,
        parentTreeSha: treeSha,
    })

    console.log('creating commit')
    const { data: newCommit } = await octokit.git.createCommit({
        owner: owner,
        repo,
        message: getCommitMessage({
            filePaths: files.map((x) => x.filePath),
        }),
        tree: newTree.sha,

        committer: committer,
        parents: [commitSha],
    })

    // creates the branch
    await octokit.git.createRef({
        owner: owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: newCommit.sha,
    })
    return {}
}

export const committer = {
    name: 'Unframer',
    email: 'info@unframer.co',
}

export function getCommitMessage({ filePaths = [] as string[] }) {
    const files = filePaths
        .map((x) => {
            if (x.startsWith('/')) {
                x = x.slice(1)
            }
            return x
        })
        .map((x) => '`' + x + '`')
        .join(', ')
    const message = `Update ${files}`
    return message
}

export async function getGithubFile({
    octokit,
    owner,
    githubPath,
    repo,
    githubBranch,
    baseUrl,
}: {
    octokit: OctokitRest
    owner: string
    githubPath: string
    repo: string
    githubBranch: string
    baseUrl?: string
}) {
    if (!githubPath) {
        return null
    }
    try {
        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: githubPath,
            branch: githubBranch,
            ref: githubBranch,
            baseUrl,
        })
        if ('type' in data && data.type === 'file') {
            let base64 = data.content
            let sha = data.sha
            let content = Buffer.from(base64 || '', 'base64').toString('utf-8')
            return { content, sha }
        }
    } catch (e) {}
    return null
}

export type RetryOptions = {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffFactor?: number
    retryIf?: (error: any) => boolean
}

export const isRetryableError = (error: any): boolean => {
    if (!error) return false

    // HTTP status codes that should be retried
    const retryableStatusCodes = [
        408, // Request Timeout
        429, // Too Many Requests
        500, // Internal Server Error
        502, // Bad Gateway
        503, // Service Unavailable
        504, // Gateway Timeout
    ]

    // Check for status code in error
    if (error.status && retryableStatusCodes.includes(error.status)) {
        return true
    }

    // Check for network errors
    if (
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT'
    ) {
        return true
    }

    // Check for timeout errors
    if (error.message && error.message.includes('timeout')) {
        return true
    }

    return false
}

export const withRetry = async <T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
): Promise<T> => {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        backoffFactor = 2,
        retryIf = isRetryableError,
    } = options

    let lastError: any
    let delay = initialDelay

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error

            if (attempt === maxRetries || !retryIf(error)) {
                throw error
            }

            console.log(
                `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
                {
                    error: error.message || error,
                    status: error.status,
                    code: error.code,
                },
            )

            await new Promise((resolve) => setTimeout(resolve, delay))
            delay = Math.min(delay * backoffFactor, maxDelay)
        }
    }

    throw lastError
}
