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
                prompt: 'Generate a simple very short poem',
            })
            await res.consumeStream()
            const text = await res.text
            expect(text).toMatchInlineSnapshot(`
              "Beneath the stars, a whispering breeze,
              Dancing leaves sway with gentle ease.
              Night’s embrace, a soft lullaby,
              In dreams we soar, where hearts can fly."
            `)
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
                "name": "Johnathan Alexander Montgomery III",
                "occupation": "Senior Software Engineer specializing in Full-Stack Development with a focus on Web Technologies including but not limited to JavaScript frameworks such as React and Angular, back-end technologies including Node.js, and proficiency in DevOps methodologies ensuring seamless integration and deployment processes.",
              }
            `)
        })
    },
    1000 * 10,
)
