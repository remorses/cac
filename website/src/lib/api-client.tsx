import type { RouteType } from 'website/src/lib/elysia.server'

export async function createClient({ url }: { url: string }) {
    const { createSpiceflowClient } = await import('spiceflow/client')
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

// export const websiteApiClient = createClient({ url: process.env.PUBLIC_URL! })
