import { describe, expect, test } from 'vitest'
import { crispAPIIdentifier } from './env'
import { crisp } from './crisp'
import { syncDbWithCrisp } from './ssr'

describe(
    'crisp client',
    () => {
        test('conversations', async () => {
            const res = await await crisp.getWebsites()
            const site = res[0]
            const convos = await crisp.getConversations({
                pageNumber: 0,
                orderDateUpdated: true,
                websiteId: site.website_id,
            })

            console.log(site)
            console.log(
                convos.map((x) => {
                    const country = x.meta.device?.geolocation?.country
                    const email = x.meta.email || 'visitor'
                    const segments = x.meta.segments
                    const avatar = x.meta.avatar
                    return x

                    return { country, segments, avatar, email }
                }),
            )
            expect
        })

        test('subscription', async () => {
            const res = await crisp.getWebsites()
            const site = res[0]
            let pluginId = crispAPIIdentifier
            const [sub, ops] = await Promise.all([
                crisp.subscriptionSettings({
                    websiteId: site.website_id,
                    pluginId,
                }),
                crisp.getOperators({ websiteId: site.website_id }),
            ])
            console.log(sub)
            console.log(ops)
        })
        test('syncDbWithCrisp', async () => {
            const data = await syncDbWithCrisp()

            expect(data.length).toMatchInlineSnapshot(`1`)
            expect(data.map((x) => x.site.domain)).toMatchInlineSnapshot(`
              [
                "tiktoktts.com",
              ]
            `)
            expect(data.flatMap((x) => x.operators.map((x) => x.details.email)))
                .toMatchInlineSnapshot(`
                  [
                    "beats.by.morse@gmail.com",
                    "tommy@notaku.so",
                  ]
                `)
        })
    },
    1000 * 10,
)
