import { Elysia, Static, t } from 'elysia'
import { z } from 'zod'
import stripJsonComments from 'strip-json-comments'

import { EventIterator } from 'event-iterator'

import { openai } from '@ai-sdk/openai'
import { swagger } from '@elysiajs/swagger'
import { CoreMessage, streamObject, streamText, StreamTextResult } from 'ai'
import { notifyError } from 'website/src/lib/errors'

import { db } from 'db/kysely'
import { getOrgCredits, validateLicenseKey } from 'website/src/lib/credits'
import {
    fetchFormattedHtml,
    getWebsiteDescription,
    getWebsiteInfo,
} from 'website/src/lib/htmlrewrite.server'
import { splitIntoWords } from 'website/src/lib/ssr.server'
import { Iterated, sleep } from 'website/src/lib/utils'
import {
    NDJSONStream,
    yieldMaxEveryMs,
    yieldNewArrayItems,
} from 'website/src/lib/ndjson'

const RephraseSchema = t.Object({
    description: t.String(),
    textToReplace: t.Array(
        t.Object({
            // name: t.Optional(t.String()),
            content: t.Optional(t.String()),
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

function generateMigrationPrompt({
    description,
    exampleTextToMigrate,
}): string {
    return `
You are an AI assistant tasked with migrating content from one website to a new template. Your goal is to preserve the structure and feel of the template while incorporating relevant content from the website being migrated.

Website Owner's Description and Instructions:
\`\`\`
${description || 'No specific instructions provided'}
\`\`\`

Content from Website Being Migrated:
${convertExamplesToMarkdownList(exampleTextToMigrate)}

Instructions:
* Replace the content of each item in the template with text that aligns with the website owner's description and the migrated content.
* Maintain similar content length and structure to the original template where appropriate.
* Preserve UI-specific text (e.g., "Accept Cookies", "Privacy Policy").
* Update href values if present and relevant to the new content.
* Use content from the website being migrated if it fits well within the template structure.
* If the migrated content doesn't fit perfectly, create new content that matches the style and intent of the website being migrated.

Output: Provide a JSON object with two main fields:

* "${RephraseObjectFields.stepByStepReasoning}": An array of strings explaining your thought process for converting the text, what the new website should look like, and why.

* "${RephraseObjectFields.convertedItems}": An array of objects, each representing a piece of content from the template that has been updated. Each object should include:
  - "previousContent": The content from the template now being replaced, this field should come first in the object
  - "content": The new or migrated content, should have similar length to the template content
  - "nodeId": The identifier from the original template item
  - "href": Updated link if applicable (optional)

Remember:
* Aim for a similar text length to the original template items. If you can't find an example content from the examples rephrase it or invent a new one
* Ensure all items from the template are represented in the output.
* Balance between using migrated content and creating new content that fits the template and owner's description.
* Maintain the overall tone and style of the website being migrated.

Please provide a well-structured and valid JSON object as your response, adhering to the schema defined.

Provide a new text replacement for all the current template text items.

"${RephraseObjectFields.stepByStepReasoning}" should come before "${RephraseObjectFields.convertedItems}" in the JSON object.

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
                    let objectStream = rephrase({
                        description,
                        exampleTextToMigrate,
                        textToReplace,
                        onToken(token) {
                            // process.stdout.write(token)
                        },
                        signal: request.signal,
                    })
                    let finalObject: Iterated<
                        typeof objectStream
                    >['finalObject']
                    try {
                        for await (let chunk of objectStream) {
                            let object = chunk.object
                            if (object) {
                                chars += object?.content?.length || 0
                                words +=
                                    splitIntoWords(object.content || '')
                                        ?.length || 0
                                console.log('object', object)
                                yield object
                            }
                            if (chunk.finalObject) {
                                finalObject = chunk.finalObject
                            }
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

                        let stream = getWebsiteInfo({
                            html,
                            signal: request.signal,
                        })
                        let finalObject: Iterated<typeof stream>['finalObject']
                        for await (let chunk of stream) {
                            if (chunk.finalObject) {
                                finalObject = chunk.finalObject
                                const websiteDescription =
                                    chunk.finalObject.websiteDescription
                                yield {
                                    websiteDescription,
                                }
                            }
                            let object = chunk.object
                            if (object) {
                                yield {
                                    object,
                                    message: `scraped ${object.hierarchy} ${JSON.stringify(object.content || '')}`,
                                }
                            }
                        }

                        let descriptionPromise = getWebsiteDescription({
                            html,
                            signal: request.signal,
                        })

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
                        const allObjects = finalObject?.extractedContent || []
                        if (!allObjects.length) {
                            console.log(
                                `getWebsiteInfo did not return any objects`,
                            )
                        }
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

enum RephraseObjectFields {
    convertedItems = 'convertedItems',
    stepByStepReasoning = 'stepByStepReasoning',
}

const ITEMS_PER_ITERATION = 25

function splitArrayInChunks(arr: any[], chunkSize: number) {
    let result = [] as any[][]
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize))
    }
    return result
}

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
    let schema = z.object({
        [RephraseObjectFields.stepByStepReasoning]: z.array(z.string()),
        [RephraseObjectFields.convertedItems]: z.array(
            z.object({
                content: z.string(),
                nodeId: z.string(),
                href: z.string().optional(),
            }),
        ),
    })

    let finalObject: z.infer<typeof schema> | undefined
    let missedItems: any[] = []
    let iterationsCount = 0

    let messages: CoreMessage[] = [
        {
            role: 'user',
            content: generateMigrationPrompt({
                description,
                exampleTextToMigrate,
            }),
        },
    ]

    const chunkedOldText = splitArrayInChunks(oldText, ITEMS_PER_ITERATION)

    while (iterationsCount < chunkedOldText.length || missedItems.length > 0) {
        console.log('iterationsCount', iterationsCount)
        let currentChunk = [] as any[]
        if (iterationsCount < chunkedOldText.length) {
            currentChunk = chunkedOldText[iterationsCount]
            console.log(`asking to convert ${currentChunk.length} items`)
            messages.push({
                role: 'user',
                content: `Please convert the following template items:\n${JSON.stringify(currentChunk, null, 2)}`,
            })
        } else if (missedItems.length > 0) {
            console.log(`asking to convert ${missedItems.length} missing items`)
            currentChunk = missedItems
            messages.push({
                role: 'user',
                content: `You missed ${missedItems.length} items, please convert these remaining template items:\n${JSON.stringify(missedItems, null, 2)}`,
            })
        } else {
            throw new Error('No more items to convert')
        }

        const stream = await streamObject({
            messages,
            schema,
            model: openai('gpt-4o'),
            temperature: 0.5,
            abortSignal: signal,
        })

        let objectStream = yieldNewArrayItems({
            arrayField: RephraseObjectFields.convertedItems,
            stream: yieldMaxEveryMs({
                ms: 200,
                stream: stream.partialObjectStream,
            }),
        })

        for await (let object of objectStream) {
            yield {
                object: object,
            }
        }

        const iterationObject = await stream.object

        if (
            iterationObject[RephraseObjectFields.convertedItems].length !==
            currentChunk.length
        ) {
            console.log(
                `LLM returned different number of items than we asked for: ${currentChunk.length} vs ${iterationObject[RephraseObjectFields.convertedItems].length}`,
            )
        }

        if (!finalObject) {
            finalObject = iterationObject
        } else {
            finalObject.stepByStepReasoning.push(
                ...iterationObject.stepByStepReasoning,
            )
            finalObject.convertedItems.push(...iterationObject.convertedItems)
        }

        messages.push({
            role: 'assistant',
            content: JSON.stringify(iterationObject, null, 2),
        })

        iterationsCount++

        // Update missed items
        missedItems = oldText.filter(
            (oldItem) =>
                !finalObject!.convertedItems.some(
                    (newItem) => newItem.nodeId === oldItem.nodeId,
                ),
        )
    }

    yield {
        finalObject,
    }
}

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})
