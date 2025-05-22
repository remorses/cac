import { describe, it, expect } from 'vitest'
import { unframerBucketServerSdk } from '../src/sdk'
import { readFile } from 'fs/promises'
import { globby } from 'globby'
import path from 'path'

describe('uploadExampleWebsite', () => {
    // Site configuration
    const siteName = 'example-demo'
    const siteSecret = 'example-secret-key'
    const baseUrl = `https://${siteName}-demos.unframer.co`
    it('should upload the example website to the bucket server', async () => {
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
                {
                  "contentType": "text/html",
                  "fullPath": "example-demo/index.html",
                },
                {
                  "contentType": "text/javascript",
                  "fullPath": "example-demo/script.js",
                },
                {
                  "contentType": "text/css",
                  "fullPath": "example-demo/styles.css",
                },
              ],
              "success": true,
            },
            "error": null,
          }
        `)
    })

    it('should serve the index.html file with correct content type', async () => {
        console.log(baseUrl)
        const response = await fetch(baseUrl)
        expect(response.status).toBe(200)

        // Check that we got HTML content type
        const contentType = response.headers.get('content-type')
        expect(contentType).toMatchInlineSnapshot(`"text/html"`)

        // Verify we can get the content
        const content = await response.text()
        expect(content).toContain('<!DOCTYPE html>')
    })
})
