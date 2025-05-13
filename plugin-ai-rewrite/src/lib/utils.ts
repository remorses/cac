import { env } from 'website/src/lib/env'

import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/client'

import { framer } from 'framer-plugin'
import type { RouteType } from 'website/src/lib/spiceflow-plugins.server'

import { redirect } from 'react-router'
import { withMode } from 'plugin-migrate/src/lib/utils'

export {
    formatLargeNumber,
    getDesktop, withMode
} from 'plugin-migrate/src/lib/utils'
export type { LoaderReturnType } from 'plugin-migrate/src/lib/utils'

export let flyMachineId = ''

export const pluginApiClient: SpiceflowClient.Create<RouteType> =
    createSpiceflowClient<RouteType>(env.PUBLIC_URL!, {
        async onResponse(response) {
            if (response.status === 401) {
                console.log('clearing session because api returned 401')
                await framer.setPluginData(PluginDataKeys.sessionKey, null)
                await localStorage.setItem(PluginDataKeys.sessionKey, '')
                throw redirect(withMode(Paths.login))
            }
            if (response?.status === 402) {
                throw redirect(withMode(Paths.buy))
            }
            if (response.headers.get('fly-force-instance-id')) {
                flyMachineId = response.headers.get('fly-force-instance-id')!
            }
        },
        async onRequest(p) {
            const { sessionKey } = await getLLMPluginData()
            const headers = {
                sessionKey,
            }
            if (flyMachineId && p?.includes('/publish')) {
                headers['fly-force-instance-id'] = flyMachineId
            }
            return {
                headers,
                credentials: 'omit',
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
    prompt = '/prompt',
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

export async function getLLMPluginData() {
    const sessionKeyShared = localStorage.getItem(PluginDataKeys.sessionKey)
    const [sessionKey, info] = await Promise.all([
        framer.getPluginData(PluginDataKeys.sessionKey) || '',
        framer.getProjectInfo(),
    ])
    const projectId = info.id.slice(0, 16)

    return {
        sessionKey: sessionKeyShared || sessionKey || '',
        projectId,
    }
}

export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    wait: number = 300,
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
