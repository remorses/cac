import dedent from 'dedent'
import { Octokit } from 'octokit'
import { Sema } from 'sema4'
import { unframerDemoUrl } from 'unframer-deploy-demo/src/utils'
import { createExampleComponentCode } from 'unframer-workspace/src/exporter'
import { configFromFetch } from 'unframer-workspace/src/cli'
import { env } from './env'
import {
    createNewRepo,
    doesRepoExist,
    getRepoFiles,
    upsertGithubFile,
} from './github.server'
import { generateStackblitzFiles } from './utils'
import { prisma } from 'db'
import { kebabCase } from 'unframer-workspace/src/utils'

export function generateRepoName({ projectId, projectTitle }) {
    return kebabCase(projectTitle + ' ' + projectId.slice(0, 5))
}

export async function generateUnframerRepo({
    projectSecret,
    projectId,
    repo = '',
    projectTitle = '',
}) {
    const project = await prisma.reactExportProject.findFirst({
        where: { projectId },
    })

    projectTitle = projectTitle || project?.projectName || 'untitled'
    repo ||= generateRepoName({ projectId, projectTitle })
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

    const previewUrl = unframerDemoUrl({ basePath: repo })
    files.push({
        relativePath: 'README.md',
        contents: dedent`
            # ${projectTitle}

            This repo was exported from the Framer project "${projectTitle}"

            This is just an example showcasing how to import the components and render them for your project. You will need to tweak a few styles and code to make the website look the same as Framer, for example changing the background color. You will also need to add other pages manually, following [App.tsx](./src/App.tsx) as an example.

            ## Preview of your website

            An example preview of your website is already deployed [here](${previewUrl}). If there are any styles issues like wrong background color you can easily fix it with a little bit of code. When you push new commits to this repository that website will be automatically updated.

            ## Customizing styles and content

            The important code is inside [App.tsx](./src/App.tsx), it imports the Framer styles and your project React components. You can customize them using Tailwind classes and passing props, each Framer variable becomes a customizable React prop.

            To customize content you can also change the content directly in Framer and sync again. CMS content will need to run \`npm run framer\` to be synced with your code too.

            ## Sync changes from Framer

            After you make changes inside the Framer project you can run again the command \`npm run framer\` to download the latest changes from your Framer project. If you add new components or pages you will also need to run the React Export plugin again first.

            ## Development

            Install dependencies:
            \`\`\`bash
            npm install
            \`\`\`

            Generate component files from Framer:
            \`\`\`bash
            npm run framer
            \`\`\`

            Start development server:
            \`\`\`bash
            npm run dev
            \`\`\`

            ## Project Structure

            The \`package.json\` \`framer\` script generates the React components in the \`src/framer\` folder. These files are machine generated and should not be updated manually, instead you can update the content directly in Framer and sync again. You can also use Framer variables to update content from code using React props. This works even for callbacks like \`onClick\`.

            The file [App.tsx](./src/App.tsx) contains an example generated component with your components, you can modify it to change the appearence of your website. You can also pass Framer variables using props.


            ## More info

            You can read more documentation in [the Unframer repository](https://github.com/remorses/unframer)

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
            - run: bunx unframer-deploy-demo@latest --secret ${projectSecret} --slug ${repo} --dir ./dist

      `,
    })

    await upsertUnframerRepoWithFiles({
        files,
        repo,
        title: `React Components for ${projectTitle}`,
        homepage: previewUrl,
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
