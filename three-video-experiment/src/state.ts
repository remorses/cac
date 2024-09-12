import { create } from 'zustand'
import { Effect, EffectGroup } from './effects'
import * as THREE from 'three'
import { RotationEffect, ScaleEffect } from './effects'

interface AppState {
    currentTime: number
    isPlaying: boolean
    duration: number
    media?: File | null
    effects: (Effect<any> | EffectGroup)[]
    setCurrentTime: (time: number) => void
    setIsPlaying: (isPlaying: boolean) => void
    setEffects: (effects: (Effect<any> | EffectGroup)[]) => void
}

const effects = [
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
]

export const useAppStore = create<AppState>((set) => {
    return {
        currentTime: 0,
        isPlaying: false,
        effects,
        duration: 0,

        setCurrentTime: (time) => set({ currentTime: time }),
        setIsPlaying: (isPlaying) => set({ isPlaying }),
        setEffects: (effects) => set({ effects }),
    }
})
