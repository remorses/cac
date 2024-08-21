import { env } from 'website/src/lib/env'

import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/dist/client'

import {
    AnyNode,
    framer,
    isComponentNode,
    isFrameNode,
    isTextNode,
    isWebPageNode,
} from 'framer-plugin'
import type { RouteType } from 'website/src/lib/elysia.server'
import { RewriteSchema } from 'website/src/lib/rewrite'

export const pluginApiClient: SpiceflowClient.Create<RouteType> = createSpiceflowClient<RouteType>(
    env.PUBLIC_URL!,
    {
        async onResponse(response) {
            if (response.status === 401) {
                console.log('clearing session because api returned 401')
                await framer.setPluginData(PluginDataKeys.sessionKey, null)
            }
        },
        async onRequest() {
            const { sessionKey } = await getPluginData()
            return {
                headers: {
                    sessionKey,
                },
            }
        },
    },
)

export async function getPluginData() {
    const [sessionKey] = await Promise.all([
        framer.getPluginData(PluginDataKeys.sessionKey),
    ])
    return { sessionKey: sessionKey || '' }
}

export enum PluginDataKeys {
    sessionKey = 'sessionKey',
    usedThePlugin = 'usedThePlugin',
}

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
    const searchParams = new URLSearchParams({ mode: 'default', ...query })
    return `${path}?${searchParams.toString()}`
}

export enum Paths {
    login = '/login',
    settings = '/settings',
    licenseKey = '/license-key',
    doYouAlreadyHaveAWebsite = '/do-you-already-have-a-website',
    getWebsiteInfo = '/get-website-info',
    scrapeWebsite = '/scrape-website',
    prompt = '/prompt',
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
    // console.log('children', children)
    const desktop = children.find((node) => {
        if (isFrameNode(node)) {
            return !node.isReplica
        }
    })
    return desktop
}
Object.assign(globalThis, { getDesktop })

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

    let productId = env.PUBLIC_LEMON_PRODUCT_MIGRATE!

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
    exampleTextToMigrate: [] as RewriteSchema['exampleTextToMigrate'],
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

export function formatLargeNumber(x: number) {
    if (x < 1000) {
        return x.toFixed(0)
    }
    return (x / 1000).toFixed(0) + 'K'
}

// @ts-ignore
export const basePath = import.meta.env.BASE_URL || '/'
