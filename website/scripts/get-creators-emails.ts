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
    return fetch(url, init).catch((e) => {
        if (count < 2 && ignoreAbortError(e) === null) {
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

    // links = links.slice(0, 1)
    for (let link of links) {
        console.log('........................................................')
        let abortController1 = new AbortController()
        console.log(`fetching ${link}`)
        const res = await retryFetchTwice(link, {
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
        const templateCreatorName = link.split('/creator/')[1]
        let twitter = ''
        const r = await new HTMLRewriter({})
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
            console.log('no template found for', link)
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
                },
            })
            .on('p', {
                text(chunk) {
                    // const before = chunk.
                    if (!chunk.text.trim()) {
                        return
                    }
                    if (chunk.text && lastText.includes('Published')) {
                        console.log(`parsing ${chunk.text}`)
                        let parsed = Date.parse(
                            chunk.text.replace('Published ', '').trim(),
                        )
                        lastTemplateSubmitted = new Date(parsed).toISOString()
                    }
                    lastText = chunk.text
                },
            })
            .transform(res2)
            .text()
            .catch(ignoreAbortError)
        if (!emailLink) {
            console.log('no email found for', templateCreatorName)
            continue
        }
        allEmails.push({
            email: emailLink,
            exampleTemplate: new URL(firstTemplate, base).toString(),
            twitter,
            creatorName: templateCreatorName,
            lastTemplateSubmitted,
            otherTemplates: `https://www.framer.com/marketplace/creator/${templateCreatorName}`,
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
