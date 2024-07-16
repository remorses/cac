import OpenAI from 'openai'

export async function EvenStream<T>(
    asyncGen: () => AsyncGenerator<T, void, undefined>,
    request: Request,
): Promise<Response> {
    const { signal } = request

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            signal.addEventListener('abort', () =>
                controller.error('Request aborted'),
            )

            try {
                for await (const item of asyncGen()) {
                    if (signal.aborted) {
                        break
                    }
                    const chunk = new TextEncoder().encode(
                        `data: ${JSON.stringify(item)}\n\n`,
                    )
                    controller.enqueue(chunk)
                }
                controller.close()
            } catch (error) {
                controller.error(error)
            }
        },
        cancel(reason) {
            console.log(reason) // Handle cancellation if needed
        },
    })

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
    })
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})
