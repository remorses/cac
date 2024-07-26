import { getSitemapLinks } from 'website/src/lib/sitemap'
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
    otherTemplates: string
    lastTemplateSubmitted: string
    ctaLink: string
    usesLemonSqueezy: boolean
}[]
async function main() {
    let links = await getSitemapLinks(
        'https://www.framer.com/marketplace/sitemap.xml',
    )
    let base = 'https://www.framer.com'
    links = links.filter((x) => {
        const url = new URL(x)
        const path = url.pathname
        // console.log(path)
        return path.includes('/creator')
    })
    console.log(`found ${links.length} creators`)

    // links = links.slice(0, 4)
    for (let creatorLink of links) {
        console.log('........................................................')
        let abortController1 = new AbortController()
        console.log(`fetching ${creatorLink}`)
        const res = await retryFetchTwice(creatorLink, {
            signal: abortController1.signal,
            headers: {
                accept: 'text/html',
            },
        })
        if (!res.ok) {
            console.log('not ok', res.status)
            continue
        }
        let firstTemplate = ''
        // what comes after /creator/ in the url
        let creatorSlug = creatorLink.split('/creator/')[1]
        let creatorName = ''
        // let templateCreatorName = link.split('/creator/')[1]
        let twitter = ''

        const r = await new HTMLRewriter({})
            .on('h1', {
                text(e) {
                    creatorName += e.text
                },
            })
            .on('a', {
                element(e) {
                    const href = e.getAttribute('href')
                    // console.log('href', href)
                    if (href && href.includes('/template/')) {
                        firstTemplate = href
                        // abortController1.abort()
                    }
                    if (!href) {
                        return
                    }
                    if (
                        !href.includes('/framer') &&
                        (href.includes('x.com') || href.includes('twitter.com'))
                    ) {
                        twitter = href
                        // abortController1.abort()
                    }
                },
            })
            .transform(res)
            .text()
            .catch(ignoreAbortError)
        // console.log({ r })
        // console.log('firstTemplate', firstTemplate)
        if (!firstTemplate) {
            console.log('no template found for', creatorLink)
            continue
        }
        let lastTemplateSubmitted = ''
        let abortController2 = new AbortController()
        console.log(`fetching ${firstTemplate}`)
        const res2 = await retryFetchTwice(new URL(firstTemplate, base), {
            signal: abortController2.signal,
            headers: {
                accept: 'text/html',
            },
        })
        let emailLink = ''
        let lastText = ''
        let usesLemonSqueezy = false
        let ctaLink = ''
        await new HTMLRewriter()
            .on('a', {
                element(e) {
                    const href = e.getAttribute('href')
                    if (!href) {
                        return
                    }
                    if (
                        href.includes('mailto:') &&
                        !href.includes('@framer.com')
                    ) {
                        emailLink = extractEmailFromLink(href)
                        // abortController2.abort()
                    }
                    if (href.includes('lemonsqueezy.com')) {
                        usesLemonSqueezy = true
                        // abortController2.abort()
                    }
                },
            })
            .on('a', {
                element(e) {
                    const className = e.getAttribute('class')
                    if (!className) {
                        return
                    }
                    const target = e.getAttribute('target')
                    if (target !== '_blank') {
                        return
                    }
                    if (className.includes('btn-primary')) {
                        ctaLink = e.getAttribute('href') || ''
                    }
                },
            })
            .on('p', {
                text(chunk) {
                    // const before = chunk.
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
            .transform(res2)
            .text()
            .catch(ignoreAbortError)
        if (!emailLink) {
            console.log('no email found for', creatorName)
            continue
        }
        allEmails.push({
            email: emailLink,
            creatorName: creatorName,
            exampleTemplate: new URL(firstTemplate, base).toString(),
            twitter,
            lastTemplateSubmitted,
            otherTemplates: creatorLink,
            ctaLink,
            usesLemonSqueezy,
        })
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
