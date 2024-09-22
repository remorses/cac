import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Pane } from 'tweakpane'

/**
 * Convenience method to load an image from a canvas.
 * As a transferable bytes array
 */
export function bytesFromCanvas(
    canvas: HTMLCanvasElement,
): Promise<Uint8Array | null> {
    return new Promise<Uint8Array>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) throw new Error('Blob does not exist')

            const reader = new FileReader()

            reader.onload = () => {
                if (!reader.result) {
                    throw new Error('Reader result does not exist')
                }

                resolve(new Uint8Array(reader.result as ArrayBuffer))
            }
            reader.onerror = () => reject(new Error('Could not read from blob'))
            reader.readAsArrayBuffer(blob)
        })
    })
}

export function assert(
    condition: unknown,
    ...msg: unknown[]
): asserts condition {
    if (condition) return

    const e = Error(
        'Assertion Error' + (msg.length > 0 ? ': ' + msg.join(' ') : ''),
    )
    // Hack the stack so the assert call itself disappears. Works in jest and in chrome.
    if (e.stack) {
        try {
            const lines = e.stack.split('\n')
            if (lines[1]?.includes('assert')) {
                lines.splice(1, 1)
                e.stack = lines.join('\n')
            } else if (lines[0]?.includes('assert')) {
                lines.splice(0, 1)
                e.stack = lines.join('\n')
            }
        } catch {
            // nothing
        }
    }
    throw e
}

export function useAsyncEffect(
    effect: (abortController: AbortController) => Promise<void>,
    deps: any[],
) {
    const isProcessing = useRef<boolean>(false)

    const abortController = useRef<AbortController>()
    useEffect(() => {
        if (!isProcessing.current) {
            abortController.current?.abort()
            abortController.current = new AbortController()
            isProcessing.current = true
            effect(abortController.current)
                .catch((error) => {
                    console.error('Error in useAsyncEffect:', error)
                })
                .finally(() => {
                    isProcessing.current = false
                })
        }
        return () => {}
    }, deps)
}

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    ms = 300,
) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}

export const maxKey = (obj: { [key: string]: number }) => {
    const keys = Object.keys(obj)
    if (keys.length === 0) return ''
    return keys.reduce((a, b) => (obj[a] > obj[b] ? a : b))
}

export function createProxy<T extends object>({
    target,
    getter,
    setter,
}: {
    target: T
    getter?: (target: T, prop: string | symbol) => any
    setter?: (
        target: T,
        prop: string | symbol,
        value: any,
    ) => boolean | undefined
}): T {
    return new Proxy(target, {
        get(target: T, prop: string | symbol): any {
            if (getter) {
                const result = getter(target, prop)
                if (result !== undefined) {
                    return result
                }
            }
            return target[prop as keyof T]
        },

        set(target: T, prop: string | symbol, value: any): boolean {
            if (setter) {
                const result = setter(target, prop, value)
                if (result !== undefined) {
                    return result
                }
            }
            ;(target as any)[prop] = value
            return true
        },
    })
}

export function vec3Proxy(vector: THREE.Vector3) {
    return createProxy({
        target: vector,
        setter: (target, prop, value) => {
            if (prop === 'x') {
                target.setX(value)
            } else if (prop === 'y') {
                target.setY(value)
            } else if (prop === 'z') {
                target.setZ(value)
            } else {
                ;(target as any)[prop] = value
            }
            return true
        },
    })
}

export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>()

    useEffect(() => {
        ref.current = value
    }, [value])

    return ref.current
}

import * as TweakpaneEssentialsPlugin from '@tweakpane/plugin-essentials'

import * as TweakpaneFileImportPlugin from 'tweakpane-plugin-file-import'
import * as CamerakitPlugin from '@tweakpane/plugin-camerakit'
import * as TweakpaneRotationInputPlugin from '@0b5vr/tweakpane-plugin-rotation'

export function preparePane(pane: Pane) {
    pane.registerPlugin(TweakpaneEssentialsPlugin)
    pane.registerPlugin(TweakpaneFileImportPlugin)
    pane.registerPlugin(CamerakitPlugin)
    pane.registerPlugin(TweakpaneRotationInputPlugin)
    let isRefreshing = false

    // Override the refresh method to set the flag
    const originalRefresh = pane.refresh.bind(pane)
    pane.refresh = function () {
        isRefreshing = true
        originalRefresh()
        isRefreshing = false
    }

    // Override the original 'on' method to prevent firing during refresh
    const originalOn = pane.on.bind(pane)
    // https://github.com/cocopon/tweakpane/issues/430
    pane.on = function (eventName: string, callback: Function) {
        if (eventName === 'change') {
            let debounceTimer: ReturnType<typeof setTimeout>
            const debouncedCallback = (...args: any[]) => {
                if (isRefreshing) {
                    return
                }
                clearTimeout(debounceTimer)
                debounceTimer = setTimeout(() => {
                    callback(...args)
                }, 1) // 100ms debounce delay
            }

            return originalOn(eventName, debouncedCallback)
        }
        return originalOn(eventName as any, callback as any)
    }

    return pane
}

export function isTruthy<T>(val: T | undefined | null | false): val is T {
    return Boolean(val)
}

export function useLatestValue<T>(value: T) {
    const ref = useRef<T>(value)
    useEffect(() => {
        ref.current = value
    })
    return ref
}

export function assertNever(x: never): never {
    throw new Error(`Unexpected object: ${x}`)
}

export function useForceRender() {
    const [count, setCount] = useState(0)
    return {
        count,
        forceRender: () => {
            setCount((prevCount) => prevCount + 1)
        },
    }
}
