import { createSpiceflowClient, SpiceflowClient } from 'spiceflow/client'
import { framer } from 'framer-plugin'
import { redirect } from 'react-router'
import { createClient } from '../generated/api-client'
import type { RouteType } from 'website/src/lib/spiceflow-plugins.server'

export type LoaderReturnType<T extends (...args: any) => any> = Awaited<
    ReturnType<T>
>

const PUBLIC_URL = import.meta.env.PUBLIC_URL || 'https://unframer.co'

export const pluginApiClient: SpiceflowClient.Create<RouteType> = createSpiceflowClient<RouteType>(PUBLIC_URL, {
    async onResponse(response) {
        if (response.status === 401) {
            console.log('clearing session because api returned 401')
            await framer.setPluginData(PluginDataKeys.sessionKey, null)
            throw redirect(withMode(Paths.login))
        }
    },
    async onRequest() {
        const { sessionKey } = await getMcpPluginData()
        return {
            headers: {
                sessionKey,
            },
        }
    },
})
export const noop: any = () => {}

export function isTruthy<T>(val: T | undefined | null | false): val is T {
    return Boolean(val)
}

export enum Paths {
    login = '/login',
    main = '/',
}

export enum RouteIds {
    root = 'root',
}

export const globalState = {}

export enum PluginDataKeys {
    sessionKey = 'sessionKey',
}

export async function getMcpPluginData() {
    const sessionKey = await framer.getPluginData(PluginDataKeys.sessionKey)
    return {
        sessionKey: sessionKey || '',
    }
}

export function withMode(path: string, params?: Record<string, string>) {
    const searchParams = new URLSearchParams(params)
    return `${path}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
}
