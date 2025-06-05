import { createOpenAI } from '@ai-sdk/openai'
import { streamText, wrapLanguageModel } from 'ai'
import { describe, expect, it } from 'vitest'
import { createAiCacheMiddleware } from './ai-cache'

describe(
    'ai-cache middleware',
    () => {
        it('should cache and return the same result for identical requests', async () => {
            const middleware = createAiCacheMiddleware({})

            const apiKey = process.env.OPENAI_API_KEY
            if (!apiKey) throw new Error(`missing OPENAI_API_KEY`)
            const openai = createOpenAI({ apiKey })

            const model = wrapLanguageModel({
                model: openai('gpt-4o-mini'),
                middleware: [middleware],
            })
            const res = streamText({
                model,
                temperature: 1,
                prompt: 'Generate a simple very short poem',
            })
            await res.consumeStream()
            const text = await res.text
            expect(text).toMatchInlineSnapshot(`
              "Whispers of the evening glow,  
              Stars awaken, soft and slow.  
              Moonlight dances, shadows play,  
              Nighttime dreams drift far away.  "
            `)
        })
    },
    1000 * 20,
)
