import { Browser, Locator, Page, chromium } from 'playwright'
import { test, describe, expect } from 'vitest'
const dns = require('dns').promises

let browser: Browser

async function getPage() {
    console.time('getPage')
    let url = 'http://chrome-renderer.fly.dev'
    let { address } = await dns.lookup(new URL(url).hostname, {
        family: 4,
        hints: dns.ADDRCONFIG,
    })
    address = '37.16.31.70'
    console.log('address', address)
    url = `http://${address}`
    if (!browser) {
        browser = await chromium.connectOverCDP(url, {
            timeout: 1000 * 10,
            // endpointURL: url,
            headers: {
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
    const context = browser.contexts()[0]

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
