import { env } from 'website/src/lib/env'

import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/client'



import { z } from 'zod'
import { extractedFormInputSchema } from '@/background/background'
import { Hint } from '@/content/findHints'

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

export async function getExtensionData() {
    return { sessionKey: '' }
}
export type EnrichedElementPart = {
    possibleOptions?: { title: string; value: string }[]
    regexPattern?: string
    type?: string
}

export type ChromeMessageType =
    | {
          action: 'showHints'
          documentHtml?: string
          pastHintCount?: number
          hints?: { label: string }[]
      }
    | { action: 'hideHints' }
    | { action: 'setHintValue'; data: ExtractedFormInput }
    | { action: 'highlightInputFound'; data: ExtractedFormInput }
    | { action: 'dehighlightAll' }
    // | { action: 'formInputFound'; data: ExtractedFormInput }
    | { action: 'start'; files: FileObject[]; description: string }
    | { action: 'captureVisibleTab'; index: number; dataUrl?: string }
    // | { action: 'enrichedElement'; data: EnrichedElementPart }
    | { action: 'popupLoader'; data?: PopupLoaderData }
    | { action: 'undoFilling' }
// | { action: 'captureVisibleTabComplete'; data: ImageActionData }

export type PopupLoaderData = {
    canUndo: boolean
} & ExtensionStorage

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

type Preset = {
    prompt: string
    id: string
    files: FileObject[]
}
export type ExtensionStorage = {
    presets?: Preset[]
    lastUsedPresetId?: string
}

export function generateRandomString(length: number) {
    let result = ''
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        )
    }
    return result
}

export type FileObject = {
    name: string
    type: string
    dataUrl: string
}

export function truncateString(str: string, maxLength: number = 100) {
    if (str.length <= maxLength) {
        return str
    }
    return str.slice(0, maxLength) + '...'
}

export function debounce<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    delay: number,
): T {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    return (async (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(async () => {
            await fn(...args)
            timeoutId = null
        }, delay)
    }) as any
}

export const DATA_LLM_ID = 'vimium-label'

export const PRESET_ID_LEN = 9
