import { createClient } from 'website/src/lib/api-client'
import { env } from 'website/src/lib/env'

import { treaty } from '@elysiajs/eden'

import type { RouteType } from 'website/src/lib/elysia.server.js'

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

// show toasts on success and failure and manages loading state
// you can skip showing the toast on failure putting a field skipToast: true in the error
export function useThrowingFn({
    fn: fnToWrap,

    immediate = false,
}) {
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        if (immediate) {
            fn()
        }
    }, [immediate])
    const fn = async function wrappedThrowingFn(...args) {
        try {
            setIsLoading(true)
            const result = await fnToWrap(...args)
            if (result?.skipToast) {
                return result
            }

            return result
        } catch (err) {
            console.error(err)
            // how to handle unreadable errors? simply don't return them from APIs, just return something went wrong

            return err
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        fn,
    }
}
