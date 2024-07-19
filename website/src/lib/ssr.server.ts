import OpenAI from 'openai'

import crypto from 'crypto'

export function generatePassword(length = 18) {
    const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?~'
    return crypto
        .randomBytes(length)
        .reduce((acc, byte) => acc + charset[byte % charset.length], '')
}

export async function screenshot(url: string) {
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
    })
    u.search = params.toString()

    const res = await fetch(
        u,

        {
            method: 'GET',
        },
    )
    const image = await res.arrayBuffer()
    return { image }
}

// export const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// })
