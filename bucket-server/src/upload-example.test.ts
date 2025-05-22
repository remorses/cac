import { describe, it, expect } from 'vitest'
import { unframerBucketServerSdk } from '../src/sdk'
import { readFile } from 'fs/promises'
import { globby } from 'globby'
import path from 'path'

describe('uploadExampleWebsite', () => {
    it('should upload the example website to the bucket server', async () => {
        // Site configuration
        const siteName = process.env.SITE_NAME || 'example-demo'
        const siteSecret = process.env.SITE_SECRET || 'example-secret-key'
        const baseUrl = `https://${siteName}.demos.unframer.co`

        // Find all files in the example website directory
        const examplePath = path.resolve(__dirname, '../example-website')
        const filePaths = await globby('./*', {
            cwd: examplePath,
            ignore: ['README.md'], // Skip the README
        })

        expect(filePaths.length).toBeGreaterThan(0)

        // Upload the website
        const result = await unframerBucketServerSdk.api.uploadFiles({
            files: await Promise.all(
                filePaths.map(async (filePath) => {
                    const fullPath = path.resolve(examplePath, filePath)
                    const contents = await readFile(fullPath, 'utf-8')

                    return {
                        path: filePath,
                        contents,
                        // contentType: getContentType(filePath),
                    }
                }),
            ),
            basePath: siteName,
            secret: siteSecret,
        })

        // Verify the result
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.filesUploaded).toBe(files.length)
        expect(result.data.basePath).toBe(siteName)
        expect(result.data.success).toBe(true)

        // Verify that all files have been uploaded
        expect(result.data.paths.length).toBe(files.length)

        // Check that each file path includes the base path
        for (const uploadedPath of result.data.paths) {
            expect(uploadedPath.startsWith(siteName)).toBe(true)
        }
    })
})
