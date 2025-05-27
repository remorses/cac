import dedent from 'dedent'
import { Octokit } from 'octokit'
import { Sema } from 'sema4'
import { unframerDemoUrl } from 'unframer-deploy-demo/src/sdk'
import { createExampleComponentCode } from 'unframer-workspace/dist/exporter'
import { configFromFetch } from '../../../unframer/unframer/dist/cli'
import { env } from './env'
import {
    createNewRepo,
    doesRepoExist,
    getRepoFiles,
    upsertGithubFile,
} from './github.server'
import { generateStackblitzFiles } from './utils'

export async function generateUnframerRepo({
    secret,
    projectId,
    repo,
    projectTitle = 'Project',
}) {
    const { config } = await configFromFetch({ projectId })
    const { exampleCode } = await createExampleComponentCode({
        config,
        outDir: 'framer',
    })
    let files = generateStackblitzFiles({
        projectId,
        title: projectTitle,
        appComponentCode: exampleCode,
    })
    files.push({
        relativePath: 'README.md',
        contents: dedent`
            # ${projectTitle}

            This repo was exported from the Framer project ${projectTitle}

            ## Development

            Install dependencies:
            \`\`\`bash
            npm install
            \`\`\`

            Generate components from Framer:
            \`\`\`bash
            npm run framer
            \`\`\`

            Start development server:
            \`\`\`bash
            npm run dev
            \`\`\`

            ## Project Structure

            The \`package.json\` \`framer\` script generates the React components in the \`src/framer\` folder.

            The file \`src/App.tsx\` contains an example generated component with your components, you can modify it to change the appearence of your website. You can also pass Framer variables using props.


            `,
    })
    files.push({
        relativePath: '.github/workflows/ci.yml',
        contents: dedent`
      name: Build and release preview
      on:
        push:
      concurrency:
        group: \${{ github.workflow }}-\${{ github.event.pull_request.number || github.ref }}
        cancel-in-progress: true

      jobs:
        ci:
          timeout-minutes: 10
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v4
              with:
                node-version: 22
            - uses: oven-sh/setup-bun@v2
            - run: bun install
            - run: bun run framer
            - run: bun run build
            - run: bunx unframer-deploy-demo@latest --secret ${secret} --slug ${repo} --dir ./dist

      `,
    })
    const homepage = unframerDemoUrl({ basePath: repo })
    await upsertUnframerRepoWithFiles({
        files,
        repo,
        title: `React Components for ${projectTitle}`,
        homepage,
    })
}

export async function upsertUnframerRepoWithFiles({
    files,
    repo,
    title,
    homepage,
}: {
    files: { relativePath: string; contents: string }[]
    repo: string
    title?: string
    homepage?: string
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
                    content: `\n`,
                },
            ],
            isGithubOrg: true,
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

    await Promise.all([
        (title || homepage) &&
            (await octokit.rest.repos.update({
                owner,
                repo,
                description: title,
                homepage,
            })),
        ...files.map(async (file) => {
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
    ])

    console.log(`upserted https://github.com/${owner}/${repo}`)
}
