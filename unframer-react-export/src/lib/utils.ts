import { env } from 'website/src/lib/env'

import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/client'

import { CollectionField, framer } from 'framer-plugin'
import type { RouteType } from 'website/src/lib/elysia.server'

import { safeJsonParse } from 'website/src/lib/utils'

export {
    withMode,
    formatLargeNumber,
    getDesktop,
} from 'template-rewrite-framer/src/lib/utils'
export type { LoaderReturnType } from 'template-rewrite-framer/src/lib/utils'

export const pluginApiClient: SpiceflowClient.Create<RouteType> =
    createSpiceflowClient<RouteType>(env.PUBLIC_URL!, {
        async onResponse(response) {
            if (response.status === 401) {
                console.log('clearing session because api returned 401')
                await framer.setPluginData(PluginDataKeys.sessionKey, null)
            }
        },
        async onRequest() {
            const { sessionKey } = await getReactPluginData()
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

export enum Paths {
    login = '/login',
    components = '/components',
    readme = '/readme',
    settings = '/settings',
}

export enum RouteIds {
    root = 'root',
}

export const globalState = {}

export enum PluginDataKeys {
    sessionKey = 'sessionKey',
    githubRepoSlug = 'repoSlug',
    githubAccountLogin = 'githubAccountLogin',
    // mapFieldsConfig = 'mapFieldsConfig',
    basePath = 'basePath',
}

export async function getReactPluginData() {
    const [repoSlug, basePath, githubAccountLogin, sessionKey] =
        await Promise.all([
            framer.getPluginData(PluginDataKeys.githubRepoSlug),

            framer.getPluginData(PluginDataKeys.basePath) || '',
            framer.getPluginData(PluginDataKeys.githubAccountLogin) || '',
            framer.getPluginData(PluginDataKeys.sessionKey) || '',
        ])
    const [owner, repo = ''] = repoSlug?.split('/') || ''

    return {
        owner,
        repo,

        basePath: basePath || '',
        githubAccountLogin: githubAccountLogin || '',
        sessionKey: sessionKey || '',
    }
}
