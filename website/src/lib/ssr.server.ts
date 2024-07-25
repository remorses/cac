import OpenAI from 'openai'

import crypto from 'crypto'
import { supabaseRef } from 'website/src/lib/env'

export function generatePassword(length = 18) {
    const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?~'
    return crypto
        .randomBytes(length)
        .reduce((acc, byte) => acc + charset[byte % charset.length], '')
}

function getBucketFilename(url) {
    const domain = new URL(url).hostname

    let str = url
    // remove http
    str = str.replace(/^https?:\/\//, '')
    // remove query params
    str = str.replace(/\?.*/, '')
    // remove fragment
    str = str.replace(/#.*/, '')
    // remove trailing slash
    str = str.replace(/\/$/, '')
    str = str.replace(/\//g, '-')
    str = encodeURIComponent(str)
    str = str + '.jpg'
    str = `${domain}/${str}`
    return str
}
export function getScreenshotUrl(url) {
    let u = new URL('https://api.screenshotone.com/take')
    // let p = getBucketFilename(url)
    const params = new URLSearchParams({
        access_key: 'wr8HEl_Lwza8uQ',
        url,
        full_page: 'true',
        full_page_scroll: 'true',
        viewport_width: '1920',
        viewport_height: '1080',
        device_scale_factor: '1',
        format: 'jpg',
        image_quality: '80',
        block_ads: 'true',
        block_cookie_banners: 'true',
        block_banners_by_heuristics: 'false',
        block_trackers: 'true',
        delay: '0',
        timeout: '60',
        cache: 'true',
        cache_ttl: '14400',
        // async: 'true',
        response_type: 'json',
        // store: 'true',
        // storage_path: p,
    })
    u.search = params.toString()
    return u.toString()
}

export function getBucketUrl(path) {
    let p = getBucketFilename(path)
    // if (!p.endsWIth(ext)) {
    //     p = p + ext
    // }
    // https://icmbzyavxvxryaeezqfh.supabase.co/storage/v1/object/public/screenshots/docs.gitbook.com/docs.gitbook.com-integrations-install-an-integration.jpg
    const res = `https://${supabaseRef}.supabase.co/storage/v1/object/public/screenshots/${p}`
    return res
}

export async function screenshot(url: string) {
    console.log(`screenshotting ${url}`)

    console.time(`screenshot ${url}`)
    let u = getScreenshotUrl(url)
    console.log('screenshot url:', u)
    const res = await fetch(
        u,

        {
            method: 'GET',
        },
    )
    const json = await res.json()
    console.timeEnd(`screenshot ${url}`)
    // console.log(`image size ${formatBytes(image.byteLength)}`)
    const imageUrl = json.cache_url
    return { imageUrl }
}
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// export const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// })

export function splitIntoWords(text: string) {
    return text.split(/\s+/)
}
