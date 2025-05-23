import { Octokit } from 'octokit'
import {
    createNewRepo,
    doesRepoExist,
    getOctokit,
    getRepoFiles,
    githubPathToPageSlug,
    upsertGithubFile,
} from './github.server'
import { env } from './env'
import path from 'path'
import { cwd } from 'process'
import { Sema } from 'sema4'
import { recursiveReaddir } from './__elysia-react-plugin'
import { generateStackblitzFiles } from './utils'

export async function generateUnframerRepo({ projectId, repo, title }) {
    const files = generateStackblitzFiles({ projectId, title })
    await upsertUnframerRepoWithFiles({ files, repo })
}

export async function upsertUnframerRepoWithFiles({
    files,
    repo,
}: {
    files: { relativePath: string; contents: string }[]
    repo: string
}) {
    const owner = 'unframer'
    const githubBranch = 'main'
    const octokit = new Octokit({ auth: env.GITHUB_TOKEN_UNFRAMER_ORG })

    const exists = await doesRepoExist({
        octokit: octokit.rest,
        owner,
        repo,
    })

    if (!exists) {
        await createNewRepo({
            files: [
                {
                    filePath: 'README.md',
                    content: `# Welcome to ${repo}`,
                },
            ],
            isGithubOrg: false,
            octokit: octokit.rest,
            owner,
            privateRepo: true,
            repo,
        })
    }

    const existingFiles = await getRepoFiles({
        fetchBlob(pagePath) {
            return false
        },
        branch: githubBranch,
        octokit: octokit.rest,
        owner,
        repo,
    })
    const filePathsRelative = new Set(
        files.map((x) => {
            return x.relativePath
        }),
    )
    const sema = new Sema(5)
    await Promise.all(
        existingFiles
            .filter((x) => {
                return x.sha && !filePathsRelative.has(x.githubPath)
            })
            .map(async (x) => {
                await sema.acquire()
                try {
                    console.log('deleting file', x.pagePath)
                    let githubPath = x.pagePath
                    if (githubPath.startsWith('/')) {
                        githubPath = githubPath.slice(1)
                    }
                    return octokit.rest.repos.deleteFile({
                        owner,
                        repo,
                        path: githubPath,
                        message: `Deleting file ${x.pagePath}`,
                        sha: x.sha!,
                        branch: githubBranch,
                    })
                } finally {
                    sema.release()
                }
            }),
    )

    await Promise.all(
        files.map(async (file) => {
            await sema.acquire()
            try {
                const code = file.contents
                let githubPath = file.relativePath
                if (githubPath.startsWith('/')) {
                    githubPath = githubPath.slice(1)
                }
                console.log('upserting file to github', githubPath)
                await upsertGithubFile({
                    code,
                    githubBranch,
                    githubPath,
                    octokit: octokit,
                    owner,
                    repo,
                })
            } finally {
                sema.release()
            }
        }),
    )

    console.log(`https://github.com/${owner}/${repo}`)
}
