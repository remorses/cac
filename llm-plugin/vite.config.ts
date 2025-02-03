import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import framer from 'vite-plugin-framer'
import { CopyOnEnd } from '../template-rewrite-framer/vite.config'
import { visualizer } from 'rollup-plugin-visualizer'

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
        allowedHosts: true,
    },
    build: {
        assetsInlineLimit: 307200,
    },
})
