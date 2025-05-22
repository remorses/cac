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
        const { data, error } =
            await unframerBucketServerSdk.api.uploadFiles.post({
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

        expect({ data, error }).toMatchInlineSnapshot(`
          {
            "data": {
              "basePath": "example-demo",
              "filesUploaded": 3,
              "paths": [
                "example-demo/script.js",
                "example-demo/styles.css",
                "example-demo/index.html",
              ],
              "success": true,
            },
            "error": null,
          }
        `)
    })
})
