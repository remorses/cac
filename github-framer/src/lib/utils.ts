import { createClient } from 'website/src/lib/api-client'
import { env, supabaseRef } from 'website/src/lib/env'

import { treaty } from '@elysiajs/eden'

import type { RephraseSchema, RouteType } from 'website/src/lib/elysia.server'
import {
    AnyNode,
    framer,
    isFrameNode,
    isComponentNode,
    isWebPageNode,
    isTextNode,
} from 'framer-plugin'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-framer'
import { notifyError } from '@/lib/errors'

export const pluginApiClient = treaty<RouteType>(env.PUBLIC_URL!, {
    async onRequest() {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession()
        if (error) {
            notifyError(error, 'Error getting session')
        }
        if (!session) {
            console.log('no session found')
        }
        return {
            // credentials: 'include',
            headers: {
                pluginCookie: `sb-${supabaseRef}-auth-token=${encodeURIComponent(JSON.stringify(session))}`,
            },
        }
    },
})

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export const noop: any = () => {}

export function isTruthy<T>(val: T | undefined | null | false): val is T {
    return Boolean(val)
}

export function withMode(path, query?: Record<string, any>) {
    let mode =
        new URL(window.location.href).searchParams.get('mode') || 'default'
    const searchParams = new URLSearchParams({ mode, ...query })
    return `${path}?${searchParams.toString()}`
}

export enum Paths {
    login = '/login',
    chooseRepo = '/choose-repo',
    sync = '/sync',
    settings = '/settings',
}

export enum RouteIds {
    root = 'root',
}

export type LoaderReturnType<T extends Function> = T extends (
    ...args: any
) => Promise<infer R>
    ? R
    : never

export function createBuyLink({ email, orgId }) {
    if (!email) {
        throw new Error('No email for buy link')
    }
    if (!orgId) {
        throw new Error('No orgId for buy link')
    }

    let productId = env.PUBLIC_LEMON_PRODUCT!

    let url = new URL(
        `https://unframer.lemonsqueezy.com/checkout/buy/${productId}`,
    )
    if (orgId) {
        url.searchParams.set('checkout[custom][orgId]', orgId)
    }
    url.searchParams.set('embed', '0')
    url.searchParams.set('logo', '0')
    url.searchParams.set('dark', '1')

    if (email) {
        url.searchParams.set('checkout[email]', email)
    }
    return url.toString()
}

export const globalState = {}

export async function collectGenerator<T>(
    gen: AsyncGenerator<T | null, void, unknown>,
) {
    const result = [] as T[]
    for await (const item of gen) {
        if (!item) {
            continue
        }
        result.push(item)
    }
    return result
}

export function formatLargeNumber(x: number) {
    if (x < 1000) {
        return x.toFixed(0)
    }
    return (x / 1000).toFixed(0) + 'K'
}

export const basePath = import.meta.env.BASE_URL || '/'

// export function getGithubInstallUrl({ redirectToPath = '' }) {
//     const githubInstallationUrl = new URL(
//         `https://github.com/apps/unframer/installations/new`,
//     )
//     const redirectUri = `${env.PUBLIC_URL}/api/markdown-plugin/github/callback`

//     githubInstallationUrl.searchParams.set('redirect_uri', redirectUri)
//     let state = { redirectToPath }

//     githubInstallationUrl.searchParams.set('state', JSON.stringify(state))
//     return githubInstallationUrl.toString()
// }

export enum PluginDataKeys {
    githubRepoSlug = 'repoSlug',
}

export function simpleHash(input: string) {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
}

export function assert(
    condition: unknown,
    ...msg: unknown[]
): asserts condition {
    if (condition) return

    const e = Error(
        'Assertion Error' + (msg.length > 0 ? ': ' + msg.join(' ') : ''),
    )
    // Hack the stack so the assert call itself disappears. Works in jest and in chrome.
    if (e.stack) {
        try {
            const lines = e.stack.split('\n')
            if (lines[1]?.includes('assert')) {
                lines.splice(1, 1)
                e.stack = lines.join('\n')
            } else if (lines[0]?.includes('assert')) {
                lines.splice(0, 1)
                e.stack = lines.join('\n')
            }
        } catch {
            // nothing
        }
    }
    throw e
}
