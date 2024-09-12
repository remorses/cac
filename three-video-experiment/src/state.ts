import { create } from 'zustand'
import { Effect, createEffectGroup, createEffect } from './effects'
import * as THREE from 'three'

interface AppState {
    currentTime: number
    isPlaying: boolean
    duration: number
    media?: File | null
    isLooping: boolean
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

export const useAppStore = create<AppState>((set, get) => {
    return {
        currentTime: 0,
        isLooping: true,
        isPlaying: false,
        effects,
        duration: 10,

        setCurrentTime: (time) => {
            const { duration, isLooping } = get()
            if (isLooping) {
                // If looping, wrap the time around to the beginning
                set({ currentTime: time % duration })
            } else if (time >= duration) {
                // If not looping and time exceeds duration, pause and set to end
                set({ currentTime: duration, isPlaying: false })
            } else {
                // Otherwise, update the time normally
                set({ currentTime: time })
            }
        },
        setIsPlaying: (isPlaying) => {
            const { currentTime, duration } = get()
            if (
                isPlaying &&
                (currentTime >= duration ||
                    Math.abs(currentTime - duration) < 0.01)
            ) {
                set({ currentTime: 0 })
            }
            set({ isPlaying })
        },
        setEffects: (effects) => set({ effects }),
    }
})
