import * as THREE from 'three'
import { useEditorState } from './state'

type BezierCurve = [number, number, number, number]

export function evaluateBezier(t: number, curve: BezierCurve): number {
    const [p0, p1, p2, p3] = curve
    const u = 1 - t
    return (
        u * u * u * p0 +
        3 * u * u * t * p1 +
        3 * u * t * t * p2 +
        t * t * t * p3
    )
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
export function createEffect<T>({
    id,
    type,
    start,
    end,
    params,
    bezierCurve = [0, 0, 1, 1],
}: {
    id: string
    type: string
    start: number
    end: number
    params: T
    bezierCurve?: BezierCurve
}): Effect<T> {
    let apply: (mesh: THREE.Mesh, progress: number) => void

    switch (type) {
        case 'rotation':
            apply = (mesh, progress) => {
                const amount = (params as { amount: THREE.Vector3 }).amount
                mesh.rotation.x += amount.x * progress
                mesh.rotation.y += amount.y * progress
                mesh.rotation.z += amount.z * progress
            }
            break
        case 'scale':
            apply = (mesh, progress) => {
                const scale = (params as { scale: THREE.Vector3 }).scale
                mesh.scale.x += (scale.x - 1) * progress
                mesh.scale.y += (scale.y - 1) * progress
                mesh.scale.z += (scale.z - 1) * progress
            }
            break
        case 'position':
            apply = (mesh, progress) => {
                const position = (params as { position: THREE.Vector3 })
                    .position
                mesh.position.x += position.x * progress
                mesh.position.y += position.y * progress
                mesh.position.z += position.z * progress
            }
            break
        default:
            apply = () => {}
    }

    return { id, type, start, end, params, bezierCurve, apply }
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

function findEffect(id: string, effects: Effect<any>[]): Effect<any> | null {
    for (const effect of effects) {
        if (effect.id === id) return effect
        if (effect.children) {
            const found = findEffect(id, effect.children)
            if (found) return found
        }
    }
    return null
}

function removeEffectRecursive(
    id: string,
    effects: Effect<any>[],
): Effect<any>[] {
    return effects.filter((effect) => {
        if (effect.id === id) {
            return false
        }
        if (effect.children) {
            effect.children = removeEffectRecursive(id, effect.children)
        }
        return true
    })
}
