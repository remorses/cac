import { Spiceflow } from 'spiceflow'

import { notifyError } from 'website/src/lib/errors'

import { db } from 'db/kysely'
import { getOrgCredits, validateLicenseKey } from 'website/src/lib/credits'
import {
    fetchFormattedHtml,
    getWebsiteInfo,
} from 'website/src/lib/htmlrewrite.server'
import { RewriteSchema, rewriteTemplateContent } from 'website/src/lib/rewrite'
import { splitIntoWords } from 'website/src/lib/ssr.server'
import { Iterated } from 'website/src/lib/utils'
import { z } from 'zod'

export const rewritePluginApp = new Spiceflow({
    basePath: '/rewritePlugin',
})
    .state('userId', '')
    .state('orgId', '')

    .post(
        '/rephrase',
        async function* ({ store, request }) {
            let body = await request.json()
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
            let objectStream = rewriteTemplateContent({
                description,
                exampleTextToMigrate,
                textToReplace,
                onToken(token) {
                    // process.stdout.write(token)
                },
                signal: request.signal,
            })
            let finalObject: Iterated<typeof objectStream>['finalObject']
            try {
                for await (let chunk of objectStream) {
                    let object = chunk.object
                    if (object) {
                        chars += object?.content?.length || 0
                        words +=
                            splitIntoWords(object.content || '')?.length || 0
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
            body: RewriteSchema,
            // response: {
            //     200: t.AsyncIterator(t.String()),
            // },
        },
    )
    .post(
        '/getCredits',
        async ({ store, request }) => {
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
            // response: {
            //     200: t.AsyncIterator(t.String()),
            // },
        },
    )
    .post(
        '/activateLicense',
        async ({ store, request }) => {
            let body = await request.json()
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
            body: z.object({
                licenseKey: z.string(),
            }),
            // response: {
            //     200: t.AsyncIterator(t.String()),
            // },
        },
    )

    .post(
        '/scrapeWebsite',
        async function* scrape({ request, store }) {
            let body = await request.json()
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

                let stream = getWebsiteInfo({
                    html,
                    signal: request.signal,
                })
                let finalObject: Iterated<typeof stream>['finalObject']
                let extractedDescription = ''
                for await (let chunk of stream) {
                    if (chunk.finalObject) {
                        finalObject = chunk.finalObject
                        const websiteDescription =
                            chunk.finalObject.websiteDescription
                        extractedDescription = websiteDescription
                        yield {
                            extractedDescription,
                            message: 'scraped website description',
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

                if (request.signal.aborted) {
                    return
                }

                let host = new URL(url).hostname
                const allObjects = finalObject?.extractedContent || []
                if (!allObjects.length) {
                    console.log(`getWebsiteInfo did not return any objects`)
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
            body: z.object({
                domain: z.string(),
            }),
            // response: {
            //     200: t.AsyncIterator(t.String()),
            // },
        },
    )

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})
