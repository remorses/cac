import { createSpiceflowClient } from 'spiceflow/client'

import { RouteType } from 'website/src/lib/elysia.server'

export function createClient({ url }: { url: string }) {
    const client = createSpiceflowClient<RouteType>(url, {
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
    return client
}

export const websiteApiClient = createClient({ url: process.env.PUBLIC_URL! })
