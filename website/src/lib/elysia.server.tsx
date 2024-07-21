import { Elysia, Static, t } from 'elysia'
import { anthropic } from '@ai-sdk/anthropic'

import { EventIterator } from 'event-iterator'

import isValidDomain from 'is-valid-domain'

import { swagger } from '@elysiajs/swagger'
import { Session } from '@supabase/supabase-js'
import { AppError } from 'website/src/lib/errors'
import { notifyError } from 'website/src/lib/errors'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { cors } from '@elysiajs/cors'

import { getSupabaseSession } from 'website/src/lib/supabase.server'
import { sleep } from 'website/src/lib/utils'
import { getWebsiteInfo } from 'website/src/lib/htmlrewrite.server'

const RephraseSchema = t.Object({
    description: t.String(),
    textToReplace: t.Array(
        t.Object({
            name: t.String(),
            text: t.String(),
            nodeId: t.String(),
            href: t.Optional(t.String()),
            index: t.Number(),
        }),
    ),
    exampleTextToMigrate: t.Array(
        t.Object({
            hierarchy: t.String(), // for example "hero/heading" or "features/paragraph"
            text: t.String(),
            href: t.Optional(t.String()),
            // other possible fields like price for price plans, etc
        }),
    ),
})

export type RephraseSchema = Static<typeof RephraseSchema>

const RephraseResultItem = t.Object({
    nodeId: t.String(),
    text: t.String(),
})

export type RephraseResultItem = Static<typeof RephraseResultItem>

function generateMigrationPrompt({
    description,
    textToReplace,
    exampleTextToMigrate,
}: RephraseSchema): string {
    return `
Current Website Content:
${JSON.stringify(textToReplace, null, 2)}

This is the current website content from a template. Ignore its meaning; we want to replace it with new content that aligns with the following description of the new website:

New Website Description:
${description}

Instructions:
1. Replace the content of each item with new text that fits the above description.
2. Maintain similar content length and structure where appropriate.
3. Preserve UI-specific text (e.g., "Accept Cookies", "Privacy Policy").
4. Update href values if present and relevant to the new content.
5. Use the example content structure below as a reference for style and tone:

Example Content Structure:
${JSON.stringify(exampleTextToMigrate, null, 2)}

Output: Provide an NDJSON list of rephrased content items. Each item should be a valid JSON object on a single line, containing 'nodeId', 'text', 'href' (if applicable), and 'previousText' fields. Ensure that:
1. All items from the current content are represented in the output.
2. Each output item uses the exact nodeId from the corresponding input item.
3. The 'text' field contains the new content based on the new website description.
4. The 'href' field is updated if present and relevant to the new content.
5. The 'previousText' field contains the original text from the input.

Note: The example content structure is for reference and may not cover all items in the current content. Use it as a guide for content style and tone, but ensure all current content items are processed and replaced.

Return only NDJSON and not a JSON array, don't add any other text. To think step by step you can use comment lines, start a line with // if you want to reason about an item before writing it.
`
}

export const app = new Elysia({ prefix: '/api/v1' })
    .state('userId', '')
    .state('session', {} as Session)
    .use(cors())
    .onRequest(async ({ request, set, store }) => {
        const response = new Response()
        const { userId, session } = await getSupabaseSession({
            request,
            response,
        })
        if (!userId) {
            // throw new AppError('Missing userId')
        }
        for (let [header, value] of response.headers.entries()) {
            // console.log('setting header', header, value)
            set.headers[header] = value
        }

        store.userId = userId || ''
        store.session = session!
    })
    // .guard({
    //     type: 'application/json',
    //     response: {
    //         500: t.String(),
    //     },
    // })
    .onError(({ code, error }) => {
        let status = 500
        if (code === 'VALIDATION') {
            status = 400
        } else if (code === 'PARSE') {
            status = 400
        } else if (code === 'NOT_FOUND') {
            status = 404
        } else {
            status = 500
            notifyError(error, 'API error')
        }

        return new Response(error.message, { status })
    })
    .get(
        '/health',
        () => {
            return { ok: true }
        },
        {
            type: 'application/json',
            response: {
                200: t.Object({
                    ok: t.Boolean(),
                }),
            },
            description: 'Health check',
        },
    )
    .get(
        '/sse-test',
        async function* () {
            yield { ok: true }
            yield { ok: true }
            throw new Error('hello')
            yield 'hello'
        },
        {
            description: 'Health check',
        },
    )
    .post(
        '/rephrase',
        ({ body, request }) => {
            const { description, exampleTextToMigrate, textToReplace } = body
            return rephrase({
                description,
                exampleTextToMigrate,
                textToReplace,
                signal: request.signal,
            })
        },
        {
            body: RephraseSchema,
            // response: {
            //     200: t.AsyncIterator(t.String()),
            // },
        },
    )
    .post(
        '/scrapeWebsite',
        async function* scrape({ request, body, store }) {
            let { domain } = body

            domain = domain.replace('https://', '').replace('http://', '')
            if (!domain) {
                throw new AppError('No domain provided')
            }

            if (!isValidDomain(domain)) {
                throw new AppError('Invalid domain')
            }

            yield { message: 'Analyzing the website content...', object: null }
            yield { message: 'taking screenshot of the page...', object: null }

            let emitter = new EventIterator<{
                object: RephraseSchema['exampleTextToMigrate'][0]
                message: string
            }>((queue) => {
                getWebsiteInfo({
                    domain,
                    onObject(object) {
                        queue.push({
                            object,
                            message: `scraped ${object.hierarchy} ${object.content || ''}`,
                        })
                    },
                })
                    .then((result) => {
                        queue.stop()
                    })
                    .catch((error) => {
                        queue.fail(error)
                    })
            })
            for await (let chunk of emitter) {
                console.log('chunk', chunk)
                yield chunk
            }

            // const res = await fetch(`https://${domain}`)
        },
        {
            body: t.Object({
                domain: t.String(),
            }),
            // response: {
            //     200: t.AsyncIterator(t.String()),
            // },
        },
    )
    .get(
        '/errorExample',
        () => {
            throw new Error('An error')
            return { ok: true }
        },
        {
            type: 'application/json',
            response: {
                200: t.Object({
                    ok: t.Boolean(),
                }),
            },
            description: 'Health check',
        },
    )

export async function* rephrase({
    exampleTextToMigrate,
    description,
    textToReplace: oldText,
    signal,
}: RephraseSchema & { signal: AbortSignal }) {
    // console.log(oldText)
    const stream = await streamText({
        prompt: generateMigrationPrompt({
            description,
            textToReplace: oldText,
            exampleTextToMigrate,
        }),
        model: openai('gpt-3.5-turbo'),
        temperature: 0.7,
        abortSignal: signal,
    })
    let buffer = ''
    let lastYieldTime = 0
    for await (const part of stream.textStream) {
        process.stdout.write(part)
        const parts = part.split('\n')
        for (let p of parts) {
            buffer += p
            try {
                let obj = JSON.parse(buffer)
                const now = Date.now()
                if (now - lastYieldTime <= 100) {
                    await sleep(100 - (now - lastYieldTime))
                }
                // console.log('obj', obj)
                yield obj

                buffer = ''
                lastYieldTime = Date.now()
            } catch {
                // console.log('error', buffer)
            }
        }
    }
}

app.use(swagger({}))
export type RouteType = typeof app
