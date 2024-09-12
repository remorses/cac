import { create } from 'zustand'
import { Effect, createEffectGroup, createEffect } from './effects'
import * as THREE from 'three'

interface AppState {
    currentTime: number
    isPlaying: boolean
    duration: number
    media?: File | null
    effects: Effect<any>[]
    setCurrentTime: (time: number) => void
    setIsPlaying: (isPlaying: boolean) => void
    setEffects: (effects: Effect<any>[]) => void
}

const effects = [
    createEffect({
        id: '1',
        type: 'rotation',
        start: 0,
        end: 5,
        params: { amount: new THREE.Vector3(Math.PI * 2, 0, 0) },
        bezierCurve: [0.25, 0.1, 0.25, 1],
    }),
    createEffectGroup({
        id: 'group1',
        start: 5,
        end: 10,
        children: [
            createEffect({
                id: '2',
                type: 'scale',
                start: 5,
                end: 7,
                params: { scale: new THREE.Vector3(2, 2, 2) },
                bezierCurve: [0, 0, 1, 1],
            }),
            createEffect({
                id: '3',
                type: 'rotation',
                start: 7,
                end: 10,
                params: { amount: new THREE.Vector3(0, Math.PI * 2, 0) },
                bezierCurve: [0.25, 0.1, 0.25, 1],
            }),
        ],
        bezierCurve: [0.4, 0, 0.6, 1],
    }),
]

export const useAppStore = create<AppState>((set) => {
    return {
        currentTime: 0,
        isPlaying: false,
        effects,
        duration: 10,

        setCurrentTime: (time) => set({ currentTime: time }),
        setIsPlaying: (isPlaying) => set({ isPlaying }),
        setEffects: (effects) => set({ effects }),
    }
})
