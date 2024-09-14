import * as THREE from 'three'
import { useEditorState } from './state'
import { Pane, FolderApi } from 'tweakpane'
import { deg } from './canvas'
import { createProxy } from './utils'

type BezierCurve = [number, number, number, number]

export function evaluateBezier(t: number, curve: BezierCurve): number {
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

export interface Effect<T = any> {
    id: string
    type: string
    start: number
    end: number
    bezierCurve: BezierCurve
    params: T
    children?: Effect<any>[]
    apply: (mesh: THREE.Mesh, progress: number) => void
    configure?: (pane: Pane) => void
}

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

export function createRotationEffect({
    id,
    start,
    end,
    amount,
    bezierCurve = [0.5, 0, 0.5, 1],
}: {
    id: string
    start: number
    end: number
    amount: THREE.Vector2
    bezierCurve?: BezierCurve
}): Effect<{ amount: THREE.Vector2 }> {
    const params = { amount }
    return {
        id,
        type: 'rotation',
        start,
        end,
        params,
        bezierCurve,
        apply(mesh: THREE.Mesh, progress: number) {
            mesh.rotation.x += params.amount.x * progress
            mesh.rotation.y += params.amount.y * progress
        },
        configure(pane) {
            const folder = pane.addFolder({
                title: 'Rotation',
            })
            const getRotation = (value: number) => (value * 180) / Math.PI
            const setRotation = (value: number) => (value * Math.PI) / 180

            folder.addBinding(
                createProxy({
                    target: params.amount,
                    setter(target, prop, value) {
                        target[prop] = setRotation(value)
                        return true
                    },
                    getter(target, prop) {
                        return getRotation(target[prop])
                    },
                }),
                'x',
                {
                    label: 'X Rotation',
                    picker: 'inline',
                    expanded: true,
                    min: -180,
                    max: 180,
                },
            )
            folder.addBinding(
                createProxy({
                    target: params.amount,
                    setter(target, prop, value) {
                        target[prop] = setRotation(value)
                        return true
                    },
                    getter(target, prop) {
                        return getRotation(target[prop])
                    },
                }),
                'y',
                {
                    label: 'Y Rotation',
                    picker: 'inline',
                    expanded: true,
                    min: -180,
                    max: 180,
                },
            )
            bezierControl({ folder, bezierCurve })
        },
    }
}

export function createScaleEffect({
    id,
    start,
    end,
    scale,
    bezierCurve = [0, 0, 1, 1],
}: {
    id: string
    start: number
    end: number
    scale: THREE.Vector3
    bezierCurve?: BezierCurve
}): Effect<{ scale: THREE.Vector3 }> {
    const params = { scale }
    return {
        id,
        type: 'scale',
        start,
        end,
        params,
        bezierCurve,
        apply(mesh: THREE.Mesh, progress: number) {
            mesh.scale.x += (params.scale.x - 1) * progress
            mesh.scale.y += (params.scale.y - 1) * progress
            mesh.scale.z += (params.scale.z - 1) * progress
        },
        configure(pane) {
            const folder = pane.addFolder({
                title: 'Scale',
            })
            folder.addBinding(params.scale, 'x', {
                label: 'X Scale',
                picker: 'inline',
                expanded: true,
                min: 0,
                max: 2,
            })
            folder.addBinding(params.scale, 'y', {
                label: 'Y Scale',
                picker: 'inline',
                expanded: true,
                min: 0,
                max: 2,
            })
            folder.addBinding(params.scale, 'z', {
                label: 'Z Scale',
                picker: 'inline',
                expanded: true,
                min: 0,
                max: 2,
            })
            bezierControl({ folder, bezierCurve })
        },
    }
}

export function createPositionEffect({
    id,
    start,
    end,
    position,
    bezierCurve = [0, 0, 1, 1],
}: {
    id: string
    start: number
    end: number
    position: THREE.Vector3
    bezierCurve?: BezierCurve
}): Effect<{ position: THREE.Vector3 }> {
    const params = { position }
    return {
        id,
        type: 'position',
        start,
        end,
        params,
        bezierCurve,
        apply(mesh: THREE.Mesh, progress: number) {
            mesh.position.x += params.position.x * progress
            mesh.position.y += params.position.y * progress
            mesh.position.z += params.position.z * progress
        },
        configure(pane) {
            const folder = pane.addFolder({
                title: 'Position',
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
            bezierControl({ folder, bezierCurve })
        },
    }
}

function bezierControl({
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
        bezierCurve,
        children,
        apply: () => {},
    }
}

export function updateEffectInTree(effects: Effect<any>[], node: Effect<any>) {
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
