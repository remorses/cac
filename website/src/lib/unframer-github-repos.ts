import dedent from 'string-dedent'
import * as crypto from 'node:crypto'

import { generateText, tool, wrapLanguageModel } from 'ai'
import { prisma } from 'db'
import { Octokit } from 'octokit'
import { unframerDemoUrl } from 'unframer-deploy-demo/src/utils'
import { Config, configFromFetch } from 'unframer-workspace/src/cli'
import { createExampleComponentCode } from 'unframer-workspace/src/exporter'
import { kebabCase } from 'unframer-workspace/src/utils'
import { env } from './env'
import {
    addUnframerGithubCollaboratorIfNeeded,
    commitFilesToBranch,
    createNewRepo,
    createRepoSecret,
    doesRepoExist,
    getRepoFiles,
} from './github.server'
import { isTruthy } from './utils'
import { generateStackblitzFiles } from 'unframer-workspace/src/stackblitz'

import { google } from '@ai-sdk/google'
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import { Biome, Distribution } from '@biomejs/js-api'
import { createAiCacheMiddleware } from 'ai-cache'
import { createFallback } from 'ai-fallback'
import { z } from 'zod'
import { componentCamelCase } from 'unframer-workspace/src/typescript'

let biome: Biome
export function generateRepoName({ projectId, projectTitle }) {
    // Use only projectId prefix if no title or title is 'untitled'
    // if (!projectTitle || projectTitle === 'untitled') {
    //     return projectId.slice(0, 16)
    // }
    // Include both title and projectId prefix for uniqueness
    return kebabCase(projectTitle + ' ' + projectId.slice(0, 5))
}

function normalizeGithubPath(path: string) {
    if (!path.startsWith('/')) {
        return path
    }

    return path.slice(1)
}

export function getChangedRepoFiles({
    files,
    existingFiles,
}: {
    files: { relativePath: string; contents: string }[]
    existingFiles: { githubPath?: string; content?: string }[]
}) {
    const existingContentsByPath = new Map(
        existingFiles
            .filter((file) => {
                return Boolean(file.githubPath)
            })
            .map((file) => {
                return [normalizeGithubPath(file.githubPath!), file.content || '']
            }),
    )

    return files
        .map((file) => {
            return {
                filePath: normalizeGithubPath(file.relativePath),
                content: file.contents,
            }
        })
        .filter((file) => {
            return existingContentsByPath.get(file.filePath) !== file.content
        })
}

export async function generateUnframerRepo({
    projectSecret = '',
    projectId,
    repo = '',
    projectTitle = '',
    addCollaboratorUsername = '',
    useAI = true,
    skipUpdateIfLastSyncLessThan = 10 * 60 * 1000,
}): Promise<{ url: string; repoName: string }> {
    repo ||= generateRepoName({ projectId, projectTitle })
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
        project.connectedGitHubRepoName &&
        Date.now() - new Date(project.lastGitHubSyncAt).getTime() <
            skipUpdateIfLastSyncLessThan
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

        return {
            url: `https://github.com/unframer/${project.connectedGitHubRepoName}`,
            repoName: project.connectedGitHubRepoName,
        }
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

    // Use the project name from database if no title was passed
    projectTitle = projectTitle || project?.projectName || ''

    const { config } = await configFromFetch({ projectId, agent: 'website' })

    const { exampleCode } = await createExampleComponentCodeWithAI({
        config,
        outDir: 'framer',
        useAI,
    })
    // if (!exampleCode) {
    //     return
    // }
    let files = generateStackblitzFiles({
        projectId,
        title: projectTitle,
        appComponentCode: exampleCode,
    })

    const previewUrl = unframerDemoUrl({ basePath: repo })
    const opencodePrompt =
        'The GitHub Actions workflow at .github/workflows/ci.yml just failed during CI. ' +
        'You are OpenCode running inside a post-failure handler with up to five minutes to work. ' +
        'Read the file at .github/workflows/ci.yml so you understand the steps and repeat them. ' +
        'Try to run those workflow steps again locally (bun run framer, bun run build, bunx unframer-deploy-demo), fix any issues that appear, rerun until they pass. ' +
        'If some imported files in App.tsx do not exist just remove them. ' +
        'After fixing and getting all steps to pass, commit and push the fixes just like the workflow does. ' +
        'Then exit with code 0 to mark the CI as successful. If you cannot fix the issues, exit with code 1.'
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
      permissions:
        contents: write

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
            - id: framer
              run: bun run framer
              continue-on-error: true
            - id: build
              run: bun run build
              continue-on-error: true
            - id: deploy
              run: bunx unframer-deploy-demo@latest --secret ${projectSecret} --slug ${repo} --dir ./dist
              continue-on-error: true
            - name: Commit & push (if changed)
              run: |
                git config user.name  "github-actions[bot]"
                git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

                git add -A
                if git diff --staged --quiet; then
                  echo "No changes to commit."
                  exit 0
                fi

                git pull --rebase origin "\${{ github.ref_name }}" || true
                git commit -m "chore: automated update [skip ci]"
                git push origin HEAD:"\${{ github.ref_name }}" || true
            - name: Auto-fix with OpenCode on failure
              if: \${{ (steps.framer.outcome == 'failure' || steps.build.outcome == 'failure' || steps.deploy.outcome == 'failure') && !cancelled() }}
              env:
                OPENCODE_API_KEY: \${{ secrets.OPENCODE_ZEN_API_KEY }}
              run: |
                npm install -g opencode-ai
                opencode run --model opencode/minimax-m2.5 "${opencodePrompt}"
            - name: Verify build succeeds
              if: \${{ (steps.framer.outcome == 'failure' || steps.build.outcome == 'failure' || steps.deploy.outcome == 'failure') && !cancelled() }}
              run: |
                bun run framer
                bun run build
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

        const url = `https://github.com/${owner}/${repo}`
        console.log(url)
        return { url, repoName: repo }
    }

    const filePathsRelative = new Set(
        files.map((x) => {
            return normalizeGithubPath(x.relativePath)
        }),
    )
    const existingFiles = await getRepoFiles({
        fetchBlob(file) {
            return filePathsRelative.has(normalizeGithubPath(file.path || ''))
        },
        branch: githubBranch,
        octokit: octokit.rest,
        owner,
        repo,
    })
    // await Promise.all(
    //     existingFiles
    //         .filter((x) => {
    //             return x.sha && !filePathsRelative.has(x.githubPath)
    //         })
    //         .map(async (x) => {
    //             await sema.acquire()
    //             try {
    //                 console.log('deleting file', x.pagePath)
    //                 let githubPath = x.pagePath
    //                 if (githubPath.startsWith('/')) {
    //                     githubPath = githubPath.slice(1)
    //                 }
    //                 return octokit.rest.repos.deleteFile({
    //                     owner,
    //                     repo,
    //                     path: githubPath,
    //                     message: `Deleting file ${x.pagePath}`,
    //                     sha: x.sha!,
    //                     branch: githubBranch,
    //                 })
    //             } finally {
    //                 sema.release()
    //             }
    //         }),
    // )

    const changedFiles = getChangedRepoFiles({
        files,
        existingFiles,
    })

    if (title || homepage) {
        await octokit.rest.repos.update({
            owner,
            repo,
            description: title,
            homepage,
        })
    }

    await createRepoSecret({
        octokit: octokit.rest,
        owner,
        repo,
        secretName: 'OPENCODE_ZEN_API_KEY',
        secretValue: env.OPENCODE_ZEN_API_KEY!,
    })

    await commitFilesToBranch({
        octokit: octokit.rest,
        owner,
        repo,
        branch: githubBranch,
        files: changedFiles,
    })

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
            google('gemini-2.5-flash'), //
            openai.responses('gpt-5-mini'),
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

    // Build prompt differently based on whether we have example code
    let prompt = ''
    if (exampleCode) {
        prompt = dedent`
        Generate a component page that renders a few components in a single default export using typescript and tailwind, here is an example:

        \`\`\`tsx
        ${exampleCode}
        \`\`\`

        Every component must use the .Responsive static field to render a responsive variant of the component, just like in the example.

        That example component is already a good starting point but the components need to be reordered in a way that makes sense for a typical landing page for example: navbar first, then hero, then logos, testimonials, other components and then finally footer.
        `
    } else {
        // No example code, create from scratch
        const containerClasses = config.pageBackgroundColor
            ? `bg-[${config.pageBackgroundColor.replace(/ /g, '_')}]`
            : ''

        prompt = dedent`
        Generate a component page that renders components in a single default export using typescript and tailwind.

        The component should follow this structure:

        \`\`\`tsx
        import './framer/styles.css'

        // Component imports here

        export default function App() {
          return (
            <div className='flex flex-col items-center gap-3 ${containerClasses}'>
              // Components here
            </div>
          );
        };
        \`\`\`

        Every component must use the .Responsive static field to render a responsive variant of the component, like this:
        <ComponentName.Responsive />

        Order the components in a way that makes sense for a typical landing page: navbar first, then hero, then logos, testimonials, other components and then finally footer.
        `
    }

    prompt += dedent`

    You can import these components, these are all the possible imports:

    \`\`\`tsx
    ${imports.join('\n')}
    \`\`\`

    BEFORE calling the generate_code tool, you MUST respond to these questions in a bullet list:

    - **What components will I use?** Only choose component paths from the ones available above. These are the ONLY imports possible. Any other import will fail.

    - **In what order should these components be?** Think about typical landing page structure (navbar, hero, logos, testimonials, footer, etc.)

    - **What props can I use?** Do NOT add any props that are not already in the example code. Any other prop will fail.

    After answering these questions, return good valid code using the tool generate_code. Make sure the code is valid and has no duplicate import names or invalid tsx.

    After you call the tool generate_code successfully you can end the conversation, do not say anything after that.

    Keep the same top level tailwind bg class if present. Always keep the styles.css import. Use comments if they make the code easier to understand.
    `
    console.log('prompt', prompt)
    let outputCode = exampleCode || '' // Default to empty string if no example code
    console.time(`ai generate code for project ${config.projectId}`)
    const { text } = await generateText({
        model,
        stopWhen: (state) => state.steps?.length >= 30,
        providerOptions: {
            openai: {
                reasoningEffort: 'low',
            } satisfies OpenAIResponsesProviderOptions,
        },

        tools: {
            generate_code: tool({
                inputSchema: z.object({
                    code: z.string(),
                }),
                description: `This tool needs to ALWAYS be called with the generated code.`,
                async execute({ code }) {
                    try {
                        console.log(`ai is generating code`, code)
                        // Always format and set the code, even if no example code exists
                        biome = await Biome.create({
                            distribution: Distribution.NODE,
                        })
                        let result = biome.formatContent(code, {
                            filePath: 'example.jsx',
                        })
                        outputCode = result.content
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
    })
    console.timeEnd(`ai generate code for project ${config.projectId}`)

    console.log(text)

    return {
        exampleCode: outputCode || exampleCode,
    }
}
