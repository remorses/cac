import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import framer from 'vite-plugin-framer'

import { visualizer } from 'rollup-plugin-visualizer'

const building = process.env.NODE_ENV === 'production'

const basePath = process.env.BASE_PATH

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        mkcert(),
        framer(),
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        EnvironmentPlugin('all', { prefix: 'NEXT_PUBLIC' }),
        tsconfigPaths(),
        {
            apply(config, env) {
                if (!env.isSsrBuild) {
                    return true
                }
                return false
            },
            ...visualizer({ filename: 'dist/trace.html' }),
        } as any,
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify(
            process.env.NODE_ENV || 'production',
        ),
    },
    server: {
        proxy: {},
        cors: true,
    },
    build: {
        assetsInlineLimit: 307200,
    },
})
