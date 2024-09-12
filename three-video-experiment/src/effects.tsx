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

interface EffectItem<T> {
    id: string
    type: string
    start: number
    end: number
    bezierCurve: BezierCurve
    params: T
    apply: (mesh: THREE.Mesh, progress: number, defaultMesh: THREE.Mesh) => void
}

export class Effect<T> implements EffectItem<T> {
    constructor(
        public id: string,
        public type: string,
        public start: number,
        public end: number,
        public params: T,
        public bezierCurve: BezierCurve = [0, 0, 1, 1],
        public apply: (
            mesh: THREE.Mesh,
            progress: number,
            defaultMesh: THREE.Mesh,
        ) => void,
    ) {}
}

export class EffectGroup implements EffectItem<{}> {
    type = 'group'
    params = {}
    apply = () => {}

    constructor(
        public id: string,
        public start: number,
        public end: number,
        public children: (Effect<any> | EffectGroup)[],
        public bezierCurve: BezierCurve = [0, 0, 1, 1],
    ) {}
}

// Custom effect classes
class RotationEffect extends Effect<{ amount: THREE.Vector3 }> {
    constructor(
        id: string,
        start: number,
        end: number,
        amount: THREE.Vector3,
        bezierCurve?: BezierCurve,
    ) {
        super(
            id,
            'rotation',
            start,
            end,
            { amount },
            bezierCurve,
            (mesh, progress, defaultMesh) => {
                mesh.rotation.x =
                    defaultMesh.rotation.x + this.params.amount.x * progress
                mesh.rotation.y =
                    defaultMesh.rotation.y + this.params.amount.y * progress
                mesh.rotation.z =
                    defaultMesh.rotation.z + this.params.amount.z * progress
            },
        )
    }
}

class ScaleEffect extends Effect<{ scale: THREE.Vector3 }> {
    constructor(
        id: string,
        start: number,
        end: number,
        scale: THREE.Vector3,
        bezierCurve?: BezierCurve,
    ) {
        super(
            id,
            'scale',
            start,
            end,
            { scale },
            bezierCurve,
            (mesh, progress, defaultMesh) => {
                mesh.scale.x =
                    defaultMesh.scale.x +
                    (this.params.scale.x - defaultMesh.scale.x) * progress
                mesh.scale.y =
                    defaultMesh.scale.y +
                    (this.params.scale.y - defaultMesh.scale.y) * progress
                mesh.scale.z =
                    defaultMesh.scale.z +
                    (this.params.scale.z - defaultMesh.scale.z) * progress
            },
        )
    }
}

type VideoEditor = {
    effects: (Effect<any> | EffectGroup)[]
    duration: number
    resolution: {
        width: number
        height: number
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

    private applyEffects(
        effects: (Effect<any> | EffectGroup)[],
        parentOffset: number,
    ) {
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

                if (effect instanceof EffectGroup) {
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
        if (!effect || effect instanceof EffectGroup) return false

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

    private findEffect(
        id: string,
        effects: (Effect<any> | EffectGroup)[],
    ): Effect<any> | EffectGroup | null {
        for (const effect of effects) {
            if (effect.id === id) return effect
            if (effect instanceof EffectGroup) {
                const found = this.findEffect(id, effect.children)
                if (found) return found
            }
        }
        return null
    }

    private removeEffectRecursive(
        id: string,
        effects: (Effect<any> | EffectGroup)[],
    ): boolean {
        for (let i = 0; i < effects.length; i++) {
            if (effects[i].id === id) {
                effects.splice(i, 1)
                return true
            }
            let eff = effects[i]
            if (eff instanceof EffectGroup) {
                if (this.removeEffectRecursive(id, eff.children || [])) {
                    return true
                }
            }
        }
        return false
    }
}

const videoEditor: VideoEditor = {
    effects: [
        new RotationEffect(
            '1',
            0,
            5,
            new THREE.Vector3(Math.PI * 2, 0, 0),
            [0.25, 0.1, 0.25, 1],
        ),
        new EffectGroup(
            'group1',
            5,
            10,
            [
                new ScaleEffect(
                    '2',
                    0,
                    2,
                    new THREE.Vector3(2, 2, 2),
                    [0, 0, 1, 1],
                ),
                new RotationEffect(
                    '3',
                    2,
                    5,
                    new THREE.Vector3(0, Math.PI * 2, 0),
                    [0.25, 0.1, 0.25, 1],
                ),
            ],
            [0.4, 0, 0.6, 1],
        ),
    ],
    duration: 10,
    resolution: { width: 1920, height: 1080 },
}
