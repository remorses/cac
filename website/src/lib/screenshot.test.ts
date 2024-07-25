import { test, describe, it, expect } from 'vitest'

import { getBucketUrl, getScreenshotUrl, screenshot } from './ssr.server'

describe('screenshot', () => {
    test(
        'screenshot',
        async () => {
            const url =
                'https://docs.gitbook.com/integrations/install-an-integration#install-an-integration-in-your-organization'
            const res = await screenshot(url)
            console.log(res)
        },
        1000 * 60,
    )
})
