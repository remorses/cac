import { Spiceflow } from 'spiceflow'

import { notifyError } from 'website/src/lib/errors'

import { db } from 'db/kysely'
import { getOrgCredits, validateLicenseKey } from 'website/src/lib/credits'
import {
    fetchFormattedHtml,
    getWebsiteDescription,
} from 'website/src/lib/htmlrewrite.server'
import { RewriteSchema, rewriteTemplateContent } from 'website/src/lib/rewrite'
import { splitIntoWords } from 'website/src/lib/ssr.server'
import { oldTextTreeToXml } from 'website/src/lib/utils'
import { rewriteXmlContent } from 'website/src/lib/xml'
import { z } from 'zod'

export const rewritePluginApp = new Spiceflow({
    basePath: '/rewritePlugin',
})
    .state('userId', '')
    .state('userEmail', '')
    .state('orgId', '')
    .post(
        '/submitReview',
        async ({ state: store, request }) => {
            const body = await request.json()

            const { stars, generationId } = body
            const userId = store.userId
            const orgId = store.orgId

            if (!userId || !orgId) {
                throw unauthorizedResponse
            }

            try {
                await db
                    .updateTable('Generation')
                    .set({ starsReview: stars })
                    .where('id', '=', generationId)
                    .where('orgId', '=', orgId)
                    .execute()

                return { success: true }
            } catch (error) {
                console.error('Failed to submit review:', error)
                return { success: false, error: 'Failed to submit review' }
            }
        },
        {
            body: z.object({
                stars: z.number().int().min(1).max(5),
                generationId: z.number().int().positive(),
            }),
        },
    )

    .post(
        '/rephrase',
        async function* ({ state: store, request }) {
            let body = await request.json()
            const userId = store.userId
            const userEmail = store.userEmail

            if (!userId) {
                // console.log(request.headers.get('cookie'))
                throw unauthorizedResponse
            }
            request.signal.addEventListener('abort', () => {
                console.log('aborting rephrase')
            })
            console.log(
                'starting to rephrase',
                JSON.stringify(body.description),
            )
            const {
                description,
                sourceHtml,
                oldText: oldText,
                url,
                pagePath,
                projectName,
            } = body
            const xml = oldTextTreeToXml(oldText)

            // let linksPromise = extractExternalLinks({
            //     websiteUrl: url,
            //     xml,
            //     formattedHtml: sourceHtml || undefined,
            // }).catch((e) => {
            //     notifyError(e, 'error extracting links')
            //     return []
            // })
            let words = 0
            let chars = 0
            let objectStream = rewriteTemplateContent({
                description,
                pagePath,
                projectName,
                oldText: oldText,
                sourceHtml,
                url,
                user: userEmail,
                onToken(token) {
                    // process.stdout.write(token)
                },
                signal: request.signal,
            })
            let resultXml = ''

            const newContent: { nodeId: string; newContent?: string }[] = []
            try {
                for await (let chunk of objectStream) {
                    // console.log('chunk', chunk)
                    yield {
                        ...chunk,
                        type: 'chunk' as const,
                        partialItem:
                            chunk.type === 'partialItem'
                                ? chunk.partialItem
                                : null,
                        completeObj:
                            chunk.type === 'fullItem' ? chunk.fullItem : null,
                    }
                    let object = chunk.type === 'fullItem' && chunk.fullItem
                    if (object) {
                        chars += object?.newContent?.length || 0
                        words +=
                            splitIntoWords(object.newContent || '')?.length || 0
                        if (object?.nodeId) {
                            newContent.push({
                                nodeId: object.nodeId,
                                newContent: object.newContent || '',
                            })
                        }
                    }
                    if (chunk.type === 'fullXml') {
                        resultXml += chunk.fullXml + '\n\n---\n\n'
                    }
                }

                console.log('saving generation on db')
            } catch (e) {
                notifyError(e, 'error rephrasing ')
                throw e
            } finally {
                const [gen] = await Promise.all([
                    db
                        .insertInto('Generation')
                        .values({
                            words,
                            orgId: userId,
                            description,
                            domain: url,
                            initialXml: xml,
                            resultXml,
                            status: request.signal.aborted
                                ? 'cancelled'
                                : 'accepted',
                            chars,
                            pagePath,
                            projectName,
                            // arguments: body,
                            createdAt: new Date(),
                        })
                        .returningAll()
                        .execute(),
                ])
                yield {
                    type: 'generation' as const,
                    generationId: gen[0]?.id,
                }
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
        '/discardGeneration',
        async ({ state: store, request }) => {
            let body = await request.json()
            const userId = store.userId
            if (!userId) {
                throw new Error('Unauthorized')
            }

            const { id } = body
            if (!id) {
                return { error: 'No id provided' }
            }

            await db
                .updateTable('Generation')
                .set({ status: 'discarded' })
                .where('id', '=', id)
                .execute()

            return { success: true }
        },
        {
            body: z.object({
                id: z.number(),
            }),
        },
    )
    .post(
        '/getCredits',
        async ({ state: store, request }) => {
            // console.log('cookies', cookie)
            // const { userId } = await getSupabaseSession({ request })
            // if (!userId) {
            //     throw new AppError('No user id')
            // }
            const userId = store.userId
            if (!userId) {
                throw unauthorizedResponse
            }
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
        async ({ state: store, request }) => {
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

    // .post(
    //     '/scrapeWebsite',
    //     async function* scrape({ request, state: store }) {
    //         let body = await request.json()
    //         let { domain } = body

    //         const userId = store.userId
    //         if (!userId) {
    //             throw unauthorizedResponse
    //         }
    //         try {
    //             let url = domain
    //             // if there is no https:// or http:// prefix, add it
    //             if (!url.startsWith('https://') && !url.startsWith('http://')) {
    //                 url = 'https://' + url
    //             }
    //             try {
    //                 new URL(url)
    //             } catch (e) {
    //                 throw new Response('Invalid url', { status: 400 })
    //             }
    //             const alreadyScraped = await db
    //                 .selectFrom('ScrapedWebsitePage')
    //                 .where('url', '=', url)
    //                 .selectAll()
    //                 .executeTakeFirst()
    //             let shouldUseCache = true
    //             if (process.env.NODE_ENV !== 'development') {
    //                 shouldUseCache = false
    //             }
    //             const dayAgo = new Date().getTime() - 1000 * 60 * 60 * 24
    //             // shouldUseCache = false
    //             if (
    //                 alreadyScraped &&
    //                 new Date(alreadyScraped?.createdAt).getTime() > dayAgo &&
    //                 shouldUseCache &&
    //                 alreadyScraped?.extractedDescription &&
    //                 alreadyScraped?.data
    //             ) {
    //                 // return { message: 'already scraped', object: null }
    //                 const data = alreadyScraped?.data as any
    //                 if (!Array.isArray(data)) {
    //                     throw new Error(
    //                         'previously scraped data is not an array',
    //                     )
    //                 }
    //                 for (let object of data) {
    //                     yield {
    //                         message: `scraped ${object.hierarchy} ${JSON.stringify(object.content || '')}`,
    //                         object,
    //                     }
    //                 }
    //                 if (alreadyScraped.extractedDescription) {
    //                     yield {
    //                         message: '',
    //                         object: null,
    //                         extractedDescription:
    //                             alreadyScraped.extractedDescription,
    //                     }
    //                 }
    //                 return
    //             }

    //             // if (!isValidDomain(domain)) {
    //             //     throw new AppError('Invalid domain')
    //             // }

    //             yield {
    //                 message: 'analyzing the website content...',
    //                 object: null,
    //             }
    //             // yield {
    //             //     message: 'taking screenshot of the page...',
    //             //     object: null,
    //             // }

    //             const [
    //                 html, //
    //                 // { image },
    //             ] = await Promise.all([
    //                 fetchFormattedHtml(url),

    //                 // screenshot(url),
    //             ])

    //             let stream = getWebsiteInfo({
    //                 html,
    //                 signal: request.signal,
    //             })
    //             let finalObject: Iterated<typeof stream>['finalObject']
    //             let extractedDescription = ''
    //             for await (let chunk of stream) {
    //                 if (chunk.finalObject) {
    //                     finalObject = chunk.finalObject
    //                     const websiteDescription =
    //                         chunk.finalObject.websiteDescription
    //                     extractedDescription = websiteDescription
    //                     yield {
    //                         extractedDescription,
    //                         message: 'scraped website description',
    //                     }
    //                 }

    //                 let object = chunk.object
    //                 if (object) {
    //                     yield {
    //                         object,
    //                         message: `scraped ${object.hierarchy} ${JSON.stringify(object.content || '')}`,
    //                     }
    //                 }
    //             }

    //             if (request.signal.aborted) {
    //                 return
    //             }

    //             let host = new URL(url).hostname
    //             const allObjects = finalObject?.extractedContent || []
    //             if (!allObjects.length) {
    //                 console.log(`getWebsiteInfo did not return any objects`)
    //             }
    //             await Promise.all([
    //                 db
    //                     .insertInto('ScrapedWebsitePage')
    //                     .values({
    //                         url,
    //                         data: JSON.stringify(allObjects),
    //                         // siteId: userId,
    //                         extractedDescription,
    //                         domain: host,
    //                         orgId: userId,
    //                     })
    //                     .onConflict((oc) => {
    //                         return oc.columns(['url']).doUpdateSet({
    //                             data: JSON.stringify(allObjects),
    //                             createdAt: new Date(),
    //                             extractedDescription,
    //                             orgId: userId,
    //                         })
    //                     })
    //                     .execute(),
    //             ])
    //         } catch (e) {
    //             notifyError(e, 'error scraping website ' + domain)
    //             throw e
    //         } finally {
    //         }

    //         // const res = await fetch(`https://${domain}`)
    //     },
    //     {
    //         body: z.object({
    //             domain: z.string(),
    //         }),
    //         // response: {
    //         //     200: t.AsyncIterator(t.String()),
    //         // },
    //     },
    // )

    .post(
        '/getWebsiteHtml',
        async function scrape({ request, state: store }) {
            let body = await request.json()
            const userEmail = store.userEmail
            let { domain } = body

            const userId = store.userId
            if (!userId) {
                throw unauthorizedResponse
            }

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
            const [html, existingEntry] = await Promise.all([
                fetchFormattedHtml({ url, signal: request.signal }),
                db
                    .selectFrom('ScrapedWebsitePage')
                    .selectAll()
                    .where('url', '=', url)
                    .executeTakeFirst(),
            ])
            // Check if the database already has a description for this URL

            const dayAgo = new Date().getTime() - 1000 * 60 * 60 * 24
            if (
                existingEntry?.extractedDescription &&
                new Date(existingEntry.createdAt).getTime() > dayAgo
            ) {
                return {
                    html,
                    extractedDescription: existingEntry.extractedDescription,
                }
            }

            // If no existing description, proceed to extract a new one
            const { extractedDescription } = await getWebsiteDescription({
                html,
                url,
                user: userEmail,
                signal: request.signal,
            })

            await Promise.all([
                db
                    .insertInto('ScrapedWebsitePage')
                    .values({
                        url,
                        // siteId: userId,
                        data: JSON.stringify([]),
                        extractedDescription,
                        domain,
                        orgId: userId,
                    })
                    .onConflict((oc) => {
                        return oc.columns(['url']).doUpdateSet({
                            data: JSON.stringify([]),
                            createdAt: new Date(),
                            extractedDescription,
                            orgId: userId,
                        })
                    })
                    .execute(),
            ])
            return {
                html,
                extractedDescription,
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
