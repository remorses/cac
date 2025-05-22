import { Spiceflow } from 'spiceflow'
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
    .get('/hello', () => 'Hello World!')
    .post('/api/uploadFiles', async (c) => {
        try {
            const env = c.state.env

            let body
            try {
                const bodyText = await c.request.text()
                body = UploadWebsiteSchema.parse(JSON.parse(bodyText))
            } catch (error) {
                return Response.json(
                    { error: `Invalid request format: ${error.message}` },
                    { status: 400 },
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
                    return Response.json(
                        { error: 'Unauthorized: Invalid secret' },
                        { status: 401 },
                    )
                }
            } else {
                // Create the SECRET file
                await env.BUCKET.put(
                    secretPath,
                    new TextEncoder().encode(secret),
                )
            }

            // Upload all files
            const uploadedPaths = [] as string[]
            const uploads = files.map(async (file) => {
                // Normalize file path - remove leading slashes
                const normalizedFilePath = file.path.replace(/^\/+/, '')
                const fullPath = `${normalizedBasePath}/${normalizedFilePath}`

                await env.BUCKET.put(
                    fullPath,
                    new TextEncoder().encode(file.contents),
                    file.contentType
                        ? { httpMetadata: { contentType: file.contentType } }
                        : undefined,
                )
                uploadedPaths.push(fullPath)
            })

            await Promise.all(uploads)

            return Response.json({
                success: true,
                filesUploaded: files.length,
                basePath: normalizedBasePath,
                paths: uploadedPaths,
            })
        } catch (error) {
            return Response.json(
                { error: `Error uploading files: ${error.message}` },
                { status: 500 },
            )
        }
    })

    .get('/*', async (c) => {
        try {
            const env = c.state.env
            if (!env) {
                return Response.json(
                    { error: 'Internal server error' },
                    { status: 500 },
                )
            }

            const url = new URL(c.request.url)

            // Get base path from subdomain (first part of hostname)
            const hostParts = url.hostname.split('.')
            if (hostParts.length < 2) {
                return Response.json(
                    { error: 'Invalid hostname format' },
                    { status: 400 },
                )
            }

            const subdomain = hostParts[0]
            // Normalize basePath from subdomain
            const basePath = subdomain

            // Get the path from URL and remove leading slash
            let filePath = url.pathname
            filePath = filePath.replace(/^\/+/, '')

            // Combine to get full path in bucket
            const fullPath = `${basePath}/${filePath}`

            // Get object from bucket
            const obj = await env.BUCKET.get(fullPath)

            // Return 404 if object not found
            if (!obj) {
                return Response.json(
                    { error: 'File not found' },
                    { status: 404 },
                )
            }

            // Prepare headers
            const headers: HeadersInit = {}

            // Set content headers from metadata
            if (obj?.httpMetadata?.contentType)
                headers['content-type'] = obj.httpMetadata.contentType
            if (obj?.httpMetadata?.contentEncoding)
                headers['content-encoding'] = obj.httpMetadata.contentEncoding
            if (obj?.httpMetadata?.contentDisposition)
                headers['content-disposition'] =
                    obj.httpMetadata.contentDisposition
            if (obj?.httpMetadata?.contentLanguage)
                headers['content-language'] = obj.httpMetadata.contentLanguage
            if (obj?.httpMetadata?.cacheControl)
                headers['cache-control'] = obj.httpMetadata.cacheControl
            if (obj?.httpMetadata?.cacheExpiry)
                headers['expires'] = obj.httpMetadata.cacheExpiry.toUTCString()

            // Return the file with appropriate headers
            return new Response(obj.body, { headers })
        } catch (error) {
            return Response.json(
                { error: `Error fetching file: ${error.message}` },
                { status: 500 },
            )
        }
    })

export type App = typeof app

export default {
    async fetch(request, env, ctx): Promise<Response> {
        return app.handle(request, { state: { env } })
    },
} satisfies ExportedHandler<Env>
