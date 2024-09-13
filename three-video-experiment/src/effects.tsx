import * as THREE from 'three'
import { useEditorState } from './state'
import { Pane } from 'tweakpane'
import { deg } from './canvas'

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
    bezierCurve = [0, 0, 1, 1],
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
            folder.addBlade({
                view: 'cubicbezier',
                value: bezierCurve,
                expanded: true,
                label: 'Animation',
                picker: 'inline',
            })
            folder.addBinding(params.amount, 'x', {
                label: 'X Rotation',
                picker: 'inline',
                expanded: true,
                min: -180 * deg,
                max: 360 * deg,
            })
            folder.addBinding(params.amount, 'y', {
                label: 'Y Rotation',
                picker: 'inline',
                expanded: true,
                min: -180 * deg,
                max: 360 * deg,
            })
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
            mesh.scale.x += (this.params.scale.x - 1) * progress
            mesh.scale.y += (this.params.scale.y - 1) * progress
            mesh.scale.z += (this.params.scale.z - 1) * progress
        },
        configure(pane) {
            const folder = pane.addFolder({
                title: 'Scale',
            })
            folder.addBinding(this.params.scale, 'x', {
                label: 'X Scale',
                picker: 'inline',
                expanded: true,
                min: 0,
                max: 2,
            })
            folder.addBinding(this.params.scale, 'y', {
                label: 'Y Scale',
                picker: 'inline',
                expanded: true,
                min: 0,
                max: 2,
            })
            folder.addBinding(this.params.scale, 'z', {
                label: 'Z Scale',
                picker: 'inline',
                expanded: true,
                min: 0,
                max: 2,
            })
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
            mesh.position.x += this.params.position.x * progress
            mesh.position.y += this.params.position.y * progress
            mesh.position.z += this.params.position.z * progress
        },
        configure(pane) {
            const folder = pane.addFolder({
                title: 'Position',
            })
            folder.addBinding(this.params.position, 'x', {
                label: 'X Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(this.params.position, 'y', {
                label: 'Y Position',
                picker: 'inline',
                expanded: true,
            })
            folder.addBinding(this.params.position, 'z', {
                label: 'Z Position',
                picker: 'inline',
                expanded: true,
            })
        },
    }
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
