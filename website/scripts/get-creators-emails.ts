import { getSitemapLinks } from './sitemap'
import { Sema } from 'sema4'
import fs from 'fs'
import * as Papa from 'papaparse'

import { HTMLRewriter } from 'htmlrewriter'

function ignoreAbortError(e: any) {
    if (e.name === 'AbortError') {
        return null
    }
    if (e.message.includes('This operation was aborted')) {
        return null
    }
    console.log('error', e)
    throw e
}

function retryFetchTwice(url, init: RequestInit, count = 0) {
    return fetch(url, init).catch(async (e) => {
        if (count < 2 && ignoreAbortError(e) === null) {
            await new Promise((r) => setTimeout(r, 1000))
            console.log('retrying fetch', url)
            return retryFetchTwice(url, init, count + 1)
        } else {
            throw e
        }
    })
}

const allEmails = [] as {
    email: string
    exampleTemplate: string
    creatorName: string
    twitter: string
    lastTemplateSubmitted: string
    ctaLink: string
    usesLemonSqueezy: boolean
    templateName: string
}[]
async function main() {
    let links = await getSitemapLinks(
        'https://www.framer.com/marketplace/sitemap.xml',
    )
    let base = 'https://www.framer.com'
    links = links.filter((x) => x.includes('/templates/'))
    console.log(`found ${links.length} templates`)
    const sema = new Sema(3)
    console.log('starting', links)

    await Promise.all(
        links.map(async (templateLink) => {
            await sema.acquire()
            try {
                console.log(
                    '........................................................',
                )
                let abortController = new AbortController()
                console.log(`fetching ${templateLink}`)
                const res = await retryFetchTwice(templateLink, {
                    signal: abortController.signal,
                    headers: {
                        accept: 'text/html',
                    },
                })
                if (!res.ok) {
                    console.log('not ok', res.status)
                    return
                }

                let creatorName = ''
                let twitter = ''
                let emailLink = ''
                let lastTemplateSubmitted = ''
                let usesLemonSqueezy = false
                let ctaLink = ''
                let lastText = ''
                let templateName = ''

                await new HTMLRewriter()
                    .on('h1', {
                        text(e) {
                            templateName += e.text
                        },
                    })
                    .on('a', {
                        element(e) {
                            const href = e.getAttribute('href')
                            if (!href) {
                                return
                            }
                            if (
                                !href.includes('/framer') &&
                                (href.includes('x.com') ||
                                    href.includes('twitter.com'))
                            ) {
                                twitter = href
                            }
                            if (
                                href.includes('mailto:') &&
                                !href.includes('@framer.com')
                            ) {
                                emailLink = extractEmailFromLink(href)
                            }
                            if (href.includes('lemonsqueezy.com')) {
                                usesLemonSqueezy = true
                            }
                            const className = e.getAttribute('class')
                            if (
                                className &&
                                className.includes('btn-primary') &&
                                e.getAttribute('target') === '_blank'
                            ) {
                                ctaLink = href
                            }
                        },
                        
                    })
                    .on('p', {
                        text(chunk) {
                            if (!chunk.text.trim()) {
                                return
                            }
                            if (chunk.text && lastText.includes('Published')) {
                                try {
                                    console.log(`parsing ${chunk.text}`)
                                    let parsed = Date.parse(
                                        chunk.text
                                            .replace('Published ', '')
                                            .trim(),
                                    )
                                    lastTemplateSubmitted = new Date(
                                        parsed,
                                    ).toISOString()
                                } catch (e) {
                                    console.log(
                                        'error parsing date',
                                        chunk.text,
                                    )
                                }
                            }
                            lastText = chunk.text
                        },
                    })
                    .transform(res)
                    .text()
                    .catch(ignoreAbortError)

                if (!emailLink) {
                    console.log('no email found for', creatorName)
                    return
                }

                const existingEmailIndex = allEmails.findIndex(
                    (item) => item.email === emailLink,
                )
                if (existingEmailIndex === -1) {
                    allEmails.push({
                        email: emailLink,
                        creatorName: creatorName,
                        exampleTemplate: templateLink,
                        twitter,
                        lastTemplateSubmitted,
                        ctaLink,
                        usesLemonSqueezy,
                        templateName,
                    })
                    console.log('Last:', allEmails[allEmails.length - 1])
                } else {
                    console.log('Creator already processed:', emailLink)
                    // Update the existing entry if needed
                    if (
                        lastTemplateSubmitted &&
                        (!allEmails[existingEmailIndex].lastTemplateSubmitted ||
                            new Date(lastTemplateSubmitted) >
                                new Date(
                                    allEmails[
                                        existingEmailIndex
                                    ].lastTemplateSubmitted,
                                ))
                    ) {
                        allEmails[existingEmailIndex].lastTemplateSubmitted =
                            lastTemplateSubmitted
                    }
                    allEmails[existingEmailIndex].usesLemonSqueezy =
                        usesLemonSqueezy ||
                        allEmails[existingEmailIndex].usesLemonSqueezy
                }
            } finally {
                sema.release()
            }
        }),
    )

    return allEmails
}

function extractEmailFromLink(link: string) {
    // remove query string
    link = link.split('?')[0]
    // remove mailto:
    link = link.replace('mailto:', '')
    return link
}

console.time('main execution');

main().finally(() => {
    // Convert the data to CSV format with a header
    const csv = Papa.unparse(allEmails, {
        header: true,
    })

    // Write the CSV data to a file
    fs.writeFileSync('scripts/framer-template-creators.csv', csv)
    console.log(JSON.stringify(allEmails, null, 2))

    console.timeEnd('main execution');
})
