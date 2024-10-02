import { getSitemapLinks } from './sitemap'
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
}[]

async function main() {
    let links = await getSitemapLinks(
        'https://www.framer.com/marketplace/sitemap.xml',
    )
    let base = 'https://www.framer.com'
    links = links.filter((x) => x.includes('/template/'))
    console.log(`found ${links.length} templates`)

    for (let templateLink of links) {
        console.log('........................................................')
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
            continue
        }

        let creatorName = ''
        let twitter = ''
        let emailLink = ''
        let lastTemplateSubmitted = ''
        let usesLemonSqueezy = false
        let ctaLink = ''
        let lastText = ''

        await new HTMLRewriter()
            .on('h1', {
                text(e) {
                    creatorName += e.text
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
                        (href.includes('x.com') || href.includes('twitter.com'))
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
                                chunk.text.replace('Published ', '').trim(),
                            )
                            lastTemplateSubmitted = new Date(
                                parsed,
                            ).toISOString()
                        } catch (e) {
                            console.log('error parsing date', chunk.text)
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
            continue
        }

        allEmails.push({
            email: emailLink,
            creatorName: creatorName,
            exampleTemplate: templateLink,
            twitter,
            lastTemplateSubmitted,
            ctaLink,
            usesLemonSqueezy,
        })
        console.log('Last:', allEmails[allEmails.length - 1])
    }
    return allEmails
}

function extractEmailFromLink(link: string) {
    // remove query string
    link = link.split('?')[0]
    // remove mailto:
    link = link.replace('mailto:', '')
    return link
}

main().finally(() => {
    // Convert the data to CSV format with a header
    const csv = Papa.unparse(allEmails, {
        header: true,
    })

    // Write the CSV data to a file
    fs.writeFileSync('scripts/framer-template-creators.csv', csv)
    console.log(JSON.stringify(allEmails, null, 2))
})
