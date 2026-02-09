import { goke } from 'goke'
import fs from 'fs'
import path from 'path'
import { notifyError } from './sentry.js'
import { unframerBucketServerSdk } from './sdk.js'
import { globby } from 'globby'

export const cli = goke('unframer-deploy-demo')

cli.help()

cli.command('', 'Deploy unframer demo')
    .option('--secret <value>', 'Secret key for deployment')
    .option('--slug <repo>', 'Repository slug')
    .option('--dir <directory>', 'Directory to deploy')
    .action(async function main(options) {
        const { slug, secret } = options
        const dir = options.dir || './dist'
        if (!slug) {
            console.error('No repository slug provided')
            return
        }

        if (!secret) {
            console.error('No secret key provided')
            return
        }
        try {
            const filePaths = await globby('**/*', {
                cwd: dir,
                onlyFiles: true,
            })
            if (!filePaths.length) {
                console.error(`No files to upload inside ${dir}`)
                return
            }
            console.log(`uploading ${filePaths.length} files`)
            // Upload the website
            const { data, error } =
                await unframerBucketServerSdk.api.uploadFiles.post({
                    files: await Promise.all(
                        filePaths.map(async (filePath) => {
                            const fullPath = path.resolve(dir, filePath)
                            const contents = await fs.promises.readFile(
                                fullPath,
                                'utf-8',
                            )

                            return {
                                path: filePath,
                                contents,
                            }
                        }),
                    ),
                    basePath: slug,
                    secret,
                })
            if (error) throw error

            console.log(`🚀 Website deployed at ${data.url}`)
        } catch (error) {
            notifyError(error)

            throw error
        }
    })
