import { FramerLayersTree } from 'website/src/lib/rewrite'

import { DomHandler, Parser, ElementType } from 'htmlparser2'
import domSerializer from 'dom-serializer'
import camelCase from 'camelcase'

import { env } from './env'
import dedent from 'dedent'
export { oldTextTreeToXml } from './xml'

export function loginRedirectUrl({ next = '' }) {
    const u = new URL('/api/auth/callback', env.PUBLIC_URL)
    if (next) {
        u.searchParams.set('next', new URL(next, env.PUBLIC_URL).toString())
    }
    return u.toString()
}
export function otpRedirectLink({ email, next = '' }) {
    let u = new URL('/otp', env.PUBLIC_URL)
    u.searchParams.set('email', email)
    u.searchParams.set('next', next)

    return u.toString()
}

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export enum PluginNames {
    github = 'github',
    migrate = 'migrate',
    react = 'react',
    llm = 'llm',
}

export function framerLoginUrl({
    key,
    code,
    pluginName,
    projectId,
    projectName,
}) {
    let url: URL
    if (pluginName === PluginNames.github) {
        url = new URL('/api/markdown-plugin/auth/framer-login', env.PUBLIC_URL)
    } else {
        url = new URL('/api/auth/framer-login', env.PUBLIC_URL)
    }
    url.searchParams.set('key', key)
    if (projectId) {
        url.searchParams.set('projectId', projectId)
    }
    if (pluginName) {
        url.searchParams.set('pluginName', projectId)
    }
    if (projectName) {
        url.searchParams.set('projectName', projectName)
    }
    url.searchParams.set('code', code)
    return url.toString()
}
export function generateSecurePassword(length = 32) {
    const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    const randomValues = new Uint32Array(length)
    for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * charset.length)
    }

    return Array.from(randomValues)
        .map((x) => charset[x % charset.length])
        .join('')
}

export function generateShortOtpCode() {
    const length = 6
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    const randomValues = new Uint32Array(length)
    for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * charset.length)
    }

    return Array.from(randomValues)
        .map((x) => charset[x % charset.length])
        .join('')
}

export function safeJsonParse<T = any>(str: string): T | null {
    try {
        return JSON.parse(str)
    } catch (e) {
        return null
    }
}

export function isTruthy<T>(val: T | undefined | null | false): val is T {
    return Boolean(val)
}

export function afterFramerLogin({
    key,
    projectId,
    pluginName,
    projectName,
    code,
}) {
    const url = new URL('/after-framer-login', env.PUBLIC_URL)
    url.searchParams.set('key', key)
    if (projectId) {
        url.searchParams.set('projectId', projectId)
    }
    if (pluginName) {
        url.searchParams.set('pluginName', projectId)
    }
    if (projectName) {
        url.searchParams.set('projectName', projectName)
    }
    url.searchParams.set('code', code)
    return url.toString()
}

export type Iterated<T> = T extends AsyncIterable<infer U> ? U : never

export function sortByKey<T>(arr: T[], key: (x: T) => string) {
    return arr.sort((a, b) => {
        const aKey = key(a)
        const bKey = key(b)
        if (aKey < bKey) {
            return -1
        }
        if (aKey > bKey) {
            return 1
        }
        return 0
    })
}

const namesToRemove = ['Desktop', 'Mobile', 'Tablet']
export function cleanupOldTextTree(tree: FramerLayersTree): FramerLayersTree {
    // Helper function to process a single node
    function processNode(
        node: FramerLayersTree[number],
    ): FramerLayersTree[number] | FramerLayersTree | null {
        // Remove node if its name is in namesToRemove, but keep its children
        if (node.name && namesToRemove.includes(node.name)) {
            return node.children?.flatMap(processNode).filter(isTruthy) || []
        }

        // Use content as name if they are the same when lowercase
        if (
            node.content &&
            node.name &&
            node.content.trim().toLowerCase() === node.name.trim().toLowerCase()
        ) {
            node.name = 'text'
        }

        // Remove nodeId if the node has children
        if (node.children?.length) {
            const {
                // nodeId, //
                ...rest
            } = node
            return {
                ...rest,
                children: node.children.flatMap(processNode).filter(isTruthy),
            }
        }
        return node
    }

    // Process each node in the tree
    let cleanedTree = tree
        .flatMap(processNode)
        .filter((node): node is FramerLayersTree[number] => node !== null)

    return cleanedTree
}

export function bfsOldTextTree(tree: FramerLayersTree): FramerLayersTree {
    const queue: FramerLayersTree = [...tree]
    const result: FramerLayersTree = []

    while (queue.length > 0) {
        const node = queue.shift()
        if (node) {
            result.push(node)

            if (node.children && node.children.length > 0) {
                queue.push(...node.children)
            }
        }
    }

    return result
}

export function canHaveFreePlugin(email?: string) {
    // return false
    if (!email) {
        return false
    }
    if (email?.endsWith('@framer.com')) {
        return true
    }
    if (email === 't.de.rossi.01@gmail.com') {
        return true
    }
    if (email === 'beats.by.morse@gmail.com') {
        return true
    }
    return false
}

export function deduplicateByKey<T>(
    items: T[],
    getKey: (item: T) => string | number,
): T[] {
    const seen = new Map<string | number, T>()
    for (const item of items) {
        const key = getKey(item)
        if (!seen.has(key)) {
            seen.set(key, item)
        }
    }
    return Array.from(seen.values())
}

export function safeUrl(u) {
    try {
        return new URL(u)
    } catch {
        return null
    }
}
export async function generateStackblitzProject({ projectId, title = '' }) {
    const sdk = await import('@stackblitz/sdk').then((x) => x.default)

    const packageJson = {
        name: 'unframer-vite-react-typescript-starter',
        private: true,
        version: '0.0.0',
        type: 'module',
        stackblitz: {
            startCommand: `STACKBLITZ_DEMO_EXAMPLE=src/App.tsx npm run framer && npm run dev`,
        },
        scripts: {
            dev: 'vite',
            build: 'vite build',
            framer: `unframer ${projectId} --outDir src/framer`,
        },
        dependencies: {
            react: 'latest',
            unframer: 'latest',
            'react-dom': 'latest',
        },
        devDependencies: {
            '@types/react': 'latest',
            '@types/react-dom': 'latest',
            '@vitejs/plugin-react': 'latest',
            'tailwindcss': '^3.4.0',
            'postcss': '^8.4.0',
            'autoprefixer': '^10.4.0',
            typescript: 'latest',
            vite: 'latest',
        },
    }

    const tsconfig = {
        compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
    }

    const viteConfig = dedent`
        import { defineConfig } from 'vite'
        import react from '@vitejs/plugin-react'
        
        // https://vitejs.dev/config/
        export default defineConfig({
            plugins: [react()],
        })`

    const postcssConfig = dedent`
        export default {
            plugins: {
                tailwindcss: {},
                autoprefixer: {},
            }
        }`

    const tailwindConfig = dedent`
        /** @type {import('tailwindcss').Config} */
        export default {
            content: [
                "./index.html",
                "./src/**/*.{js,ts,jsx,tsx}",
            ],
            theme: {
                extend: {},
            },
            plugins: [],
        }`

    const indexHtml = dedent`
        <!doctype html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Unframer + Vite + React + TS</title>
            </head>
            <body>
                <div id="root"></div>
                <script type="module" src="/src/main.tsx"></script>
            </body>
        </html>`

    const app = dedent`
        const docs = \`
        # Unframer Demo Project
        
        This is a demo project showing how to use Unframer to export Framer components to React.
        
        ## What's happening now:
        If you're seeing this file, the unframer CLI is currently running in the terminal below.
        Just wait until it finishes downloading and bundling your Framer components.
        Once complete, you'll see your components rendered in the browser preview on the right and this file will be replaced with an example.
        
        Try making changes to your components in Framer, then run the unframer command again
        to see the updates reflected here.
        
        ## How it works:
        1. The Framer React Export plugin saves your components to the Unframer database
        2. The unframer CLI downloads and bundles those components into regular React components
        3. You can then import and use them in your React app just like any other component
        
        \`

        `

    const main = dedent`
        import './index.css'
        import React from 'react'
        import ReactDOM from 'react-dom/client'
        import App from './App'
        
        ReactDOM.createRoot(document.getElementById('root')!).render(
            <App />
        )`

    const css = dedent`
        @tailwind base;
        @tailwind components;
        @tailwind utilities;`

    return sdk.openProject(
        {
            title: `Unframer - ${title}`,
            description: `${title} demo for Unframer`,
            template: 'node',
            files: {
                'tsconfig.json': JSON.stringify(tsconfig, null, 2),
                'package.json': JSON.stringify(packageJson, null, 2),
                'vite.config.ts': viteConfig,
                'postcss.config.js': postcssConfig,
                'tailwind.config.js': tailwindConfig,
                'index.html': indexHtml,
                'src/App.tsx': app,
                'src/index.css': css,
                'pnpm-lock.yaml': '\n',
                'src/main.tsx': main,
            },
        },
        {
            openFile: 'src/App.tsx',
            showSidebar: false,
        },
    )
}
