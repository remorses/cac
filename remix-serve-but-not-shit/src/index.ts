import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import url from 'node:url'
import {
    type ServerBuild,
    broadcastDevReady,
    installGlobals,
} from '@remix-run/node'
import { type RequestHandler, createRequestHandler } from '@remix-run/express'

import express from 'express'
import morgan from 'morgan'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

process.env.NODE_ENV = process.env.NODE_ENV ?? 'production'

run()

function parseNumber(raw?: string) {
    if (raw === undefined) return undefined
    let maybe = Number(raw)
    if (Number.isNaN(maybe)) return undefined
    return maybe
}

async function run() {
    let port = parseNumber(process.env.PORT) || 3000

    let buildPathArg = process.argv[2]

    if (!buildPathArg) {
        console.error(`
  Usage: remix-serve-but-not-shit <server-build-path> - e.g. remix-serve-but-not-shit build/index.js`)
        process.exit(1)
    }

    let buildPath = path.resolve(buildPathArg)
    let versionPath = path.resolve(buildPath, '..', 'version.txt')

    async function reimportServer() {
        Object.keys(require.cache).forEach((key) => {
            if (key.startsWith(buildPath)) {
                delete require.cache[key]
            }
        })

        let stat = fs.statSync(buildPath)

        // use a timestamp query parameter to bust the import cache
        return import(url.pathToFileURL(buildPath).href + '?t=' + stat.mtimeMs)
    }

    let onListen = () => {
        let address =
            process.env.HOST ||
            Object.values(os.networkInterfaces())
                .flat()
                .find((ip) => String(ip?.family).includes('4') && !ip?.internal)
                ?.address

        if (!address) {
            console.log(`[remix-serve-but-not-shit] http://localhost:${port}`)
        } else {
            console.log(
                `[remix-serve-but-not-shit] http://localhost:${port} (http://${address}:${port})`,
            )
        }
        if (process.env.NODE_ENV === 'development') {
            void broadcastDevReady(build)
        }
    }
    let build: ServerBuild = await reimportServer()

    let app = express()
    app.disable('x-powered-by')
    // app.use(compression())
    app.use(
        build.publicPath,
        express.static(build.assetsBuildDirectory, {
            immutable: true,
            maxAge: '1y',
        }),
    )
    app.use(express.static('public', { maxAge: '1h' }))
    app.use(morgan('tiny'))

    app.all(
        '*',
        createRequestHandler({
            build,
            mode: process.env.NODE_ENV,
        }),
    )

    let server = process.env.HOST
        ? app.listen(port, process.env.HOST, onListen)
        : app.listen(port, onListen)

    ;['SIGTERM', 'SIGINT'].forEach((signal) => {
        process.once(signal, () => server?.close(console.error))
    })
}
