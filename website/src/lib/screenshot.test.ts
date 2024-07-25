import { test, describe, it, expect } from 'vitest'
import fs from 'fs'

import { getBucketUrl, getScreenshotUrl, screenshot } from './ssr.server'
import { splitImage } from 'website/src/lib/tile.server'

describe('screenshot', () => {
    test(
        'screenshot',
        async () => {
            const url =
                'https://docs.gitbook.com/integrations/install-an-integration#install-an-integration-in-your-organization'
            const res = await screenshot(url)
            console.log(res)
        },
        1000 * 60,
    )
    test(
        'split screenshot',
        async () => {
            const url =
                'https://docs.gitbook.com/integrations/install-an-integration#install-an-integration-in-your-organization'
            const { image } = await screenshot(url)

            const buffers = await splitImage({ imageBuffer: image })

            for (let [i, buffer] of buffers.entries()) {
                const filePath = `/tmp/split-image-${i}.png`
                await fs.promises.writeFile(filePath, buffer)
                console.log(`Image ${filePath} created successfully.`)
            }
        },
        1000 * 60,
    )
})
