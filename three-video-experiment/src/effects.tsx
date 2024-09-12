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

export interface Effect<T=any> {
    id: string
    type: string
    start: number
    end: number
    bezierCurve: BezierCurve
    params: T
    children?: Effect<any>[]
    apply: (mesh: THREE.Mesh, progress: number, defaultMesh: THREE.Mesh) => void
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

    private currentTime: number = 0

    constructor(mesh: THREE.Mesh) {
        this.mesh = mesh
        this.defaultMesh = mesh.clone()
    }

    public update(deltaTime: number) {
        this.currentTime += deltaTime
        this.resetMesh()
        this.applyEffects(useAppStore.getState().effects, 0)
    }

    private resetMesh() {
        this.mesh.position.copy(this.defaultMesh.position)
        this.mesh.rotation.copy(this.defaultMesh.rotation)
        this.mesh.scale.copy(this.defaultMesh.scale)
    }

    private applyEffects(effects: Effect<any>[], parentOffset: number) {
        for (const effect of effects) {
            const absoluteStart = effect.start + parentOffset
            const absoluteEnd = effect.end + parentOffset

            if (
                this.currentTime >= absoluteStart &&
                this.currentTime <= absoluteEnd
            ) {
                const rawProgress =
                    (this.currentTime - absoluteStart) /
                    (absoluteEnd - absoluteStart)
                const easedProgress = evaluateBezier(
                    rawProgress,
                    effect.bezierCurve,
                )

                if (effect.children) {
                    this.applyEffects(effect.children, absoluteStart)
                } else {
                    effect.apply(this.mesh, easedProgress, this.defaultMesh)
                }
            }
        }
    }

    public updateEffect<T>(
        id: string,
        newStart?: number,
        newEnd?: number,
        newParams?: Partial<T>,
        newBezierCurve?: BezierCurve,
    ): boolean {
        const effect = this.findEffect(id, useAppStore.getState().effects)
        if (!effect || effect.children) return false

        if (newStart !== undefined) effect.start = newStart
        if (newEnd !== undefined) effect.end = newEnd
        if (newBezierCurve !== undefined) effect.bezierCurve = newBezierCurve
        if (newParams !== undefined) {
            Object.assign(effect.params, newParams)
        }

        return true
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

    private findEffect(id: string, effects: Effect<any>[]): Effect<any> | null {
        for (const effect of effects) {
            if (effect.id === id) return effect
            if (effect.children) {
                const found = this.findEffect(id, effect.children)
                if (found) return found
            }
        }
        return null
    }

    private removeEffectRecursive(id: string, effects: Effect<any>[]): boolean {
        for (let i = 0; i < effects.length; i++) {
            if (effects[i].id === id) {
                effects.splice(i, 1)
                return true
            }
            let eff = effects[i]
            if (eff.children) {
                if (this.removeEffectRecursive(id, eff.children || [])) {
                    return true
                }
            }
        }
        return false
    }
}
