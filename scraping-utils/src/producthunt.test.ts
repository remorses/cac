import { test, expect } from 'vitest'
import { getPosts, getProductHuntCompanies } from './producthunt'
import { getPoweredBy } from './utils'

test(
    'ph launches with many urls',
    async () => {
        const res = await getPosts({
            url: 'https://slashy.app/',
        })
        expect(res?.posts[0]?.website).toMatchInlineSnapshot(
            '"https://slashy.app?ref=producthunt"',
        )
    },
    1000 * 100,
)
test(
    'getProductHuntCompanies',
    async () => {
        const posts = await getProductHuntCompanies({
            lastNHours: 24 * 7,
        })
        console.log(`got ${posts.length} posts`)
        let hist = new Map<string, number>()
        for (let post of posts) {
            const poweredBy = await getPoweredBy(post.website!)
            if (poweredBy !== 'unknown') {
                hist.set(poweredBy, (hist.get(poweredBy) || 0) + 1)
                console.log(poweredBy, post.website)
            }
        }
        console.log([...hist.entries()].sort((a, b) => b[1] - a[1]))

        // console.log(posts)
    },
    1000 * 100,
)
test(
    'createAt == featuredAt',
    async () => {
        const res = await getPosts({
            lastNHours: 24,
        })
        console.log(res)
        expect(JSON.stringify(res?.posts.map((x) => x.featuredAt).sort())).toBe(
            JSON.stringify(res?.posts.map((x) => x.createdAt).sort()),
        )
    },
    1000 * 100,
)

test.skip(
    'ph launches gets slashy',
    async () => {
        const res = await getProductHuntCompanies({
            lastNHours: 24 * 4,
        })
        console.log(res)
        expect(res.map((x) => new URL(x.website!).host)).toContain('slashy.app')
    },
    1000 * 100,
)

// https://api.producthunt.com/v2/api/graphql
test(
    'ph does not make duplicates',
    async () => {
        const res = await getProductHuntCompanies({
            lastNHours: 24 * 2,
            // removeDuplicateHosts: false,
        })
        console.log(res)
        const hosts = res.map((x) => x.name)

        expect(JSON.stringify(hosts.sort(), null, 2)).toBe(
            JSON.stringify([...new Set(hosts)].sort(), null, 2),
        )
    },
    1000 * 100,
)
