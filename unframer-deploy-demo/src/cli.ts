import { cac } from 'cac'
import fs from 'fs'
import path from 'path'
import { notifyError } from './sentry'
import { unframerBucketServerSdk } from './sdk'
import { globby } from 'globby'

export const cli = cac('unframer-deploy-demo')

cli.help()

cli.command('', 'Deploy unframer demo')
    .option('--secret <value>', 'Secret key for deployment', {})
    .option('--slug <repo>', 'Repository slug', {})
    .option('--dir <directory>', 'Directory to deploy', { default: './dist' })
    .action(async function main(options) {
        // console.log({ options })
        const { slug, dir, secret } = options
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
        } catch (error) {
            notifyError(error)

            throw error
        }
    })
