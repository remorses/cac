import { createOpenAI } from '@ai-sdk/openai'
import stableString from 'fast-json-stable-stringify'
import { streamText, generateText, generateObject, wrapLanguageModel } from 'ai'
import { describe, expect, it, beforeAll } from 'vitest'
import { z } from 'zod'
import { createAiCacheMiddleware } from './ai-cache'

describe(
    'ai-cache middleware',
    () => {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) throw new Error(`missing OPENAI_API_KEY`)
        const openai = createOpenAI({ apiKey })

        it('should cache and return the same result for identical requests', async () => {
            const middleware = createAiCacheMiddleware({})

            const model = wrapLanguageModel({
                model: openai('gpt-4o-mini'),
                middleware: [middleware],
            })
            const res = streamText({
                model,
                temperature: 1,
                prompt: 'Generate a simple very short story',
            })
            await res.consumeStream()
            const text = await res.text
            expect(text).toMatchInlineSnapshot(`"Once upon a time, in a quiet village, a little girl found a mysterious key in her backyard. Curious, she searched for what it opened. After days of wandering, she discovered an old, forgotten door in the woods. Heart pounding, she inserted the key, and the door creaked open to reveal a beautiful garden filled with vibrant flowers and shimmering butterflies. It turned out to be a magical place where dreams came true. From that day on, the girl visited often, sharing her joy with everyone in the village, reminding them that magic can be found anywhere if you just look closely."`)
        })

        it('should cache and return the same result for generateText', async () => {
            const middleware = createAiCacheMiddleware({})

            const model = wrapLanguageModel({
                model: openai('gpt-4o-mini'),
                middleware: [middleware],
            })

            const result = await generateText({
                model,
                temperature: 1,
                prompt: 'What is the capital of France?',
            })

            expect(result.text).toMatchInlineSnapshot(
                `"The capital of France is Paris."`,
            )
        })

        it('should cache and return the same result for generateObject', async () => {
            let params
            const middleware = createAiCacheMiddleware({
                onParams(x) {
                    params = x
                },
            })

            const model = wrapLanguageModel({
                model: openai('gpt-4o-mini'),
                middleware: [middleware],
            })

            const schema = z.object({
                name: z.string(),
                age: z.number(),
                occupation: z.string(),
            })

            const result = await generateObject({
                model,
                temperature: 1,
                schema,
                prompt: 'Generate information about a software engineer named John who is 30 years old, very long one with super long names',
            })
            expect(stableString(params)).toMatchInlineSnapshot(
                `"{"inputFormat":"prompt","mode":{"tool":{"description":"Respond with a JSON object.","name":"json","parameters":{"$schema":"http://json-schema.org/draft-07/schema#","additionalProperties":false,"properties":{"age":{"type":"number"},"name":{"type":"string"},"occupation":{"type":"string"}},"required":["name","age","occupation"],"type":"object"},"type":"function"},"type":"object-tool"},"prompt":[{"content":[{"text":"Generate information about a software engineer named John who is 30 years old, very long one with super long names","type":"text"}],"role":"user"}],"temperature":1}"`,
            )

            expect(result.object).toMatchInlineSnapshot(`
              {
                "age": 30,
                "name": "Johnathan Alexander Smith the Second",
                "occupation": "Senior Software Engineer specializing in Full-Stack Development with a deep expertise in JavaScript frameworks and cloud computing solutions.",
              }
            `)
        })
    },
    1000 * 10,
)
