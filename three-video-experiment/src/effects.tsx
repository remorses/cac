import * as THREE from 'three'
import { threeCanvas } from './App'
import { useEditorState } from './state'
import { Pane, FolderApi } from 'tweakpane'
import { deg } from './canvas'
import { createProxy } from './utils'

export type BezierCurve = [number, number, number, number]

export function evaluateBezier(t: number, curve?: BezierCurve): number {
    if (!curve) {
        return t
    }
    const [x1, y1, x2, y2] = curve

    // These are the fixed start and end points in the CSS cubic bezier format
    const P0 = { x: 0, y: 0 }
    const P1 = { x: x1, y: y1 }
    const P2 = { x: x2, y: y2 }
    const P3 = { x: 1, y: 1 }

    const u = 1 - t

    // Bezier equation for x and y values
    const x =
        u * u * u * P0.x +
        3 * u * u * t * P1.x +
        3 * u * t * t * P2.x +
        t * t * t * P3.x
    const y =
        u * u * u * P0.y +
        3 * u * u * t * P1.y +
        3 * u * t * t * P2.y +
        t * t * t * P3.y

    // Since you're trying to map t (from 0 to 1) based on x, solve for y
    return y
}
export function evaluate2Beziers(
    t: number,
    prevKeyframeTime: number,
    nextKeyframeTime: number,
    prevCurve?: BezierCurve,
    nextCurve?: BezierCurve,
): number {
    if (!prevCurve && !nextCurve) {
        return t
    }

    // Normalize t to be between 0 and 1 relative to the keyframe interval
    const normalizedT = Math.max(0, Math.min(1, 
        (t - prevKeyframeTime) / (nextKeyframeTime - prevKeyframeTime)
    ))

    // Evaluate both curves
    const prevValue = prevCurve
        ? evaluateBezier(normalizedT, prevCurve)
        : normalizedT
    const nextValue = nextCurve
        ? evaluateBezier(normalizedT, nextCurve)
        : normalizedT

    // Clamp the values to prevent explosion
    const clampedPrevValue = Math.max(0, Math.min(1, prevValue))
    const clampedNextValue = Math.max(0, Math.min(1, nextValue))

    // Interpolate between the two clamped values
    return clampedPrevValue * (1 - normalizedT) + clampedNextValue * normalizedT
}

export type EditorKeyframe<Params = any> = {
    time: number
    id: string
    bezierCurve: BezierCurve
    params: Params
}

export interface Effect<T = any> {
    id: string
    type: string
    start: number
    end: number

    params: T
    children?: Effect<any>[]
    keyframes: EditorKeyframe<T>[]
    apply: (params: T) => void
    configure?: (pane: Pane, params: T) => FolderApi
}

export type EffectInit<E> =
    E extends Effect<infer T>
        ? Partial<Omit<Effect<T>, 'params'>> &
              Pick<Effect<T>, 'id' | 'start' | 'end'>
        : never

type WithParent = { node: Effect<any>; parent: Effect<any> | null }

export function bfs(
    effects: Effect<any>[],
    callback?: (node: WithParent) => boolean,
) {
    const queue: WithParent[] = effects.map((effect) => ({
        node: effect,
        parent: null,
    }))
    const result: WithParent[] = []

    while (queue.length > 0) {
        const current = queue.shift()
        if (current) {
            result.push(current)

            if (callback && callback(current)) {
                break
            }

            if (current.node.children) {
                queue.push(
                    ...current.node.children.map((child) => ({
                        node: child,
                        parent: current.node,
                    })),
                )
            }
        }
    }

    return result
}

export function filterEffectTree(
    effects: Effect<any>[],
    filterCallback: (effect: Effect<any>) => boolean,
): Effect<any>[] {
    let res = effects.reduce((filteredEffects: Effect<any>[], effect) => {
        if (filterCallback(effect)) {
            const filteredEffect = effect
            if (effect.children) {
                filteredEffect.children = filterEffectTree(
                    effect.children,
                    filterCallback,
                )
            }
            filteredEffects.push(filteredEffect)
        }
        return filteredEffects
    }, [])
    return [...res]
}

export type EffectType = 'rotation' | 'scale' | 'position'

export type MeshEffect = Effect<{
    position: THREE.Vector3
    rotation: THREE.Quaternion
}>

export function createMeshEffect({
    id,
    start,
    end,
    ...rest
}: EffectInit<MeshEffect>): MeshEffect {
    const params = {
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Quaternion(0, 0, 0),
    }
    params.position.copy(threeCanvas.plane.position)
    params.rotation.copy(threeCanvas.plane.quaternion)
    return {
        keyframes: [],
        ...rest,
        id,
        type: 'mesh',
        start,
        end,
        params,
        apply(params) {
            const mesh = threeCanvas.plane
            mesh.position.copy(params.position)
            mesh.quaternion.copy(params.rotation)
            mesh.updateMatrix()
            mesh.updateMatrixWorld(true)
            threeCanvas.transformControls.updateMatrixWorld()
        },
        configure(pane, params) {
            const folder = pane.addFolder({
                title: 'Mesh Transform',
            })
            folder.addBinding(params.position, 'x', {
                label: 'X Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(params.position, 'y', {
                label: 'Y Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(params.position, 'z', {
                label: 'Z Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(params, 'rotation', {
                label: 'Rotation',
                picker: 'inline',
                expanded: true,
                view: 'rotation',
                rotationMode: 'quaternion',

                unit: 'turn', // or 'rad' or 'turn'. optional, 'rad' by default
            })
            return folder
        },
    }
}

export type CameraEffect = Effect<{
    position: THREE.Vector3
    target: THREE.Vector3
    zoom: number
}>

export function createCameraEffect({
    id,
    start,
    end,
    ...rest
}: EffectInit<CameraEffect>): CameraEffect {
    const params = {
        position: new THREE.Vector3(0, 0, 0),
        target: new THREE.Vector3(0, 0, 0),
        zoom: 1,
    }
    params.position.copy(threeCanvas.controls.object.position)
    params.target.copy(threeCanvas.controls.target)
    params.zoom = threeCanvas.camera.zoom
    return {
        keyframes: [],
        ...rest,
        id,
        type: 'camera',
        start,
        end,
        params,
        apply(params) {
            const { camera, controls } = threeCanvas
            controls.object.position.copy(params.position)
            controls.target.copy(params.target)
            controls.update()

            // controls.update()
        },
        configure(pane, params) {
            const folder = pane.addFolder({
                title: 'Camera Transform',
            })

            folder.addBinding(params.position, 'x', {
                label: 'Camera X Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(params.position, 'y', {
                label: 'Camera Y Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(params.position, 'z', {
                label: 'Camera Z Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(params.target, 'x', {
                label: 'Target X Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(params.target, 'y', {
                label: 'Target Y Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(params.target, 'z', {
                label: 'Target Z Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(params, 'zoom', {
                label: 'Zoom',
                min: 0.1,
                max: 10,
                step: 0.1,
            })
            return folder
        },
    }
}

export function bezierControlBinding({
    folder,
    bezierCurve,
}: {
    folder: FolderApi
    bezierCurve: BezierCurve
}) {
    return (
        folder
            .addBlade({
                view: 'cubicbezier',
                value: bezierCurve,
                expanded: true,
                label: 'Animation',
                picker: 'inline',
            })
            // @ts-ignore wrong tweakpane type
            .on('change', (value) => {
                // The bezier curve evaluation in evaluateBezier() is correct.
                // This assignment updates the bezierCurve array with new values.
                bezierCurve[0] = value.value.x1
                bezierCurve[1] = value.value.y1
                bezierCurve[2] = value.value.x2
                bezierCurve[3] = value.value.y2
            })
    )
}

export function effectsParamsClone(params: any) {
    // Deep clone function to handle objects, Three.js vectors, Euler, etc.
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj
        }

        // Handle Three.js specific objects
        if (obj instanceof THREE.Vector2) {
            return new THREE.Vector2().copy(obj)
        }
        if (obj instanceof THREE.Vector3) {
            return new THREE.Vector3().copy(obj)
        }
        if (obj instanceof THREE.Euler) {
            return new THREE.Euler().copy(obj)
        }
        if (obj instanceof THREE.Quaternion) {
            return new THREE.Quaternion().copy(obj)
        }
        if (obj instanceof THREE.Color) {
            return new THREE.Color().copy(obj)
        }

        // Handle arrays
        if (Array.isArray(obj)) {
            return obj.map((item) => deepClone(item))
        }

        // Handle plain objects
        const clonedObj = {}
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = deepClone(obj[key])
            }
        }
        return clonedObj
    }

    return deepClone(params)
}

export function createEffectGroup({
    id,
    start,
    end,
    children,
    bezierCurve = [0, 0, 1, 1],
}: {
    id: string
    start: number
    end: number
    children: Effect<any>[]
    bezierCurve?: BezierCurve
}): Effect<{}> {
    return {
        id,
        type: 'group',
        start,
        end,
        params: {},
        children,
        keyframes: [],
        apply: () => {},
        // configure: () => {},
    }
}

export function updateEffectInTree(
    effects: Effect<any>[],
    node: EffectInit<Effect<any>>,
) {
    return effects.map((effect) => {
        if (effect.id === node.id) {
            const updatedEffect = {
                ...effect,
                ...node,
            }

            // Ensure start is not greater than end
            if (updatedEffect.start > updatedEffect.end) {
                updatedEffect.start = updatedEffect.end
            }

            if (effect.children) {
                const oldDuration = effect.end - effect.start
                const newDuration = updatedEffect.end - updatedEffect.start

                updatedEffect.children = effect.children.map((child) => {
                    const updatedChild = { ...child }

                    // Calculate relative position of child within parent
                    const relativeStart =
                        (child.start - effect.start) / oldDuration
                    const relativeEnd = (child.end - effect.start) / oldDuration

                    // Update child start and end times based on new parent duration
                    updatedChild.start =
                        updatedEffect.start + relativeStart * newDuration
                    updatedChild.end =
                        updatedEffect.start + relativeEnd * newDuration

                    // Ensure child start and end are within parent bounds
                    updatedChild.start = Math.max(
                        updatedEffect.start,
                        Math.min(updatedChild.start, updatedEffect.end),
                    )
                    updatedChild.end = Math.max(
                        updatedEffect.start,
                        Math.min(updatedChild.end, updatedEffect.end),
                    )

                    // Ensure child start is not greater than child end
                    if (updatedChild.start > updatedChild.end) {
                        updatedChild.start = updatedChild.end
                    }

                    return updatedChild
                })
            }

            return updatedEffect
        }
        if (effect.children) {
            const updatedChildren = updateEffectInTree(effect.children, node)
            if (updatedChildren) {
                return { ...effect, children: updatedChildren }
            }
        }
        return effect
    })
}

// function findEffect(id: string, effects: Effect<any>[]): Effect<any> | null {
//     for (const effect of effects) {
//         if (effect.id === id) return effect
//         if (effect.children) {
//             const found = findEffect(id, effect.children)
//             if (found) return found
//         }
//     }
//     return null
// }

// function removeEffectRecursive(
//     id: string,
//     effects: Effect<any>[],
// ): Effect<any>[] {
//     return effects.filter((effect) => {
//         if (effect.id === id) {
//             return false
//         }
//         if (effect.children) {
//             effect.children = removeEffectRecursive(id, effect.children)
//         }
//         return true
//     })
// }
