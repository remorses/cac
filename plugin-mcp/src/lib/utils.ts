import { createSpiceflowClient } from 'spiceflow/client'
import { framer } from 'framer-plugin'
import { redirect } from 'react-router'
import { createClient } from '../generated/api-client'

export type LoaderReturnType<T extends (...args: any) => any> = Awaited<
    ReturnType<T>
>

const PUBLIC_URL = import.meta.env.PUBLIC_URL || 'https://unframer.co'

// Create API client with authentication
export async function getPluginApiClient() {
    const { createSpiceflowClient } = await import('spiceflow/client')
    const client = createSpiceflowClient(PUBLIC_URL, {
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
    return client
}

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
    websocketId = 'websocketId',
}

export async function getMcpPluginData() {
    const sessionKey = await framer.getPluginData(PluginDataKeys.sessionKey)
    const websocketId = await framer.getPluginData(PluginDataKeys.websocketId)
    return {
        sessionKey: sessionKey || '',
        websocketId: websocketId || generateWebsocketId(),
    }
}

export function generateWebsocketId() {
    return Math.random().toString(36).substring(2, 15)
}

export function withMode(path: string, params?: Record<string, string>) {
    const searchParams = new URLSearchParams(params)
    return `${path}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
}
