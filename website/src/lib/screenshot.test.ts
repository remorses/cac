import { test, describe, it, expect } from 'vitest'
import fs from 'fs'

import { getBucketUrl, getScreenshotUrl, groq, screenshot } from './ssr.server'
import { splitImage } from 'website/src/lib/tile.server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

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
    test(
        'split screenshot and ask for text',
        async () => {
            const url =
                'https://docs.gitbook.com/integrations/install-an-integration#install-an-integration-in-your-organization'
            const { image } = await screenshot(url)

            const buffers = await splitImage({ imageBuffer: image })

            const stream = await streamText({
                model: anthropic('claude-3-haiku-20240307'),
                messages: [
                    {
                        content: `Give me back all the text from these images. each image is a viewport from a website. For each piece of text, add also the section of the page it is part of. return ndjson output`,
                        role: 'user',
                    },
                    {
                        role: 'user',
                        content: [
                            ...buffers.map((buffer) => {
                                return {
                                    type: 'image' as const,
                                    mimeType: 'image/jpeg',
                                    image: buffer,
                                }
                            }),
                        ],
                    },
                ],
            })
            for await (let chunk of stream.textStream) {
                process.stdout.write(chunk)
            }
        },
        1000 * 60,
    )
})
