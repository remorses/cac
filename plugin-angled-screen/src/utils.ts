import { useEffect, useRef } from 'react'
import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/client'
import type { RouteType } from 'website/src/lib/spiceflow-plugins.server'
import { env } from 'website/src/lib/env'

export const pluginApiClient: SpiceflowClient.Create<RouteType> =
    createSpiceflowClient<RouteType>(env.PUBLIC_URL!, {})

/**
 * Convenience method to load an image from a canvas.
 * As a File object, compressed as JPG
 */
export function bytesFromCanvas(canvas: HTMLCanvasElement): Promise<File> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) throw new Error('Blob does not exist')

                const file = new File([blob], 'canvas-image.jpg', {
                    type: blob.type,
                })
                resolve(file)
            },
            'image/jpeg',
            0.9,
        )
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

    const abortController = useRef<AbortController>(null)
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
