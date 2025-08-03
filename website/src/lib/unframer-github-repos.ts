import dedent from 'string-dedent'
import crypto from 'crypto'

import { generateText, tool, wrapLanguageModel } from 'ai'
import { prisma } from 'db'
import { Octokit } from 'octokit'
import { Sema } from 'sema4'
import { unframerDemoUrl } from 'unframer-deploy-demo/src/utils'
import { Config, configFromFetch } from 'unframer-workspace/src/cli'
import { createExampleComponentCode } from 'unframer-workspace/src/exporter'
import { kebabCase } from 'unframer-workspace/src/utils'
import { env } from './env'
import {
    addUnframerGithubCollaboratorIfNeeded,
    createNewRepo,
    doesRepoExist,
    getRepoFiles,
    upsertGithubFile,
} from './github.server'
import { generateStackblitzFiles, isTruthy } from './utils'

import { google } from '@ai-sdk/google'
import { openai } from '@ai-sdk/openai'
import { Biome, Distribution } from '@biomejs/js-api'
import { createAiCacheMiddleware } from 'ai-cache'
import { createFallback } from 'ai-fallback'
import { z } from 'zod'
import { componentCamelCase } from 'unframer-workspace/src/typescript'

let biome: Biome
export function generateRepoName({ projectId, projectTitle }) {
    return kebabCase(projectTitle + ' ' + projectId.slice(0, 5))
}

export async function generateUnframerRepo({
    projectSecret = '',
    projectId,
    repo = '',
    projectTitle = '',
    addCollaboratorUsername = '',
    useAI = true,
}) {
    const [project] = await Promise.all([
        prisma.reactExportProject.findFirst({
            where: { projectId },
            include: {
                org: {
                    include: {
                        users: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        }),
    ])

    if (!project) {
        throw new Error('Project not found')
    }
    // If last sync was less than 10 minutes ago, skip repo update and email
    if (
        project.lastGitHubSyncAt &&
        Date.now() - new Date(project.lastGitHubSyncAt).getTime() <
            10 * 60 * 1000
    ) {
        console.log(
            'Last GitHub sync was less than 10 minutes ago; skipping repo update',
        )
        const addedCollaborator = await addUnframerGithubCollaboratorIfNeeded({
            addCollaboratorUsername,
            owner: 'unframer',
            projectId: projectId,
            repo,
        })

        return
    }
    if (!projectSecret) {
        projectSecret = crypto
            .createHash('sha256')
            .update(
                `unframer-secret-token-${projectId}-${env.SECRET!.slice(0, 5)}`,
            )
            .digest('hex')
            .slice(0, 16)
    }

    projectTitle = projectTitle || project?.projectName || 'untitled'
    repo ||= generateRepoName({ projectId, projectTitle })

    const { config } = await configFromFetch({ projectId })

    const { exampleCode } = await createExampleComponentCodeWithAI({
        config,
        outDir: 'framer',
        useAI,
    })
    if (!exampleCode) {
        return
    }
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

    const data = await upsertUnframerRepoWithFiles({
        files,
        repo,
        title: `React Components for ${projectTitle}`,
        addCollaboratorUsername,
        homepage: previewUrl,
    })

    const addedCollaborator = await addUnframerGithubCollaboratorIfNeeded({
        addCollaboratorUsername,
        owner: 'unframer',
        projectId: projectId,
        repo,
    })

    // Update lastGitHubSyncAt after successful repo upsert
    await prisma.reactExportProject.update({
        where: { projectId },
        data: {
            lastGitHubSyncAt: new Date(),
            connectedGitHubRepoName: data.repoName,
        },
    })
    return data
}

export async function upsertUnframerRepoWithFiles({
    files,
    repo,
    title,
    homepage,
    addCollaboratorUsername,
}: {
    files: { relativePath: string; contents: string }[]
    repo: string
    title?: string
    homepage?: string
    addCollaboratorUsername?: string
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
            files: files.map((file) => {
                let githubPath = file.relativePath
                if (githubPath.startsWith('/')) {
                    githubPath = githubPath.slice(1)
                }
                return {
                    filePath: githubPath,
                    content: file.contents,
                }
            }),
            addCollaboratorUsername,
            isGithubOrg: true,
            octokit: octokit.rest,
            owner,
            privateRepo: true,
            repo,
        })

        if (homepage || title)
            await octokit.rest.repos.update({
                owner,
                repo,
                description: title,
                homepage,
            })

        const url = `upserted https://github.com/${owner}/${repo}`
        console.log(url)
        return { url }
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
    const sema = new Sema(20)
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

    const url = `https://github.com/${owner}/${repo}`
    console.log(url)
    return { url, repoName: repo }
}

const model = wrapLanguageModel({
    middleware: [process.env.VITEST && createAiCacheMiddleware()].filter(
        isTruthy,
    ),
    model: createFallback({
        models: [
            openai('gpt-4.1'), //
            google('gemini-2.0-flash'),
        ],
    }),
})

export async function createExampleComponentCodeWithAI({
    outDir,
    config,
    useAI = true,
}: {
    outDir: string
    config: Config
    useAI: boolean
}) {
    const { exampleCode, outDirForExample } = await createExampleComponentCode({
        outDir,
        config,
    })
    if (!useAI) {
        return {
            exampleCode,
            outDirForExample,
        }
    }

    const imports = Object.keys(config.components)?.map((importPath) => {
        return `import ${componentCamelCase(importPath)} from './${outDirForExample}/${importPath}'`
    })
    if (!imports.length) {
        console.log(
            `no framer components found, not producing any Unframer example code`,
        )
        return { exampleCode: '' }
    }
    const prompt = dedent`
    Generate a component page that renders a few components in a single default export using typescript and tailwind, here is an example:

    \`\`\`tsx
    ${exampleCode}
    \`\`\`

    Every component must use the .Responsive static field to render a responsive variant of the component, just like in the example.

    That example component is already a good starting point but the components need to be reordered in a way that makes sense for a typical landing page for example: navbar first, then hero, then logos, testimonials, other components and then finally footer.

    You can also import new components, these are all the possible imports:

    \`\`\`tsx
    ${imports.join('\n')}
    \`\`\`

    > IMPORTANT! if a variable starts with a number fix it! in javascript variables and import names cannot start with a number! the example code may be wrong.

    BEFORE calling the generate_code tool, you MUST respond to these questions in a bullet list:

    - **What components will I use?** Only choose component paths from the ones available above. These are the ONLY imports possible. Any other import will fail.

    - **In what order should these components be?** Think about typical landing page structure (navbar, hero, logos, testimonials, footer, etc.)

    - **What props can I use?** ALWAYS only use the props that are already in the example code. Any other prop will fail.

    After answering these questions, return good valid code using the tool generate_code. Make sure the code is valid and has no duplicate import names or invalid tsx.

    After you call the tool generate_code successfully you can end the conversation, do not say anything after that.

    Keep the same top level tailwind bg class if present. Always keep the styles.css from the example. Use comments if they make the code easier to understand.
    `
    console.log('prompt', prompt)
    let outputCode = exampleCode
    console.time(`ai generate code for project ${config.projectId}`)
    const { text } = await generateText({
        stopWhen: (state) => state.steps?.length >= 30,
        providerOptions: {},
        tools: {
            generate_code: tool({
                inputSchema: z.object({
                    code: z.string(),
                }),
                description: `This tool needs to ALWAYS be called with the generated code.`,
                async execute({ code }) {
                    try {
                        console.log(`ai is generating code`, code)
                        if (outputCode) {
                            biome = await Biome.create({
                                distribution: Distribution.NODE,
                            })
                            let result = biome.formatContent(code, {
                                filePath: 'example.jsx',
                            })
                            outputCode = result.content
                        }
                        return `Code generated successfully`
                    } catch (e) {
                        console.log(
                            `LLM produced invalid code, generating again`,
                        )
                        return `code is invalid, generate it again: ${e.message}`
                    }
                },
            }),
        },
        prompt,
        model,
    })
    console.timeEnd(`ai generate code for project ${config.projectId}`)

    console.log(text)

    return {
        exampleCode: outputCode,
    }
}
