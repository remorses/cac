import { createClient } from 'website/src/lib/api-client'
import { env } from 'website/src/lib/env'

import { treaty } from '@elysiajs/eden'

import type { RouteType } from 'website/src/lib/elysia.server'

export const apiClient = treaty<RouteType>(env.PUBLIC_URL!, {
    // async fetch(input, requestInit) {
    //     const res = await fetch(input, requestInit)
    //     if (!res.ok) {
    //         throw new Error(await res.text())
    //     }
    //     return res
    // },
    // async onResponse(response) {
    //     if (!response.ok) {
    //         throw new Error(await response.text())
    //     }
    //     return response
    // },

    headers() {
        return {
            // Cookie: `sb-${supabaseRef}-auth-token=${encodeURIComponent(JSON.stringify(session))}`,
        }
    },
})

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export function Uint8ArrayToBase64(buffer: Uint8Array) {
    var blob = new Blob([buffer], { type: 'image/png' })
    var url = URL.createObjectURL(blob)
    return url
}

export const noop: any = () => {}

async function isTruthy<T>(x: T | undefined | null | false): Promise<boolean> {
    return !!x
}
