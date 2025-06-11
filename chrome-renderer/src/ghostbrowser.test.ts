import { Browser, Locator, Page, chromium } from 'playwright'
import { test, describe, expect } from 'vitest'
const dns = require('dns').promises

let browser: Browser

async function getPage() {
    console.time('getPage')


    let cdpUrl = `http://127.0.0.1:9222`
    if (!browser) {
        browser = await chromium.connectOverCDP(cdpUrl, {
            timeout: 1000 * 10,

            // endpointURL: url,
            headers: {
                // host: address,
                // host: '0.0.0.0',
            },
            logger: {
                isEnabled(name, severity) {
                    return true
                },
                log(name, severity, message, args, hints) {
                    console.log(message)
                },
            },
        })
    }

    // const context = await browser.newContext()
    const contexts = browser.contexts()
    console.log('contexts', contexts, contexts.length)
    const context = contexts[0]

    if (!context) {
        throw new Error('no context found')
    }
    const page = await context.newPage()

    console.timeEnd('getPage')
    return page
}

test(
    'ready',
    async () => {
        const page = await getPage()
        await page.goto('https://www.framer.com')
        const title = await page.title()
        expect(title).toContain('Framer')
        // screenshot
        console.time('screenshot')
        await page.screenshot({
            path: 'screenshot.jpg',
            fullPage: true,
            // animations: 'disabled',
            quality: 80,
        })
        console.timeEnd('screenshot')
        await page.close()
    },
    1000 * 60 * 10,
)
