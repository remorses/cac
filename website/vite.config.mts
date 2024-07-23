import { vitePlugin as remix } from '@remix-run/dev'

import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'
import EnvironmentPlugin from 'vite-plugin-environment'

import { visualizer } from 'rollup-plugin-visualizer'

const building = process.env.NODE_ENV === 'production'

export default defineConfig({
    clearScreen: false,
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    plugins: [
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        Inspect(),
        remix({
            appDirectory: 'src',
            serverModuleFormat: 'cjs',
            future: {
                v3_fetcherPersist: true,
                v3_relativeSplatPath: true,
                v3_throwAbortReason: true,
            },
        }),
        tsconfigPaths(),
        {
            apply(config, env) {
                if (env.isSsrBuild) {
                    return true
                }
                return false
            },
            ...visualizer({ filename: 'build/trace.html' }),
        },
        // bundleGraphPlugin(),
    ],

    ssr: {
        noExternal: building || undefined,
        external: building
            ? ['@prisma/client', '@sentry/node', 'htmlrewriter']
            : undefined,
    },

    optimizeDeps: {
        // include: ['@sentry/node'],
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    legacy: {
        proxySsrExternalModules: true,
    },
})
