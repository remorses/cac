import { Spiceflow } from 'spiceflow'
import mime from 'mime'

import { z } from 'zod'
import { unframerDemoUrl } from './utils.ts'

type Env = {
    BUCKET: R2Bucket
}

/**
 * Schema for file objects to be uploaded
 */
const FileSchema = z.object({
    path: z.string(),
    contents: z.string(),
    contentType: z.string().optional(),
})

/**
 * Schema for website upload request
 */
const UploadWebsiteSchema = z.object({
    files: z.array(FileSchema),
    basePath: z.string(),
    secret: z.string(),
})

/**
 * Main application with routes for website upload functionality
 */
export const app = new Spiceflow({disableSuperJsonUnlessRpc: false})
    .state('env', null! as Env)
    .get('/hello', () => ({ message: 'Hello World!' }))
    .post('/api/uploadFiles', async (c) => {
        const env = c.state.env

        let body
        try {
            const bodyText = await c.request.text()
            body = UploadWebsiteSchema.parse(JSON.parse(bodyText))
        } catch (error) {
            throw new Response(
                JSON.stringify({
                    error: `Invalid request format: ${error.message}`,
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            )
        }

        const { files, basePath, secret } = body

        // Normalize basePath - remove trailing slashes
        const normalizedBasePath = basePath.replace(/\/+$/, '')

        // Check if SECRET file exists
        const secretPath = `${normalizedBasePath}/SECRET`
        const existingSecret = await env.BUCKET.get(secretPath)

        if (existingSecret) {
            // Verify the secret matches
            const existingSecretText = await existingSecret.text()
            if (existingSecretText !== secret) {
                throw new Response(
                    JSON.stringify({
                        error: 'Unauthorized: Invalid secret',
                    }),
                    {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' },
                    },
                )
            }
        } else {
            const headers = new Headers()

            // Create the SECRET file
            await env.BUCKET.put(secretPath, new TextEncoder().encode(secret), {
                httpMetadata: new Headers({ 'content-type': 'text' }),
            })
        }

        const uploadedPaths = await Promise.all(
            files.map(async (file) => {
                // Normalize file path - remove leading slashes
                const normalizedFilePath = file.path.replace(/^\/+/, '')
                const fullPath = `${normalizedBasePath}/${normalizedFilePath}`
                const headers = new Headers()
                const contentType = file.contentType || mime.getType(fullPath)
                if (contentType) {
                    headers.set('content-type', contentType)
                }
                await env.BUCKET.put(
                    fullPath,
                    new TextEncoder().encode(file.contents),
                    { httpMetadata: headers },
                )
                return { fullPath, contentType }
            }),
        )
        const url = unframerDemoUrl({ basePath: normalizedBasePath })

        return {
            url,
            success: true,
            filesUploaded: files.length,
            basePath: normalizedBasePath,
            paths: uploadedPaths.sort((a, b) =>
                a.fullPath.localeCompare(b.fullPath),
            ),
        }
    })

    .get('/*', async (c) => {
        const env = c.state.env
        if (!env) {
            throw new Response(
                JSON.stringify({ error: 'Internal server error' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                },
            )
        }

        const url = new URL(c.request.url)

        // Get base path from subdomain (first part of hostname)
        const hostParts = url.hostname.split('.')
        if (hostParts.length < 2) {
            throw new Response(
                JSON.stringify({ error: 'Invalid hostname format' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                },
            )
        }

        const subdomain = hostParts[0].replace(/-demos$/, '')
        // Normalize basePath from subdomain
        const basePath = subdomain

        // Get the path from URL and remove leading slash
        let filePath = url.pathname
        filePath = filePath.replace(/^\/+/, '')
        if (!filePath) {
            filePath = 'index.html'
        }
        if (filePath === 'SECRET') {
            throw Response.json('Cannot fetch SECRET', { status: 401 })
        }

        // Combine to get full path in bucket
        const fullPath = `${basePath}/${filePath}`

        // Get object from bucket
        const obj = await env.BUCKET.get(fullPath)

        // Return 404 if object not found
        if (!obj) {
            if (filePath === 'index.html') {
                throw new Response(
                    `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>Preview Deploying...</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body {
                                background: #18181b;
                                color: #e5e5e5;
                                font-family: system-ui, sans-serif;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                min-height: 100vh;
                                margin: 0;
                            }
                            .card {
                                background: #27272a;
                                border-radius: 1rem;
                                padding: 2rem 2.5rem;
                                box-shadow: 0 2px 12px rgba(0,0,0,0.11);
                                max-width: 480px;
                                text-align: center;
                            }
                            h1, p {
                                color: #e5e5e5;
                            }
                            h1 {
                                font-size: 1.3rem;
                                margin-bottom: 1.25rem;
                                line-height: 1.8;
                                text-wrap: balance;
                                text-align: center;
                            }
                            p {
                                font-size: 0.95rem;
                                margin-top: 0.75rem;
                                line-height: 1.8;
                                text-wrap: balance;
                                text-align: center;
                            }

                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h1>Deploying…</h1>
                            <p>
                                Your Framer React Export preview website is still being deployed.<br>
                                Please check back in a minute!
                            </p>
                        </div>
                    </body>
                    </html>
                  `,
                    {
                        status: 404,
                        headers: { 'Content-Type': 'text/html' },
                    },
                )
            }
            throw new Response(JSON.stringify({ error: 'File not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // Prepare headers
        const headers: HeadersInit = {}

        // Set content headers from metadata
        if (obj?.httpMetadata?.contentType) {
            headers['content-type'] = obj.httpMetadata.contentType
        }
        if (obj?.httpMetadata?.contentEncoding) {
            headers['content-encoding'] = obj.httpMetadata.contentEncoding
        }
        if (obj?.httpMetadata?.contentDisposition) {
            headers['content-disposition'] = obj.httpMetadata.contentDisposition
        }
        if (obj?.httpMetadata?.contentLanguage) {
            headers['content-language'] = obj.httpMetadata.contentLanguage
        }
        if (obj?.httpMetadata?.cacheControl) {
            headers['cache-control'] = obj.httpMetadata.cacheControl
        }
        if (obj?.httpMetadata?.cacheExpiry) {
            headers['expires'] = obj.httpMetadata.cacheExpiry.toUTCString()
        }

        // Return the file data with appropriate headers
        return new Response(obj.body, {
            headers,
            status: 200,
        })
    })

export type App = typeof app

export default {
    async fetch(request, env, ctx) {
        try {
            return app.handle(request, { state: { env } })
        } catch (error) {
            if (error instanceof Response) {
                return error
            }
            return new Response(
                JSON.stringify({
                    error: error.message || 'An unknown error occurred',
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                },
            )
        }
    },
} satisfies ExportedHandler<Env>
