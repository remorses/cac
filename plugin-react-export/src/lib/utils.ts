import { env } from 'website/src/lib/env'

import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/client'

import { framer } from 'framer-plugin'
import type { RouteType } from 'website/src/lib/elysia.server'

import { redirect } from 'react-router'
import { withMode } from 'plugin-github-sync/src/lib/utils'

export {
    formatLargeNumber,
    getDesktop, withMode
} from 'plugin-github-sync/src/lib/utils'
export type { LoaderReturnType } from 'plugin-github-sync/src/lib/utils'

export const pluginApiClient: SpiceflowClient.Create<RouteType> =
    createSpiceflowClient<RouteType>(env.PUBLIC_URL!, {
        async onResponse(response) {
            if (response.status === 401) {
                console.log('clearing session because api returned 401')
                await framer.setPluginData(PluginDataKeys.sessionKey, null)
                throw redirect(withMode(Paths.login))
            }
            if (response?.status === 402) {
                throw redirect(withMode(Paths.buy))
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
    buy = '/buy',
}

export enum RouteIds {
    root = 'root',
}

export const globalState = {}

export enum PluginDataKeys {
    sessionKey = 'sessionKey',
}

export async function getReactPluginData() {
    const [sessionKey, info] = await Promise.all([
        framer.getPluginData(PluginDataKeys.sessionKey) || '',
        framer.getProjectInfo(),
    ])
    const projectId = info.id.slice(0, 16)

    return {
        sessionKey: sessionKey || '',
        projectId,
    }
}


export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    wait: number = 300
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | undefined

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            fn(...args)
            timeout = undefined
        }, wait)
    }
}
