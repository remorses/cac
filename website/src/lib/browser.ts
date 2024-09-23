import { chromium } from 'playwright'
import { env } from 'website/src/lib/env'

export async function getWebsiteHtml(url: string): Promise<string> {
    const browser = await chromium.connectOverCDP(env.BROWSERBASE_DCP!)
    //     const defaultContext = browser.contexts()[0];
    //   const page = defaultContext.pages()[0];
    const page = await browser.newPage()

    try {
        await page.goto(url, { waitUntil: 'load' })
        const html = await page.evaluate(() => {
            const elements = document.querySelectorAll('*')
            elements.forEach((el) => {
                const fontSize = window.getComputedStyle(el).fontSize
                el.classList.add(`text-[${fontSize}]`)
            })
            return document.documentElement.outerHTML
        })
        return html
    } catch (error) {
        console.error(`Error fetching HTML for ${url}:`, error)
        throw error
    } finally {
        await browser.close()
    }
}
