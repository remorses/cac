import { create } from 'zustand'
import { Effect, createEffectGroup, createEffect } from './effects'
import * as THREE from 'three'
import { deg } from './canvas'

interface AppState {
    currentTime: number
    outputSize: { width: number; height: number }
    isPlaying: boolean
    duration: number
    media?: File | null
    isLooping: boolean
    effects: Effect<any>[]
    setCurrentTime: (time: number) => void
    setIsPlaying: (isPlaying: boolean) => void
    setEffects: (effects: Effect<any>[]) => void
    selectedEffectIds: string[]
    setSelectedEffectIds: (id: string[]) => void
    scale: number
}

import { useEffect, useState, useRef } from 'react'

export const useCurrentTime = () => {
    const [currentTime, setCurrentTime] = useState(
        useEditorState.getState().currentTime,
    )
    const lastUpdateTimeRef = useRef(0)

    useEffect(() => {
        const throttledUpdate = (state: AppState) => {
            const now = Date.now()
            if (now - lastUpdateTimeRef.current >= 30) {
                setCurrentTime(state.currentTime)
                lastUpdateTimeRef.current = now
            }
        }

        const unsubscribe = useEditorState.subscribe(throttledUpdate)

        return () => {
            unsubscribe()
        }
    }, [])

    return currentTime
}

const effects = [
    createEffect({
        id: '1',
        type: 'rotation',
        start: 0,
        end: 5,
        params: { amount: new THREE.Vector3(deg * 10, 0, 0) },
        bezierCurve: [0.25, 0.1, 0.25, 1],
    }),
    createEffect({
        id: '2',
        type: 'position',
        start: 0,
        end: 5,
        params: { position: new THREE.Vector3(1, 0, 0) },
        bezierCurve: [0.25, 0.1, 0.25, 1],
    }),
    // createEffectGroup({
    //     id: 'group1',
    //     start: 5,
    //     end: 10,
    //     children: [
    //         createEffect({
    //             id: '2',
    //             type: 'scale',
    //             start: 5,
    //             end: 7,
    //             params: { scale: new THREE.Vector3(2, 2, 2) },
    //             bezierCurve: [0, 0, 1, 1],
    //         }),
    //         createEffect({
    //             id: '3',
    //             type: 'rotation',
    //             start: 7,
    //             end: 10,
    //             params: { amount: new THREE.Vector3(0, Math.PI * 2, 0) },
    //             bezierCurve: [0.25, 0.1, 0.25, 1],
    //         }),
    //     ],
    //     bezierCurve: [0.4, 0, 0.6, 1],
    // }),
]

export const useEditorState = create<AppState>((set, get) => {
    return {
        currentTime: 0,
        outputSize: { width: 1920, height: 1080 },
        scale: 1,
        isLooping: true,
        isPlaying: false,
        effects,
        duration: 10,

        selectedEffectIds: [],
        setSelectedEffectIds: (id: string[]) => {
            set({ selectedEffectIds: id })
        },

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

fetch('/video.mov')
    .then((response) => response.blob())
    .then((blob) => new File([blob], 'video.mov', { type: 'video/quicktime' }))
    .then((file) => {
        if (file) {
            useEditorState.setState({ media: file })
        }
    })
    .catch((error) => {
        console.error('Error fetching video file:', error)
        return null
    })

// Subscribe to duration changes and scale effects accordingly
useEditorState.subscribe((state, prevState) => {
    if (state.duration !== prevState.duration) {
        const scaleFactor = state.duration / prevState.duration

        const scaleEffect = (effect: Effect) => {
            effect.start *= scaleFactor
            effect.end *= scaleFactor
            if (effect.children) {
                effect.children.forEach(scaleEffect)
            }
        }

        const scaledEffects = state.effects.map((effect) => {
            const newEffect = { ...effect }
            scaleEffect(newEffect)
            return newEffect
        })

        useEditorState.setState({ effects: scaledEffects })
    }
})
