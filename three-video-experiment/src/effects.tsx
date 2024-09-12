import * as THREE from 'three'
import { useAppStore } from './state'

type BezierCurve = [number, number, number, number]

function evaluateBezier(t: number, curve: BezierCurve): number {
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
    apply: (mesh: THREE.Mesh, progress: number, defaultMesh: THREE.Mesh) => void
}

type WithParent = { node: Effect<any>; parent: Effect<any> | null }

export function bfs(effects: Effect<any>[], callback?: (node: WithParent) => boolean) {
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
    let apply: (
        mesh: THREE.Mesh,
        progress: number,
        defaultMesh: THREE.Mesh,
    ) => void

    switch (type) {
        case 'rotation':
            apply = (mesh, progress, defaultMesh) => {
                const amount = (params as { amount: THREE.Vector3 }).amount
                mesh.rotation.x = defaultMesh.rotation.x + amount.x * progress
                mesh.rotation.y = defaultMesh.rotation.y + amount.y * progress
                mesh.rotation.z = defaultMesh.rotation.z + amount.z * progress
            }
            break
        case 'scale':
            apply = (mesh, progress, defaultMesh) => {
                const scale = (params as { scale: THREE.Vector3 }).scale
                mesh.scale.x =
                    defaultMesh.scale.x +
                    (scale.x - defaultMesh.scale.x) * progress
                mesh.scale.y =
                    defaultMesh.scale.y +
                    (scale.y - defaultMesh.scale.y) * progress
                mesh.scale.z =
                    defaultMesh.scale.z +
                    (scale.z - defaultMesh.scale.z) * progress
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

export class VideoEffectApplier {
    private mesh: THREE.Mesh
    private defaultMesh: THREE.Mesh

    constructor(mesh: THREE.Mesh) {
        this.mesh = mesh
        this.defaultMesh = mesh.clone()
    }

    public render() {
        this.resetMesh()
        this.applyEffects(useAppStore.getState().effects)
    }

    private resetMesh() {
        this.mesh.position.copy(this.defaultMesh.position)
        this.mesh.rotation.copy(this.defaultMesh.rotation)
        this.mesh.scale.copy(this.defaultMesh.scale)
    }

    private applyEffects(effects: Effect<any>[]) {
        for (const effect of effects) {
            const absoluteStart = effect.start
            const absoluteEnd = effect.end

            const { currentTime } = useAppStore.getState()
            if (currentTime >= absoluteStart && currentTime <= absoluteEnd) {
                const rawProgress =
                    (currentTime - absoluteStart) /
                    (absoluteEnd - absoluteStart)
                const easedProgress = evaluateBezier(
                    rawProgress,
                    effect.bezierCurve,
                )

                if (effect.children) {
                    this.applyEffects(effect.children)
                } else {
                    effect.apply(this.mesh, easedProgress, this.defaultMesh)
                }
            }
        }
    }

    // public addEffect(
    //     effect: Effect<any> | EffectGroup,
    //     parentId?: string,
    // ): boolean {
    //     if (parentId) {
    //         const parent = this.findEffect(
    //             parentId,
    //             useAppStore.getState().effects,
    //         )
    //         if (parent instanceof EffectGroup) {
    //             parent.children.push(effect)
    //             return true
    //         }
    //         return false
    //     }
    //     this.videoEditor.effects.push(effect)
    //     return true
    // }
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
