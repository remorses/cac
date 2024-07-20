import OpenAI from 'openai'

import crypto from 'crypto'

export function generatePassword(length = 18) {
    const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?~'
    return crypto
        .randomBytes(length)
        .reduce((acc, byte) => acc + charset[byte % charset.length], '')
}

export function getScreenshotUrl(url) {
    let u = new URL('https://api.screenshotone.com/take')
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
    })
    u.search = params.toString()
    return u.toString()
}

export async function screenshot(url: string) {
    console.log(`screenshotting ${url}`)

    console.time(`screenshot ${url}`)
    const res = await fetch(
        getScreenshotUrl(url),

        {
            method: 'GET',
        },
    )
    const image = await res.arrayBuffer()
    console.timeEnd(`screenshot ${url}`)
    console.log(`image size ${formatBytes(image.byteLength)}`)
    return { image }
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
