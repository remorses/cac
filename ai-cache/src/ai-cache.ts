import { FlatCache } from 'flat-cache'
import {
    type LanguageModelV1,
    type LanguageModelV1Middleware,
    type LanguageModelV1StreamPart,
    simulateReadableStream,
} from 'ai'

export function createAiCacheMiddleware({
    cacheDir = '.aicache',
    cacheId = 'ai-cache.json',
    ttl = 1000 * 60 * 24 * 360,
}) {
    const cache = new FlatCache({
        cacheDir,
        cacheId,
        lruSize: 300,
        ttl,
        serialize(data) {
            return JSON.stringify(data, null, 2)
        },
        deserialize(data) {
            return JSON.parse(data)
        },
    })
    cache.load()
    const cacheMiddleware: LanguageModelV1Middleware = {
        wrapGenerate: async ({ doGenerate, params }) => {
            const cacheKey = JSON.stringify(params)

            const cached = (await cache.get(cacheKey)) as Awaited<
                ReturnType<LanguageModelV1['doGenerate']>
            > | null

            if (cached) {
                return {
                    ...cached,
                    response: {
                        ...cached.response,
                        timestamp: cached?.response?.timestamp
                            ? new Date(cached?.response?.timestamp)
                            : undefined,
                    },
                }
            }

            const result = await doGenerate()

            cache.set(cacheKey, result)

            return result
        },
        wrapStream: async ({ doStream, model, params }) => {
            const cacheKey = JSON.stringify({
                modelId: model.modelId,
                ...params,
            })

            // Check if the result is in the cache
            const cached = (await cache.get(
                cacheKey,
            )) as LanguageModelV1StreamPart[]

            // If cached, return a simulated ReadableStream that yields the cached result
            if (cached) {
                // Format the timestamps in the cached response
                const formattedChunks = cached.map((p) => {
                    if (p.type === 'response-metadata' && p.timestamp) {
                        return { ...p, timestamp: new Date(p.timestamp) }
                    } else return p
                })
                return {
                    stream: simulateReadableStream({
                        initialDelayInMs: 0,
                        chunkDelayInMs: 5,
                        chunks: formattedChunks,
                    }),

                    rawCall: { rawPrompt: null, rawSettings: {} },
                }
            }

            // If not cached, proceed with streaming
            const { stream, ...rest } = await doStream()

            const fullResponse: LanguageModelV1StreamPart[] = []

            const transformStream = new TransformStream<
                LanguageModelV1StreamPart,
                LanguageModelV1StreamPart
            >({
                transform(chunk, controller) {
                    fullResponse.push(chunk)
                    controller.enqueue(chunk)
                },
                flush() {
                    // Store the full response in the cache after streaming is complete
                    // console.log(`saving`,  fullResponse)
                    cache.set(cacheKey, fullResponse)
                    cache.save(true)
                },
            })

            return {
                stream: stream.pipeThrough(transformStream),
                ...rest,
            }
        },
    }
    return cacheMiddleware
}
