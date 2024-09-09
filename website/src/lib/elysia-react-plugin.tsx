import { Spiceflow } from 'spiceflow'
import { Sema } from 'sema4'
import fs from 'fs'
import GithubSlugger from 'github-slugger'
import path from 'path'
import os from 'os'
import { bundle } from 'unframer-workspace/dist/exporter'
import matter from 'gray-matter'

import { notifyError } from 'website/src/lib/errors'

import { db } from 'db/kysely'
import { prisma } from 'db/prisma'
import { marked } from 'marked'
import { Octokit } from 'octokit'
import {
    checkGitHubIsInstalled,
    createNewRepo,
    doesRepoExist,
    getGithubUserLogin,
    getOctokit,
    getRepoFiles,
    githubPathToPageSlug,
    isMarkdown,
    upsertGithubFile,
} from 'website/src/lib/github.server'
import {
    generateSecurePassword,
    isTruthy,
    sortByKey,
} from 'website/src/lib/utils'
import { env } from 'website/src/lib/env'
import { z } from 'zod'
import dedent from 'dedent'
import { ControlType } from 'unframer'

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

export const componentObjectSchema = z.object({
    name: z.string(),
    url: z.string(),
})

export type ComponentObject = z.infer<typeof componentObjectSchema>

export const reactPluginApp = new Spiceflow({
    basePath: '/reactExportPlugin',
})

    .state('githubUserLogin', '')
    .state('orgId', '')
    .state('userId', '')

    .use(async function addGithubUserLogin({ request, state: store }) {
        const pathname = new URL(request.url).pathname
        if (!pathname.includes('/reactExportPlugin')) {
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
        '/pushGithub',
        async ({ request, state: store }) => {
            const body = await request.json()
            let { owner, githubAccountLogin, basePath, repo, components } = body
            if (!repo) {
                repo = `unframer-react-components-${generateSecurePassword(3)}`
            }
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
                    github: githubInstallation,
                    privateRepo: true,
                    repo,
                })
            }
            const cwd = path.resolve(
                process.cwd(),
                'outputs',
                generateSecurePassword(10),
            )
            const slugger = new GithubSlugger()
            const githubBranch = exists?.default_branch || 'main'
            const repoUrl = `https://github.com/${owner}/${repo}`

            try {
                const res = await bundle({
                    components: Object.fromEntries(
                        sortByKey(components, (x) => x.name).map((c) => {
                            const slug = slugger.slug(c.name)
                            return [slug, c.url]
                        }),
                    ),
                    cwd: path.resolve(cwd, 'components'),
                    signal: request.signal,
                })

                fs.writeFileSync(
                    path.resolve(cwd, 'README.md'),
                    dedent`
                ## Install in a workspace

                \`\`\`sh
                git submodule add ${repoUrl}.git
                \`\`\`

            
                Add the folder to your workspace packages in root \`package.json\`:

                \`\`\`json
                {
                    "workspaces": [
                        "packages/*",
                        "${repo}"
                    ]
                }
                \`\`\`

                ## Update the submodule

                To fetch the new components code you just update the submodule

                \`\`\`sh
                git submodule update --remote
                \`\`\`

                ## Install as an npm package

                To install this repository as an npm package, follow these steps:

                1. Install the package using npm:

                \`\`\`sh
                npm install ${repoUrl}
                \`\`\`

                ## Usage

                To use the components in your project, follow these steps:

                1. Import the \`styles.css\` file to include the necessary styles:

                \`\`\`js
                import '${repo}/components/styles.css';
                \`\`\`

                2. Import the component file as a default import:

                \`\`\`js
                import ComponentName from '${repo}/components/component-name';
                \`\`\`

                3. Render the component in your React application:

                \`\`\`js
                const App = () => {
                    return (
                        <div>
                            <ComponentName />
                        </div>
                    );
                };

                export default App;
                \`\`\`

                `,
                )
                fs.mkdirSync(path.resolve(cwd, 'demo'))
                fs.writeFileSync(
                    path.resolve(cwd, 'index.html'),
                    dedent`
                    <!doctype html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Vite + React</title>
                    </head>
                    <body>
                        <div id="root"></div>
                        <script type="module" src="/demo/main.jsx"></script>
                    </body>
                    </html>
                    `,
                )

                fs.writeFileSync(
                    path.resolve(cwd, 'demo/main.jsx'),
                    dedent`
                    import React from 'react';
                    import ReactDOM from 'react-dom';
                    import App from './App';

                    ReactDOM.render(
                        <App />,
                        document.getElementById('root')
                    );
                    `,
                )
                fs.writeFileSync(
                    path.resolve(cwd, 'tailwind.config.js'),
                    dedent`
                    /** @type {import('tailwindcss').Config} */
                    module.exports = {
                        purge: ['./demo/**/*.{js,jsx,ts,tsx}',],
                        darkMode: false, // or 'media' or 'class'
                        theme: {
                            extend: {},
                        },
                        variants: {
                            extend: {},
                        },
                        plugins: [],
                    };
                    `,
                )
                fs.writeFileSync(
                    path.resolve(cwd, 'postcss.config.cjs'),
                    dedent`
                    module.exports = {
                        plugins: {
                            tailwindcss: {},
                            autoprefixer: {},
                        },
                    };
                    `,
                )
                const componentsImports = res.components
                    .map((x) => {
                        const { componentName, name } = x
                        return `import ${componentName} from '../components/${name}'`
                    })
                    .join('\n')
                const indent = '            '
                const componentRender = res.components
                    .flatMap((x) => {
                        const { componentName, name } = x
                        const variant = x.propertyControls?.variant

                        const variantsResponsive = (
                            variant?.['optionTitles'] ||
                            variant?.['options'] ||
                            []
                        ).filter((x) => {
                            return [
                                'default',
                                'desktop',
                                'tablet',
                                'mobile',
                                'phone',
                            ].includes(x.toLowerCase())
                        })
                        return [
                            indent + `<${componentName} />`,
                            indent + '<hr className="w-full" />',
                        ]
                    })
                    .join('\n')
                fs.writeFileSync(
                    path.resolve(cwd, 'demo/App.jsx'),
                    dedent`
                    import React from 'react';
                    import '../components/styles.css'
                    import 'tailwindcss/tailwind.css'
                    ${componentsImports}

                    const App = () => {
                        return (
                            <div className='flex flex-col gap-12 p-12'>
                                ${componentRender}
                            </div>
                        );
                    };

                    export default App;
                    `,
                )
                fs.writeFileSync(
                    path.resolve(cwd, 'package.json'),
                    JSON.stringify(
                        {
                            name: 'unframer-react-components',
                            version: '0.0.1',
                            type: 'module',
                            scripts: {
                                dev: 'vite',
                                build: 'vite build',
                            },

                            dependencies: {
                                react: '^18.3.1',
                                'react-dom': '^18.3.1',
                                unframer: 'latest',
                            },
                            devDependencies: {
                                tailwindcss: '^3.2.7',
                                postcss: '^8.4.14',
                                autoprefixer: '^10.4.7',
                                '@types/react': '^18.3.5',
                                '@types/react-dom': '^18.3.0',
                                '@vitejs/plugin-react': '^4.3.1',
                                vite: '^5.4.2',
                            },
                        },
                        null,
                        2,
                    ),
                )
                fs.writeFileSync(
                    path.resolve(cwd, 'vite.config.ts'),
                    dedent`
                    import { defineConfig } from 'vite';
                    import react from '@vitejs/plugin-react';

                    // https://vitejs.dev/config/
                    export default defineConfig({
                      plugins: [react()],
                    });
                    `,
                )
                // end of writing the files on disk
                const allFiles = await recursiveReaddir(cwd)
                const existingFiles = await getRepoFiles({
                    fetchBlob(pagePath) {
                        return false
                    },
                    branch: githubBranch,
                    octokit: octokit.rest,
                    owner,
                    repo,
                })
                const filesPageSlugs = new Set(
                    allFiles.map((x) => {
                        let rel = path.relative(cwd, x)
                        let pageSlug = githubPathToPageSlug(rel)
                        return pageSlug
                    }),
                )
                const sema = new Sema(5)
                await Promise.all(
                    existingFiles
                        .filter((x) => {
                            return x.sha && !filesPageSlugs.has(x.pagePath)
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
                    allFiles.map(async (file) => {
                        await sema.acquire()
                        try {
                            const code = fs.readFileSync(file, 'utf-8')
                            let githubPath = file.replace(cwd, '')
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
            } finally {
                // fs.rmdirSync(cwd, { recursive: true })
                console.log('deleted', cwd)
            }

            const stackblitzUrl = `https://stackblitz.com/github/${owner}/${repo}?file=`
            console.log('stackblitzUrl', stackblitzUrl)
            console.log('repoUrl', repoUrl)
            return {
                repoUrl,
                stackblitzUrl,
            }
        },
        {
            body: z.object({
                owner: z.string(),
                repo: z.string().optional(),
                basePath: z.string(),
                githubAccountLogin: z.string(),
                components: z.array(componentObjectSchema),
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

export async function recursiveReaddir(dir: string) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(
        dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name)
            return dirent.isDirectory() ? recursiveReaddir(res) : res
        }),
    )
    return files.flat()
}
