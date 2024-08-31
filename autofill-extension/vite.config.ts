import { defineConfig, Plugin } from 'vite'
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

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 5174,
        strictPort: true,
        hmr: {
            port: 5174,
        },
    },
    plugins: [
        react(),
        // mkcert(),
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
