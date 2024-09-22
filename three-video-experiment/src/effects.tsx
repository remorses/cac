import * as THREE from 'three'
import { FolderApi, Pane } from 'tweakpane'
import { threeCanvas } from './canvas'
import { assertNever } from './utils'

export type EditorKeyframe<Params = any> = {
    time: number
    id: string
    bezierCurve: BezierCurve
    params: Params
}

export interface GenericEffect<Type extends string, Params> {
    id: string
    name: string
    type: Type
    params: Params
    children?: Effect[]
    keyframes: EditorKeyframe<Params>[]
}

type Prettify<T> = { [K in keyof T]: T[K] }

export type GroupEffect = GenericEffect<'group', {}>

export type Effect = MeshEffect | CameraEffect | GroupEffect

interface EffectController<T extends Effect> {
    create(options: { keyframes?: T['keyframes'] }): T
    apply(effect: T, params: T['params']): void
    configure(effect: T, pane: Pane, params: T['params']): FolderApi | undefined
}

export type MeshEffect = Prettify<
    GenericEffect<
        'mesh',
        {
            position: THREE.Vector3
            rotation: THREE.Quaternion
        }
    >
>

const meshEffectController: EffectController<MeshEffect> = {
    create({ keyframes = [] }) {
        const params = {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(0, 0, 0),
        }
        params.position.copy(threeCanvas.plane.position)
        params.rotation.copy(threeCanvas.plane.quaternion)
        return {
            id: 'mesh',
            name: 'Mesh',
            keyframes,
            type: 'mesh',
            params,
        }
    },
    apply(effect, params) {
        const mesh = threeCanvas.plane
        mesh.position.copy(params.position)
        mesh.quaternion.copy(params.rotation)
        mesh.updateMatrix()
        mesh.updateMatrixWorld(true)
        threeCanvas.transformControls.updateMatrixWorld()
    },
    configure(effect, pane, params) {
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
            unit: 'turn',
        })
        return folder
    },
}

export type CameraEffect = GenericEffect<
    'camera',
    {
        position: THREE.Vector3
        target: THREE.Vector3
    }
>

const cameraEffectController: EffectController<CameraEffect> = {
    create({ keyframes = [] }) {
        const params = {
            position: new THREE.Vector3(0, 0, 0),
            target: new THREE.Vector3(0, 0, 0),
        }
        params.position.copy(threeCanvas.controls.object.position)
        params.target.copy(threeCanvas.controls.target)
        return {
            name: 'Camera',
            keyframes: keyframes,
            id: 'camera',
            type: 'camera',
            params,
        }
    },
    apply(effect, params) {
        const { controls } = threeCanvas
        controls.object.position.copy(params.position)
        controls.target.copy(params.target)
        controls.update()
    },
    configure(effect, pane, params) {
        const folder = pane.addFolder({
            title: 'Camera Transform',
        })
        folder.addBinding(params.position, 'x', {
            label: 'Camera X',
            picker: 'inline',
            expanded: true,
        })
        folder.addBinding(params.position, 'y', {
            label: 'Camera Y',
            picker: 'inline',
            expanded: true,
        })
        folder.addBinding(params.position, 'z', {
            label: 'Camera Z',
            picker: 'inline',
            expanded: true,
        })
        folder.addBinding(params.target, 'x', {
            label: 'Target X',
            picker: 'inline',
            expanded: true,
        })
        folder.addBinding(params.target, 'y', {
            label: 'Target Y',
            picker: 'inline',
            expanded: true,
        })
        folder.addBinding(params.target, 'z', {
            label: 'Target Z',
            picker: 'inline',
            expanded: true,
        })
        return folder
    },
}

const groupEffectController: EffectController<GroupEffect> = {
    create({ keyframes = [] }) {
        return {
            id: 'group',
            name: 'Group',
            keyframes,
            type: 'group',
            params: {},
        }
    },
    apply(effect, params) {
        // Handle group effect
    },
    configure(effect, pane, params) {
        // Configure group effect
        return undefined
    },
}
export const effectControllers: Record<
    Effect['type'],
    EffectController<Effect>
> = {
    mesh: meshEffectController,
    camera: cameraEffectController,
    group: groupEffectController,
}

export function applyEffect(effect: Effect, params: Effect['params']) {
    const controller = effectControllers[effect.type]
    if (controller) {
        controller.apply(effect, params as any)
    } else {
        console.warn('No controller found for effect type', effect.type)
    }
}

export function configureEffect(
    effect: Effect,
    pane: Pane,
    params: Effect['params'],
) {
    const controller = effectControllers[effect.type]
    if (controller) {
        return controller.configure(effect, pane, params as any)
    } else {
        console.warn('No controller found for effect type', effect.type)
    }
}

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
    const normalizedT = Math.max(
        0,
        Math.min(
            1,
            (t - prevKeyframeTime) / (nextKeyframeTime - prevKeyframeTime),
        ),
    )

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

type WithParent = { node: Effect; parent: Effect | null }

export function bfs(
    effects: Effect[],
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
    effects: Effect[],
    filterCallback: (effect: Effect) => boolean,
): Effect[] {
    let res = effects.reduce((filteredEffects: Effect[], effect) => {
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

export type EffectType = 'mesh' | 'camera' | 'group'

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
        if (obj instanceof THREE.Vector4) {
            return new THREE.Vector4().copy(obj)
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
        // Handle Date objects
        if (obj instanceof Date) {
            return new Date(obj.getTime())
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

export function updateEffectInTree(effects: Effect[], node: Partial<Effect>) {
    return effects.map((effect) => {
        if (effect.id === node.id) {
            return { ...effect, ...node }
        }
        // if (effect.id === node.id) {
        //     const updatedEffect = {
        //         ...effect,
        //         ...node,
        //     }

        //     // Ensure start is not greater than end
        //     if (updatedEffect.start > updatedEffect.end) {
        //         updatedEffect.start = updatedEffect.end
        //     }

        //     if (effect.children) {
        //         const oldDuration = effect.end - effect.start
        //         const newDuration = updatedEffect.end - updatedEffect.start

        //         updatedEffect.children = effect.children.map((child) => {
        //             const updatedChild = { ...child }

        //             // Calculate relative position of child within parent
        //             const relativeStart =
        //                 (child.start - effect.start) / oldDuration
        //             const relativeEnd = (child.end - effect.start) / oldDuration

        //             // Update child start and end times based on new parent duration
        //             updatedChild.start =
        //                 updatedEffect.start + relativeStart * newDuration
        //             updatedChild.end =
        //                 updatedEffect.start + relativeEnd * newDuration

        //             // Ensure child start and end are within parent bounds
        //             updatedChild.start = Math.max(
        //                 updatedEffect.start,
        //                 Math.min(updatedChild.start, updatedEffect.end),
        //             )
        //             updatedChild.end = Math.max(
        //                 updatedEffect.start,
        //                 Math.min(updatedChild.end, updatedEffect.end),
        //             )

        //             // Ensure child start is not greater than child end
        //             if (updatedChild.start > updatedChild.end) {
        //                 updatedChild.start = updatedChild.end
        //             }

        //             return updatedChild
        //         })
        //     }

        //     return updatedEffect
        // }
        if (effect.children) {
            const updatedChildren = updateEffectInTree(effect.children, node)
            if (updatedChildren) {
                return { ...effect, children: updatedChildren }
            }
        }
        return effect
    })
}

// function findEffect(id: string, effects: Effect[]): Effect | null {
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
//     effects: Effect[],
// ): Effect[] {
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
