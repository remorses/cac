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

function getPrompt({
    description,
    textToReplace,
    exampleTextToMigrate,
}: RephraseSchema) {
    return `
You are a web developer that has to replace the text from a Framer template with new text that follows the new business and branding of the customer, this is the customer description of what the new page should talk about:

\`\`\`
${description}
\`\`\`

Here are the text to replace in JSON format, keep the new text about the same length as the old text, you should return NDJSON list with the same number of items and using the same ids for each item,but rephrased to follow the new customer business idea. some text will remain the same because part of the UI, for example text like "accept cookies" or "privacy policy" will not change, but the rest of the text should be rephrased:

${JSON.stringify(textToReplace)}

Give me now the NDJSON (json strings delimited by new lines) list of the new text to replace the old text with. Use the same shape as the given JSON, a list of strings or objects.
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
        async function* rephrase({ request, params, body, store }) {
            const {
                exampleTextToMigrate,
                description,
                textToReplace: oldText,
            } = body
            console.log(oldText)
            const stream = await streamText({
                prompt: getPrompt({
                    description,
                    textToReplace: oldText,
                    exampleTextToMigrate,
                }),
                model: openai('gpt-3.5-turbo'),
                temperature: 0.7,
                abortSignal: request.signal,
            })
            let buffer = ''
            let lastYieldTime = 0
            for await (const part of stream.textStream) {
                const parts = part.split('\n')
                for (let p of parts) {
                    buffer += p
                    try {
                        let obj = JSON.parse(buffer)
                        const now = Date.now()
                        if (now - lastYieldTime <= 100) {
                            await sleep(100 - (now - lastYieldTime))
                        }
                        console.log('obj', obj)
                        yield obj
                        buffer = ''
                        lastYieldTime = Date.now()
                    } catch {
                        // console.log('error', buffer)
                    }
                }
            }
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

app.use(swagger({}))
export type RouteType = typeof app
