/// <reference types="vitest/config" />
import mdx from '@mdx-js/rollup'
import { reactRouter } from '@react-router/dev/vite'
import withToc from '@stefanprobst/rehype-extract-toc'
import { viteExternalsPlugin } from '@xmorse/deployment-utils/dist/vite-externals-plugin'
import { reactRouterHonoServer } from 'react-router-hono-server/dev'
import rehypeMdxImportMedia from 'rehype-mdx-import-media'
import withSlugs from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'
import mkcert from 'vite-plugin-mkcert'
import tsconfigPaths from 'vite-tsconfig-paths'

const NODE_ENV = JSON.stringify(process.env.NODE_ENV || 'production')

console.log('NODE_ENV', NODE_ENV)

export default defineConfig({
    clearScreen: false,
    define: {
        'process.env.NODE_ENV': NODE_ENV,
    },
    server: {
        proxy: {},

        cors: true,
        allowedHosts: true,
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
        !process.env.DISABLE_HTTPS && mkcert(),
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
        // TODO vitest breaks with opentelemetry invalid esm output, react router makes vitest import the module package.json file
       !process.env.VITEST && reactRouter(),
        reactRouterHonoServer(),
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        EnvironmentPlugin('all', { prefix: 'NEXT_PUBLIC' }),
        // Inspect(),
        tsconfigPaths(),
        viteExternalsPlugin({
            externals: ['dprint-node', 'playwright', 'htmlrewriter', '@sentry/node'],
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

    build: {
        // sourcemap: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },

    legacy: {
        proxySsrExternalModules: true,
    },
})
