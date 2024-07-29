import { NotionAPI } from 'notion-client'
import { ExtendedRecordMap } from 'notion-types'
import { getPageTitle, parsePageId } from 'notion-utils'

export async function getNotionData(url: string) {
    const id = parsePageId(url)
    if (!id) {
        console.log('not a notion page url', url)
        return null
    }
    console.log('getting notion email for', url)
    const client = new NotionAPI()
    let page: ExtendedRecordMap
    try {
        page = await client.getPage(id, {
            chunkLimit: 1,
            fetchMissingBlocks: false,
            fetchCollections: false,
            signFileUrls: false,
        })
    } catch (e) {
        console.log('notion error', e.message)
        return null
    }
    if (!page?.block?.[id]) {
        console.log(`No Notion page block found for ${url}`)
        return null
    }
    const v = page.block[id].value
    if (v.last_edited_by_table !== 'notion_user') {
        throw new Error('Not created by a Notion user')
    }
    // console.log(JSON.stringify(page, null, 2))
    const userId = v?.last_edited_by_id
    const users = await client.getUsers([userId])
    // console.log(users.results)
    const email = users.results.map((x) => x['value'].email)?.[0]
    return {
        email,
        title: getPageTitle(page),
        company: getCompanyNameFromNotionUrl(url),
    }
}

export function getCompanyNameFromNotionUrl(url: string) {
    const u = safeURL(url)
    if (!u) {
        return ''
    }
    const host = u.host
    if (!host) {
        return ''
    }
    if (!host.endsWith('.notion.site')) {
        return ''
    }
    const subdomain = host.split('.')[0]
    let parts = subdomain.split('-')
    if (parts.length === 3 && parts[2].length === 3) {
        // default Notion name
        return ''
    }
    const name = parts[0]
    // capitalize
    return name.slice(0, 1).toUpperCase() + name.slice(1)
}

function rateLimit(fn, n, secondsInterval) {
    let count = 0
    let last = Date.now()
    return async function (x) {
        if (count >= n) {
            const diff = Date.now() - last
            if (diff < secondsInterval * 1000) {
                const ms = secondsInterval * 1000 - diff
                console.log(`Waiting ${Number(ms / 1000).toFixed(0)} seconds`)
                await sleep(ms)
            }
            count = 0
        }
        count++
        last = Date.now()
        return fn(x)
    }
}
