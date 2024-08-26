import { env } from 'website/src/lib/env'

import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/dist/client'

import { CollectionField, framer } from 'framer-plugin'
import type { RouteType } from 'website/src/lib/elysia.server'

import { safeJsonParse } from 'website/src/lib/utils'

export const pluginApiClient: SpiceflowClient.Create<RouteType> =
    createSpiceflowClient<RouteType>(env.PUBLIC_URL!, {
        async onResponse(response) {
            if (response.status === 401) {
                const collection = await framer.getManagedCollection()
                console.log('clearing session because api returned 401')
                await collection.setPluginData(PluginDataKeys.sessionKey, null)
            }
        },
        async onRequest() {
            const { sessionKey } = await getMarkdownPluginData()
            return {
                headers: {
                    sessionKey,
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
        new URL(window.location.href).searchParams.get('mode') || 'canvas'
    const searchParams = new URLSearchParams({ mode, ...query })
    return `${path}?${searchParams.toString()}`
}

export enum Paths {
    login = '/login',
    chooseRepo = '/choose-repo',
    mapFields = '/map-fields',
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

// @ts-ignore
export const basePath = import.meta.env.BASE_URL || '/'

export enum PluginDataKeys {
    sessionKey = 'sessionKey',
    githubRepoSlug = 'repoSlug',
    mapFieldsConfig = 'mapFieldsConfig',
    githubAccountLogin = 'githubAccountLogin',
    basePath = 'basePath',
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

export async function getMarkdownPluginData() {
    const collection = await framer.getManagedCollection()
    const [
        repoSlug,
        mapFieldsConfigJson,
        basePath,
        githubAccountLogin,
        sessionKey,
    ] = await Promise.all([
        collection.getPluginData(PluginDataKeys.githubRepoSlug),
        collection.getPluginData(PluginDataKeys.mapFieldsConfig),
        collection.getPluginData(PluginDataKeys.basePath) || '',
        collection.getPluginData(PluginDataKeys.githubAccountLogin) || '',
        collection.getPluginData(PluginDataKeys.sessionKey) || '',
    ])
    const [owner, repo = ''] = repoSlug?.split('/') || ''
    const mapFieldsConfig: CollectionField[] =
        safeJsonParse(mapFieldsConfigJson || '[]') || []
    return {
        owner,
        repo,
        mapFieldsConfig,
        basePath: basePath || '',
        githubAccountLogin: githubAccountLogin || '',
        sessionKey: sessionKey || '',
    }
}
