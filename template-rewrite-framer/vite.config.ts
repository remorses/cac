import { defineConfig, Plugin } from 'vite'
import { execSync } from 'child_process'
import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import framer from 'vite-plugin-framer'

const basePath = process.env.BASE_PATH

export function CopyOnEnd({ basePath = '', out: OUT }): Plugin {
    // const building = process.env.NODE_ENV === 'production'
    if (basePath && !basePath.startsWith('/')) {
        throw new Error('basePath must start with /')
    }

    return {
        name: 'copy-on-end',
        config({}, { command, mode }) {
            const isBuilding = command === 'build'

            return {
                base: isBuilding ? basePath : undefined,

                build: {
                    // target: 'ES2020',
                    // 30kb in bytes
                    // assetsInlineLimit: 30720,
                    sourcemap: true,
                    outDir: 'dist' + basePath,
                },
            }
        },
        closeBundle: {
            sequential: true,
            order: 'post',
            handler() {
                if (!basePath) {
                    return
                }

                execSync(`mkdir -p ${OUT} && cp -r ./dist/ ${OUT}`)
                console.log('Copied build files to', OUT)
            },
        },
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        mkcert(),
        framer(),
        CopyOnEnd({
            basePath,
            out: '../website/public',
        }),
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        EnvironmentPlugin('all', { prefix: 'NEXT_PUBLIC' }),
        tsconfigPaths(),
    ],
    build: {
        assetsInlineLimit: 30720,
    },
})
