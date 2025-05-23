import { Spiceflow } from 'spiceflow'
import mime from 'mime'

import { z } from 'zod'

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
export const app = new Spiceflow()
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

        const url = `https://${basePath}-demos.unframer.co`
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
