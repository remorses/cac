import { Elysia, Static, t } from 'elysia'
import stripJsonComments from 'strip-json-comments'

import { anthropic } from '@ai-sdk/anthropic'

import { EventIterator } from 'event-iterator'

import { swagger } from '@elysiajs/swagger'
import { Session } from '@supabase/supabase-js'
import { AppError } from 'website/src/lib/errors'
import { notifyError } from 'website/src/lib/errors'
import { StreamTextResult, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { cors } from '@elysiajs/cors'

import {
    createSupabaseAnon,
    getSupabaseSession,
} from 'website/src/lib/supabase.server'
import { sleep } from 'website/src/lib/utils'
import {
    fetchFormattedHtml,
    getWebsiteDescription,
    getWebsiteInfo,
} from 'website/src/lib/htmlrewrite.server'
import { db } from 'db/kysely'
import { generatePassword, splitIntoWords } from 'website/src/lib/ssr.server'
import { getOrgCredits } from 'website/src/lib/credits'
import { env } from 'website/src/lib/env'
import { prisma } from 'db/prisma'

const RephraseSchema = t.Object({
    description: t.String(),
    textToReplace: t.Array(
        t.Object({
            name: t.Optional(t.String()),
            text: t.Optional(t.String()),
            nodeId: t.Optional(t.String()),
            href: t.Optional(t.String()),
            // index: t.Number(),
        }),
    ),
    exampleTextToMigrate: t.Array(
        t.Object({
            hierarchy: t.Optional(t.String()), // for example "hero/heading" or "features/paragraph"
            content: t.Optional(t.String()),
            href: t.Optional(t.String()),
            // other possible fields like price for price plans, etc
        }),
    ),
})

export type RephraseSchema = Static<typeof RephraseSchema>

const RephraseResultItem = t.Object({
    nodeId: t.Optional(t.String()),
    text: t.Optional(t.String()),
    href: t.Optional(t.String()),
})

export type RephraseResultItem = Static<typeof RephraseResultItem>

function generateMigrationPrompt({
    description,
    textToReplace,
    exampleTextToMigrate,
}: RephraseSchema): string {
    return `
Current Template Content (only consider the phrasing, not the content):
${JSON.stringify(textToReplace, null, 2)}

This is the current template content. Ignore its meaning; we want to replace it with the content of another website that is being migrated to this template, but still keep the template text length and structure.

Description and instructions from the website owner:
${description}

Instructions:
1. Replace the content of each item with text that fits the above description.
2. Maintain similar content length and structure where appropriate.
3. Preserve UI-specific text (e.g., "Accept Cookies", "Privacy Policy").
4. Update href values if present and relevant to the new content.
5. Use the content from current website being migrated if it fits an item in the template structure:

Content from the website being migrate:
${convertExamplesToMarkdownList(exampleTextToMigrate)}

Output: Provide an NDJSON list of rephrased content items. Each item should be a valid JSON object on a single line, containing 'nodeId', 'text', 'href' (if applicable), and 'previousText' fields. Ensure that:
1. All items from the template content should be represented in the output.
2. Each output item uses the exact nodeId from the corresponding template item.
3. The 'text' field contains the new content based on the new website description and the migrated website content.
4. The 'href' field is updated if present and relevant to the new content.
5. The 'previousText' field contains the original text from the template.

Note: The example content structure is for reference and may not cover all items in the template content. Use it as a guide but ensure all current template items are processed and replaced. If a piece of text from the website being migrated fits a spot in the template perfectly use it as it is.

Return only NDJSON and not a JSON array, think step by step using comment, start a line with // if you want to reason about an item before writing it. 

The things you should keep in mind when replacing old text with new one is
- The size of the new text should be similar to the template text
- If the example texts given don't fit the text to replace because too long or too short or different in semantics, you can invent new ones that follow the same  as the website being migrated
`
}

export function convertExamplesToMarkdownList(
    examples: RephraseSchema['exampleTextToMigrate'],
) {
    if (!examples.length) {
        return 'No example content provided'
    }
    let markdown = ''

    for (let example of examples) {
        const { content, hierarchy, ...attributes } = example
        markdown += `- section ${example.hierarchy}: ${JSON.stringify(example.content)}`
        if (Object.keys(attributes).length) {
            markdown += `, attributes: ${JSON.stringify(attributes)}`
        }
        markdown += '\n'
    }
    return markdown
}

export const app = new Elysia({ prefix: '/api/v1', aot: false })
    .state('userId', '')
    .state('session', {} as Session)
    .use(
        cors({
            // credentials: true,
            // origin: env.PUBLIC_URL,
            // exposeHeaders: '*',
            maxAge: 60 * 60 * 24,
            preflight: true,
            // allowedHeaders: '*',
        }),
    )
    .onError(({ code, error }) => {
        if (error instanceof Response) {
            return error
        }
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

    .onRequest(async ({ request, set, store }) => {
        const response = new Response()
        let pluginCookie = request.headers.get('pluginCookie')
        if (pluginCookie) {
            // console.log('setting cookie', pluginCookie)
            request.headers.set('Cookie', pluginCookie)
        }
        const { userId, session } = await getSupabaseSession({
            request,
            response,
        })

        for (let [header, value] of response.headers.entries()) {
            // console.log('setting header', header, value)
            set.headers[header] = value
        }

        store.userId = userId || ''
        store.session = session!
    })
    .post(
        '/getSessionForKey',
        async ({ body, request }) => {
            // check in database if user with key has logged in, if yes, generate a supabase session for it

            if (!body.key) {
                return { error: 'No key provided' }
            }
            const hourAgo = new Date()
            hourAgo.setHours(hourAgo.getHours() - 1)
            const [framerRequest] = await Promise.all([
                db
                    .selectFrom('FramerLoginRequest')
                    .where('key', '=', body.key)
                    .where('usedByUserId', 'is not', null)
                    .where('createdAt', '>', hourAgo)
                    .selectAll()
                    .executeTakeFirst(),
            ])
            if (!framerRequest) {
                return { error: 'No valid framer request found' }
            }
            const user = await db
                .selectFrom('auth.users')
                .where('id', '=', framerRequest.usedByUserId)
                .selectAll()
                .executeTakeFirst()

            if (!user) {
                throw new Error('No user found for request')
            }
            if (!user.plainPassword) {
                throw new Error('No user password found for user')
            }
            if (!user.email) {
                throw new Error('No user email found for user')
            }

            async function createTempSession() {
                const tempSupabase = createSupabaseAnon()
                // i am logging in again with password because supabase will log out the user if the refresh token is used in 2 places at the same time
                const {
                    data: { session: sessionToPass },
                    error: signInError,
                } = await tempSupabase.auth.signInWithPassword({
                    email: user!.email!,
                    password: user!.plainPassword!,
                })
                if (signInError) {
                    console.error('Failed to sign in')
                    throw signInError
                }
                if (!sessionToPass) {
                    throw new Error('No session')
                }
                return sessionToPass
            }
            const [sessionToPass] = await Promise.all([
                createTempSession(),
                // supabase.auth.signInWithPassword({
                //     email: user.email,
                //     password: user.plainPassword,
                // }),
            ])
            return { session: sessionToPass }
        },
        {
            body: t.Object({
                key: t.String(),
            }),
            // response: {
            //     200: t.AsyncIterator(t.String()),
            // },
        },
    )
    // .guard({
    //     type: 'application/json',
    //     response: {
    //         500: t.String(),
    //     },
    // })

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
        async function* ({ body, store, request }) {
            const userId = store.userId

            if (!userId) {
                // console.log(request.headers.get('cookie'))
                throw new Response('No user id found', {
                    status: 401,
                })
            }
            request.signal.addEventListener('abort', () => {
                console.log('aborting rephrase')
            })
            console.log(
                'starting to rephrase',
                JSON.stringify(body.description),
            )
            const { description, exampleTextToMigrate, textToReplace } = body
            let words = 0
            let chars = 0
            try {
                for await (let chunk of rephrase({
                    description,
                    exampleTextToMigrate,
                    textToReplace,
                    onToken(token) {
                        // process.stdout.write(token)
                    },
                    signal: request.signal,
                })) {
                    chars += chunk?.text?.length || 0
                    words += splitIntoWords(chunk?.text || '')?.length || 0
                    console.log('chunk', chunk)
                    yield chunk
                }
            } catch (e) {
                notifyError(e, 'error rephrasing ')
                throw e
            } finally {
                console.log('saving generation on db')
                await Promise.all([
                    db
                        .insertInto('Generation')
                        .values({
                            words,
                            orgId: userId,
                            chars,
                            arguments: body,
                            createdAt: new Date(),
                        })
                        .execute(),
                ])
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
        '/getCredits',
        async ({ body, cookie, store, request }) => {
            // console.log('cookies', cookie)
            // const { userId } = await getSupabaseSession({ request })
            // if (!userId) {
            //     throw new AppError('No user id')
            // }
            const userId = store.userId
            const credits = await getOrgCredits({ orgId: userId })

            return credits
        },
        {
            body: t.Object({}),
            // response: {
            //     200: t.AsyncIterator(t.String()),
            // },
        },
    )

    .post(
        '/scrapeWebsite',
        async function* scrape({ request, body, store }) {
            let { domain } = body

            const userId = store.userId
            if (!userId) {
                throw new Response('No user id found', {
                    status: 401,
                })
            }
            try {
                let url = domain
                // if there is no https:// or http:// prefix, add it
                if (!url.startsWith('https://') && !url.startsWith('http://')) {
                    url = 'https://' + url
                }
                try {
                    new URL(url)
                } catch (e) {
                    throw new Response('Invalid url', { status: 400 })
                }
                const alreadyScraped = await db
                    .selectFrom('ScrapedWebsitePage')
                    .where('url', '=', url)
                    .selectAll()
                    .executeTakeFirst()
                if (
                    // process.env.NODE_ENV !== 'development' &&
                    alreadyScraped?.extractedDescription &&
                    alreadyScraped?.data 
                ) {
                    // return { message: 'already scraped', object: null }
                    const data = alreadyScraped?.data as any
                    if (!Array.isArray(data)) {
                        throw new Error(
                            'previously scraped data is not an array',
                        )
                    }
                    for (let object of data) {
                        yield {
                            message: `scraped ${object.hierarchy} ${JSON.stringify(object.content || '')}`,
                            object,
                        }
                    }
                    if (alreadyScraped.extractedDescription) {
                        yield {
                            message: '',
                            object: null,
                            extractedDescription:
                                alreadyScraped.extractedDescription,
                        }
                    }
                    return
                }

                // if (!isValidDomain(domain)) {
                //     throw new AppError('Invalid domain')
                // }

                yield {
                    message: 'analyzing the website content...',
                    object: null,
                }
                // yield {
                //     message: 'taking screenshot of the page...',
                //     object: null,
                // }

                const [
                    html, //
                    // { image },
                ] = await Promise.all([
                    fetchFormattedHtml(url),

                    // screenshot(url),
                ])

                let allObjects = [] as RephraseSchema['exampleTextToMigrate']
                let emitter = new EventIterator<{
                    object: RephraseSchema['exampleTextToMigrate'][0]
                    message: string
                }>((queue) => {
                    getWebsiteInfo({
                        html,
                        signal: request.signal,
                        onObject(object) {
                            console.log('adding object to queue', object)
                            allObjects.push(object)
                            queue.push({
                                object,
                                message: `scraped ${object.hierarchy} ${JSON.stringify(object.content || '')}`,
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

                let descriptionPromise = getWebsiteDescription({
                    html,
                    signal: request.signal,
                })

                for await (let chunk of emitter) {
                    console.log('chunk', chunk)
                    yield chunk
                }
                if (request.signal.aborted) {
                    return
                }

                const { extractedDescription } = await descriptionPromise
                yield {
                    message: '',
                    object: null,
                    extractedDescription,
                }

                let host = new URL(url).hostname
                await Promise.all([
                    db
                        .insertInto('ScrapedWebsitePage')
                        .values({
                            url,
                            data: JSON.stringify(allObjects),
                            // siteId: userId,
                            extractedDescription,
                            domain: host,
                            byUserId: userId,
                        })
                        .onConflict((oc) => {
                            return oc.columns(['url']).doUpdateSet({
                                data: JSON.stringify(allObjects),
                                createdAt: new Date(),
                                extractedDescription,
                                byUserId: userId,
                            })
                        })
                        .execute(),
                ])
            } catch (e) {
                notifyError(e, 'error scraping website ' + domain)
                throw e
            } finally {
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
            throw new Response('An error occurred', { status: 400 })
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
    onToken,
}: RephraseSchema & {
    signal: AbortSignal
    onToken?: (token: string) => void
}) {
    // console.log(oldText)
    const stream = await streamText({
        prompt: generateMigrationPrompt({
            description,
            textToReplace: oldText,
            exampleTextToMigrate,
        }),
        model: anthropic('claude-3-sonnet-20240229'),
        temperature: 0.5,
        abortSignal: signal,
    })
    yield* NDJSONStream<RephraseResultItem>({
        stream,
        minTime: 200,
        onToken,
    })
}

export function splitStringButKeepChar(str: string, char: string) {
    const result = [] as string[]
    let start = 0
    for (let i = 0; i < str.length; i++) {
        if (str[i] === char) {
            result.push(str.slice(start, i + 1))
            start = i + 1
        }
    }
    if (start < str.length) {
        result.push(str.slice(start))
    }
    return result
}

export function removeMarkdownSnippets(text: string) {
    // remove lines starting with optional spaces followed by ```lang
    text = text.replace(/^\s*```.*/gm, '')
    // remove lines starting with optional spaces followed by ```
    // text = text.replace(/^\s*```/gm, '')
    return text
}

export async function* NDJSONStream<T = any>({
    stream,
    minTime = 0,
    onToken,
}: {
    stream: StreamTextResult<any>
    minTime?: number
    onToken?: (token: string) => void
}): AsyncGenerator<T, void, unknown> {
    let buffer = ''
    let lastYieldTime = 0

    for await (const part of stream.textStream) {
        onToken?.(part)
        const parts = splitStringButKeepChar(part, '\n')

        // console.log('parts', parts)
        for (let p of parts) {
            buffer += p
            try {
                let obj = JSON.parse(
                    stripJsonComments(removeMarkdownSnippets(buffer)),
                )
                const now = Date.now()
                if (now - lastYieldTime <= minTime) {
                    await sleep(minTime - (now - lastYieldTime))
                }
                // console.log('obj', obj)
                yield obj

                buffer = ''
                lastYieldTime = Date.now()
            } catch {
                // if (buffer.includes('\n')) {
                //     console.log('error', buffer)
                // }
            }
        }
    }
}

app.use(swagger({}))
export type RouteType = typeof app
