import { env } from 'website/src/lib/env'

import { Treaty, treaty } from '@elysiajs/eden'

import type { RouteType } from 'website/src/lib/elysia.server'

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

export function formatLargeNumber(x: number) {
    if (x < 1000) {
        return x.toFixed(0)
    }
    return (x / 1000).toFixed(0) + 'K'
}

export const basePath = import.meta.env.BASE_URL || '/'

export async function getMarkdownPluginData() {
    return {}
}

export enum ChromeMessages {
    beforeScreenshot = 'beforeScreenshot',
    captureScreenshot = 'captureScreenshot',
}
