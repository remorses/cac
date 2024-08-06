import { createClient, Post } from './ph-genql'

import fs from 'fs'
import { pRateLimit } from 'p-ratelimit'
import path from 'path'
import { nHoursAgo, resolveWebsiteRedirect, safeURL } from './utils'

// You can make up to 900 requests every 15 minutes
const limit = pRateLimit({
    interval: 1000 * 60, // 1000 ms == 1 second
    rate: 58,
    concurrency: 1,
    maxDelay: 4000,
})

const token = 'agNbZ3X--hbZBZf6efFK1nvNr2zbX4DFBxTDsRs5cgM'

export async function getProductHuntCompanies({
    maxItems = 100,
    lastNHours = 0 as number,
    removeDuplicateHosts = true,
    ignoreHosts: _ignoreHosts = [],
} = {}) {
    console.log(`Getting product hunt launches from ${lastNHours} hours ago`)

    const allHits: Partial<Post>[] = []
    let page = 0

    let after

    while (true) {
        console.log(`fetching ph page ${page}`)
        const { posts, hasNextPage, endCursor } = await getPosts({
            after,
            lastNHours: lastNHours + 3,
        })

        allHits.push(...posts)
        // console.log(json?.posts?.edges[0]?.node?.featuredAt)
        if (!hasNextPage) {
            break
        }
        if (allHits.length >= maxItems) {
            console.log(`max items ${maxItems} reached`)
            break
        }
        after = endCursor
        page += 1
    }

    let filtered = allHits.filter(Boolean)
    console.log(`fetched ${filtered} companies`)

    const hist = filtered
        .filter(Boolean)
        .map((x) => safeURL(x?.website)?.hostname)
        .filter(Boolean)
        // create a hist obj
        .reduce(
            (acc, x) => {
                if (!x) {
                    return acc
                }
                if (acc[x]) {
                    acc[x]++
                } else {
                    acc[x] = 1
                }
                return acc
            },
            {} as Record<string, number>,
        )

    // console.log(
    //     `most common hosts:`,
    //     Object.entries(hist)
    //         .sort(([k, v], [k1, v1]) => v1 - v)
    //         .slice(0, 20)
    //         .map(([k, v]) => `${k} (${v})`),
    // )

    const hostnameToIndexes = {}
    filtered.filter(Boolean).forEach((x, i) => {
        const host = safeURL(x.website)?.hostname!
        if (hostnameToIndexes[host]) {
            hostnameToIndexes[host].push(i)
        } else {
            hostnameToIndexes[host] = [i]
        }
    })

    const dupedHosts = Object.entries(hist)
        .filter(([k, v]) => v > 1)
        .map(([host, v]) => {
            return host
        })

    // const dupedIndexes = dupedHosts.flatMap((host) => hostnameToIndexes[host])
    // product hunt api is bad and they have duplicate results lmao, previously i wanted to remove duplicate host because could be spammy but in reality it's just that ph api is shit
    const alreadyAdded = new Set<string>()
    filtered = filtered.filter(Boolean).filter((x, i) => {
        const added = alreadyAdded.has(x.website!)
        alreadyAdded.add(x.website!)
        return !added
    })

    console.log(
        'Product hunt has fetched',
        filtered?.length,
        'companies, with duped hosts:',
        allHits?.length - filtered?.length,
        JSON.stringify(dupedHosts),
    )

    // console.log(JSON.stringify(allHits[0], null, 2))
    fs.writeFileSync(
        path.resolve(__dirname, 'companies.json'),
        JSON.stringify(filtered, null, 2),
    )
    return filtered
}

export function getCachedProductHuntCompanies(): Post[] {
    return JSON.parse(
        fs.readFileSync(path.resolve(__dirname, 'companies.json'), 'utf8'),
    )
}
const client = createClient({
    headers: {
        authorization: `Bearer ${token}`,
    },
})
export async function getPosts({
    after = undefined as string | undefined,
    url = undefined as string | undefined,
    lastNHours = 0,
}) {
    const json = await limit(() =>
        client.query({
            posts: [
                // limit is 20
                {
                    first: 20,
                    after,
                    url,
                    order: 'FEATURED_AT',
                    featured: true,
                    postedAfter: lastNHours
                        ? String(nHoursAgo(lastNHours))
                        : undefined,
                    // postedAfter: page === 0 ? postedAfter : undefined,
                },
                {
                    edges: {
                        node: {
                            name: true,
                            url: true,
                            createdAt: true,
                            website: true,
                            votesCount: true,
                            productLinks: { url: true },
                            tagline: true,
                            makers: {
                                twitterUsername: true,
                                name: true,
                                isMaker: true,
                            },
                            topics: {
                                edges: { node: { name: true } },
                            },
                            featuredAt: true,
                            // makers: {
                            //     websiteUrl: true,
                            //     twitterUsername: true,
                            //     name: true,
                            // },
                        },
                    },
                    pageInfo: {
                        hasNextPage: true,
                        endCursor: true,
                        startCursor: true,
                        hasPreviousPage: true,
                    },
                },
            ],
        }),
    )
    // console.log(json)
    const posts: Post[] = (
        await Promise.all(
            json?.posts?.edges
                .filter((x) => x.node?.website)
                .map(async (x) => {
                    const node = x.node
                    const resolved = await resolveWebsiteRedirect(node.website)
                    const u = safeURL(resolved)

                    node.website = resolved!
                    return node
                })
                .filter(Boolean) as any,
        )
    ).filter((x) => x.website)
    return {
        posts,
        hasNextPage: json?.posts?.pageInfo?.hasNextPage,
        endCursor: json?.posts?.pageInfo?.endCursor,
    }
}
