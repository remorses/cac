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
        // let str = JSON.stringify(session)
        // // split the str in 3kb parts, create an array with the parts
        // let parts = [] as string[]
        // for (let i = 0; i < str.length; i += 3000) {
        //     parts.push(encodeURIComponent(str.substring(i, i + 3000)))
        // }
        // const cookie = parts
        //     .map((part, i) => `sb-${supabaseRef}-auth-token.${i}=${part}`)
        //     .join('; ')
        // console.log('cookie', cookie)
        // return {
        //     // credentials: 'include',
        //     headers: {
        //         pluginCookie: cookie,
        //     },
        // }
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

export async function isTruthy<T>(
    x: T | undefined | null | false,
): Promise<boolean> {
    return !!x
}

export function withMode(path, query?: Record<string, any>) {
    const searchParams = new URLSearchParams({ mode: 'default', ...query })
    return `${path}?${searchParams.toString()}`
}

export enum Paths {
    login = '/login',
    settings = '/settings',
    doYouAlreadyHaveAWebsite = '/do-you-already-have-a-website',
    getWebsiteInfo = '/get-website-info',
    scrapeWebsite = '/scrape-website',
    // migrate = '/migrate',
    prompt = '/prompt',
    // checkWebsiteIsPublished = '/check-website-is-published',
    // scrapeWebsite = '/scrape-website',
}

const nonMeaningfulNames = [
    'Desktop',
    'Mobile',
    'Tablet',
    'Desktop Open',
    'Mobile Open',
    'Tablet Open',
    'Container',
    'Row',
    'Col',
    'Column',
    'Frame',
    'Content',
    'Section',
    'Text',
]
function isNameMeaningful(name: string) {
    if (!name) return false
    if (nonMeaningfulNames.includes(name)) return false
    return true
}

export async function getNodePath(node: AnyNode) {
    let path = [] as string[]
    let current = node as AnyNode | null
    while (current) {
        let name = current['name']
        if (isNameMeaningful(name)) {
            path.unshift(name)
        }
        current = await current.getParent()
    }
    return path.join('/')
}

export async function getDesktop() {
    // const node = await Promise.all(
    //     [...(await framer.getNodesWithType('WebPageNode'))].map(
    //         async (node) => {
    //             return node
    //         },
    //     ),
    // )
    const root = await framer.getCanvasRoot()
    const children = await root.getChildren()
    const desktop = children.find((node) => {
        if (isFrameNode(node)) {
            return node.name === 'Desktop'
        }
    })
    return desktop
}

function isRootLevelNode(node: AnyNode) {
    return isComponentNode(node) || isWebPageNode(node)
}

export async function getRootParentNode(node: AnyNode | string | null) {
    if (typeof node === 'string') {
        node = await framer.getNode(node)
    }
    if (!node) {
        return null
    }
    let rootParent = null as AnyNode | null
    for await (const parent of getParentNodes(node)) {
        rootParent = parent
    }
    return rootParent
}

export async function* getParentNodes(node: AnyNode | string | null) {
    if (typeof node === 'string') {
        node = await framer.getNode(node)
    }
    if (!node) {
        return
    }
    let parent = await node.getParent()
    if (isRootLevelNode(node)) {
        yield node
    }
    if (!parent) {
        console.log('no parent found', node.id)
        if (isTextNode(node)) {
            console.log('text node', await node.getText())
        }
        yield node
        return
    }
    while (parent) {
        yield parent
        if (isRootLevelNode(parent)) {
            return
        }
        let newParent = await parent.getParent()
        if (!newParent) {
            console.log('no parent found, last one was', parent)
            yield parent
            return
        }
        parent = newParent
    }
}

Object.assign(globalThis, { getRootParentNode, getParentNodes })

export type PluginLoaderData = {
    session: Session
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

export const globalState = {
    exampleTextToMigrate: [] as RephraseSchema['exampleTextToMigrate'],
    extractedDescription: '',
}

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
