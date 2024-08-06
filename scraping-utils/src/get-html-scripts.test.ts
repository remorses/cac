import { test, expect } from 'vitest'
import {
    fetchWithRetryAndError,
    getHtmlScripts,
    scriptUsesNextAuth,
    scriptUsesSupabase,
    websiteUsesSupabase,
} from './get-html-scripts'

test('getHtmlScripts', async () => {
    const { scriptUrls } = await getHtmlScripts({
        url: 'https://markprompt.com/',
    })
    console.log(`found ${scriptUrls.length} scripts`)
})
test('websiteUsesSupabase', async () => {
    const { usesSupabase } = await websiteUsesSupabase({
        url: 'https://www.xendit.co/en/',
    })
    expect(usesSupabase).toMatchInlineSnapshot(`false`)
})
