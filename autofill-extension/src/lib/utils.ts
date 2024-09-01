import { env } from 'website/src/lib/env'

import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/client'

import type { RouteType } from 'website/src/lib/elysia.server'
import { ImageActionData } from '@/routes/Login'
import { z } from 'zod'
import {
    extractedFormInputSchema,
    filledFormInputSchema,
} from '@/background/background'

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
export type EnrichedElementPart = {
    possibleOptions?: { title: string; value: string }[]
    regexPattern?: string
    type?: string
}

export type ChromeMessageType =
    | { action: 'showHints' }
    | { action: 'hideHints' }
    | { action: 'highlightInputFound'; data: ExtractedFormInput }
    | { action: 'setHintValue'; data: SetHintValueMessage }
    | { action: 'dehighlightAll' }
    | { action: 'formInputFound'; data: ExtractedFormInput }
    | { action: 'start'; files: ImageActionData[] }
    | { action: 'captureVisibleTab'; index: number }
    | { action: 'enrichedElement'; data: EnrichedElementPart }
    | { action: 'popupLoader'; data?: PopupLoaderData }
    | { action: 'undoFilling' }
// | { action: 'captureVisibleTabComplete'; data: ImageActionData }

export type PopupLoaderData = {
    canUndo: boolean
}

export type SetHintValueMessage = z.infer<typeof filledFormInputSchema>
export type ExtractedFormInput = z.infer<typeof extractedFormInputSchema>

export function isFillableElement(el: any): el is HTMLInputElement {
    if (el instanceof HTMLInputElement) {
        return true
    }
    if (el instanceof HTMLTextAreaElement) {
        return true
    }
    if (el instanceof HTMLSelectElement) {
        return true
    }

    return false
}
