import { remarkCodeHike } from '@code-hike/mdx'
import withSlugs from 'rehype-slug'
import withToc from '@stefanprobst/rehype-extract-toc'

import { vitePlugin as remix } from '@remix-run/dev'
import mdx from '@mdx-js/rollup'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeMdxImportMedia from 'rehype-mdx-import-media'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import Inspect from 'vite-plugin-inspect'
import EnvironmentPlugin from 'vite-plugin-environment'
import { viteExternalsPlugin } from '@xmorse/deployment-utils/dist/vite-externals-plugin'
import { visualizer } from 'rollup-plugin-visualizer'

const NODE_ENV = JSON.stringify(process.env.NODE_ENV || 'production')

console.log('NODE_ENV', NODE_ENV)

export default defineConfig({
    clearScreen: false,
    define: {
        'process.env.NODE_ENV': NODE_ENV,
    },
    test: {
        pool: 'threads',
        exclude: ['**/dist/**', '**/esm/**', '**/node_modules/**', '**/e2e/**'],
        poolOptions: {
            threads: {
                isolate: false,
            },
        },
    },
    plugins: [
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        EnvironmentPlugin('all', { prefix: 'NEXT_PUBLIC' }),
        Inspect(),
        mdx({
            remarkPlugins: [
                remarkFrontmatter,
                remarkMdxFrontmatter,
                // [remarkCodeHike, { theme: 'github-dark' }],
            ],
            rehypePlugins: [withSlugs, withToc, rehypeMdxImportMedia],
            mdxExtensions: ['.md', '.mdx'],
            mdExtensions: [],
        }),
        remix({
            appDirectory: 'src',
            serverModuleFormat: 'cjs',
            future: {
                v3_fetcherPersist: true,
                v3_singleFetch: true,

                unstable_optimizeDeps: true,
                v3_relativeSplatPath: true,
                v3_lazyRouteDiscovery: true,
                // v3_routeConfig: true,
                v3_throwAbortReason: true,
            },
        }),
        tsconfigPaths(),
        viteExternalsPlugin({
            externals: ['dprint-node', 'playwright', 'htmlrewriter'],
        }),
        {
            apply(config, env) {
                if (env.isSsrBuild) {
                    return true
                }
                return false
            },
            ...visualizer({ filename: 'build/trace.html' }),
        },
    ],
    optimizeDeps: {},
    build: {
        sourcemap: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },

    legacy: {
        proxySsrExternalModules: true,
    },
})
