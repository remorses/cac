import { Elysia, Static, t } from 'elysia'
import stripJsonComments from 'strip-json-comments'

import { EventIterator } from 'event-iterator'

import { openai } from '@ai-sdk/openai'
import { swagger } from '@elysiajs/swagger'
import { streamText, StreamTextResult } from 'ai'
import { notifyError } from 'website/src/lib/errors'

import { db } from 'db/kysely'
import { getOrgCredits, validateLicenseKey } from 'website/src/lib/credits'
import {
    fetchFormattedHtml,
    getWebsiteDescription,
    getWebsiteInfo,
} from 'website/src/lib/htmlrewrite.server'
import { splitIntoWords } from 'website/src/lib/ssr.server'
import { sleep } from 'website/src/lib/utils'
import { NDJSONStream } from 'website/src/lib/ndjson'

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
\`\`\`
${description || 'No description provided'}
\`\`\`


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
3. The 'text' field contains the new content based on the new website description and the migrated website content but with similar length to the template text that it replaces.
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

export const rewritePluginApp = new Elysia({
    aot: false,
})
    .state('userId', '')
    .state('orgId', '')
    .group('/rewritePlugin', (group) => {
        return group
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
                    const { description, exampleTextToMigrate, textToReplace } =
                        body
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
                            words +=
                                splitIntoWords(chunk?.text || '')?.length || 0
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
                '/activateLicense',
                async ({ body, cookie, store, request }) => {
                    // console.log('cookies', cookie)
                    // const { userId } = await getSupabaseSession({ request })
                    // if (!userId) {
                    //     throw new AppError('No user id')
                    // }
                    const userId = store.userId
                    if (!userId) {
                        throw unauthorizedResponse
                    }

                    const { licenseKey } = body
                    const { valid, credits } = await validateLicenseKey({
                        orgId: userId,
                        licenseKey,
                    })
                    return { valid, credits }
                },
                {
                    body: t.Object({
                        licenseKey: t.String(),
                    }),
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
                        if (
                            !url.startsWith('https://') &&
                            !url.startsWith('http://')
                        ) {
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

                        let allObjects =
                            [] as RephraseSchema['exampleTextToMigrate']
                        let emitter = new EventIterator<{
                            object: RephraseSchema['exampleTextToMigrate'][0]
                            message: string
                        }>((queue) => {
                            getWebsiteInfo({
                                html,
                                signal: request.signal,
                                onObject(object) {
                                    console.log(
                                        'adding object to queue',
                                        object,
                                    )
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

                        const { extractedDescription } =
                            await descriptionPromise
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
                                    orgId: userId,
                                })
                                .onConflict((oc) => {
                                    return oc.columns(['url']).doUpdateSet({
                                        data: JSON.stringify(allObjects),
                                        createdAt: new Date(),
                                        extractedDescription,
                                        orgId: userId,
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
    })

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
        messages: [
            {
                role: 'user',
                content: generateMigrationPrompt({
                    description,
                    textToReplace: oldText,
                    exampleTextToMigrate,
                }),
            },
        ],
        model: openai('gpt-4o'),
        temperature: 0.5,
        abortSignal: signal,
    })
    yield* NDJSONStream<RephraseResultItem>({
        stream,
        minTime: 200,
        onToken,
    })
}

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})
