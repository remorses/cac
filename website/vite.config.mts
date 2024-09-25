import { vitePlugin as remix } from '@remix-run/dev'

import { defineConfig } from 'vitest/config'
import Inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'
import EnvironmentPlugin from 'vite-plugin-environment'
import { viteExternalsPlugin } from '@xmorse/deployment-utils/dist/vite-externals-plugin'

import { visualizer } from 'rollup-plugin-visualizer'

const building = process.env.NODE_ENV === 'production'

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
        // disableConsoleIntercept: true,

        poolOptions: {
            threads: {
                isolate: false,
                // useAtomics: true,
            },
        },
    },
    plugins: [
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        Inspect(),
        remix({
            appDirectory: 'src',
            serverModuleFormat: 'cjs',
            future: {
                v3_fetcherPersist: true,
                unstable_singleFetch: true,
                v3_relativeSplatPath: true,
                v3_throwAbortReason: true,
            },
        }),
        tsconfigPaths(),
        viteExternalsPlugin({ externals: ['dprint-node', 'playwright'] }),
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
