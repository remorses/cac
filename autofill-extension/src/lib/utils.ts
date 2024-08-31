import { env } from 'website/src/lib/env'

import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/client'

import type { RouteType } from 'website/src/lib/elysia.server'
import { ImageActionData } from '@/routes/Login'

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

// @ts-ignore
export const basePath = import.meta.env.BASE_URL || '/'

export async function getExtensionData() {
    return { sessionKey: '' }
}

export enum ChromeMessages {
    // content handled messages
    showHints = 'showHints',
    hideHints = 'hideHints',
    highlightInputFound = 'highlightInputFound',
    setHintValue = 'setHintValue',
    dehilightAll = 'dehilightAll',
    // popup handled messages
    formInputFound = 'formInputFound',
    // background handled messages
    start = 'start',
}

export type ChromeMessageType =
    | { action: ChromeMessages.showHints }
    | { action: ChromeMessages.hideHints }
    | { action: ChromeMessages.highlightInputFound; data: ExtractedFormInput }
    | { action: ChromeMessages.setHintValue; data: SetHintValueMessage }
    | { action: ChromeMessages.dehilightAll }
    | { action: ChromeMessages.formInputFound; data: SetHintValueMessage }
    | { action: ChromeMessages.start; files: ImageActionData[]; options: any }

export type SetHintValueMessage = {
    label: string
    description: string
    value: string
}

export type ExtractedFormInput = {
    label: string
    description: string
}
