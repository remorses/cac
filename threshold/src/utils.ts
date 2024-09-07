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

export class VignetteShader {
    uniforms: {
        tDiffuse: { value?: THREE.Texture | null }
        offset: { value: number }
        darkness: { value: number }
        edge: { value: number }
    }
    vertexShader: string
    fragmentShader: string
    constructor(edge: number) {
        this.uniforms = {
            tDiffuse: { value: null },
            offset: { value: 1 },
            darkness: { value: 1 },
            edge: { value: edge }, // Parametrize edge
        }
        this.vertexShader = `
          varying vec2 vUv;
          void main() {
              vUv = uv; // Pass UV coordinates to the fragment shader
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Set the position of the vertex
          }
      `
        this.fragmentShader = `
          uniform sampler2D tDiffuse; // The texture to apply the vignette effect to
          uniform float offset; // The offset value for the vignette effect
          uniform float darkness; // The darkness value for the vignette effect
          uniform int edge; // The edge to apply the vignette effect to
          varying vec2 vUv; // The UV coordinates passed from the vertex shader
          void main() {
              vec4 texel = texture2D(tDiffuse, vUv); // Get the color of the current pixel
              vec2 uv = (vUv - 0.5) * 2.0; // Transform UV coordinates to range [-1, 1]
              float vignetteAmount;
              if (edge == 0) { // Apply vignette effect on the right edge
                  vignetteAmount = 1.0 - uv.x;
              } else if (edge == 1) { // Apply vignette effect on the left edge
                  vignetteAmount = 1.0 + uv.x;
              } else if (edge == 2) { // Apply vignette effect on the top edge
                  vignetteAmount = 1.0 - uv.y;
              } else if (edge == 3) { // Apply vignette effect on the bottom edge
                  vignetteAmount = 1.0 + uv.y;
              }
              vignetteAmount = min(vignetteAmount, smoothstep(0.0, offset, vignetteAmount)); // Apply only if it darkens the image
              texel.rgb = mix(texel.rgb, texel.rgb * vignetteAmount, darkness); // Mix the original color with the vignette effect
              gl_FragColor = texel; // Set the final color of the pixel
          }
      `
    }
}

export const maxKey = (obj: { [key: string]: number }) => {
    return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b))
}
