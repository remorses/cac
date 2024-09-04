import { defineConfig, Plugin } from 'vite'
import fs from 'fs'
import fkill from 'fkill'
import http, { Server } from 'http'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'

import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import framer from 'vite-plugin-framer'

const building = process.env.NODE_ENV === 'production'

declare global {
    var server: Server | undefined
}

function logsPlugin(): Plugin {
    const isDevelopment = process.env.NODE_ENV === 'development'

    return {
        name: 'logs-plugin',
        config() {
            return {
                clearScreen: false,
            }
        },

        configureServer(viteServer) {
            if (globalThis.server && globalThis.server.listening) {
                console.log('server already configured')
                return
            }
            console.log('configuring logs server')
            viteServer.httpServer?.on('close', () => {
                if (globalThis.server) {
                    globalThis.server.close()
                }
            })

            globalThis.server = http.createServer((req, res) => {
                let body = ''
                req.on('data', (chunk) => {
                    body += chunk.toString()
                })
                req.on('end', () => {
                    console.log(`[background]: ${body}`)
                    res.end('ok')
                })
            })

            globalThis.server.listen(8832, () => {
                console.log('Logging server is running on port 8832')
            })
        },
    }
}

function wasmPlugin(): Plugin {
    return {
        name: 'wasm-plugin',
        resolveId(source, importer) {
            if (source.endsWith('.wasm')) {
                return this.resolve(source, importer, { skipSelf: true })
            }
            return null
        },
        async load(id) {
            if (id.endsWith('.wasm')) {
                const data = await fs.promises.readFile(id)
                const base64 = data.toString('base64')
                return `export default "data:application/wasm;base64,${base64}"`
            }
            return null
        },
    }
}

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 5174,
        strictPort: true,
        hmr: {
            port: 5174,
        },
    },
    // assetsInclude: ['**/*.wasm'],
    // build: {
    //     assetsInlineLimit(filePath, content) {
    //         if (filePath.endsWith('.wasm')) {
    //             return true
    //         }
    //         return undefined
    //     },
    // },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor'
                        // const chunks = id
                        //     .toString()
                        //     .split(/node_modules\//g)
                        //     .pop()!
                        //     .split('/')
                        // const scope = chunks[0].startsWith('@') ? chunks[0] : ''
                        // const name = scope ? chunks[1] : chunks[0]
                        // return `${scope ? `${scope}_${name}` : name}`
                    }
                },
            },
        },
    },
    plugins: [
        react(),
        wasmPlugin(),
        logsPlugin(),
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        EnvironmentPlugin('all'),
        tsconfigPaths(),
        crx({ manifest: manifest as any }),
    ],
})

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
