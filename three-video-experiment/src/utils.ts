import { useEffect, useRef } from 'react'
import * as THREE from 'three'

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

export const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
    }
}

export const maxKey = (obj: { [key: string]: number }) => {
    return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b))
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
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
