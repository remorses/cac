import { create } from 'zustand'
import {
    Effect,
    createEffectGroup,
    createPositionEffect,
    createRotationEffect,
} from './effects'
import * as THREE from 'three'

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
    // return useEditorState((state) => state.currentTime)
    const [currentTime, setCurrentTime] = useState(
        useEditorState.getState().currentTime,
    )
    const lastUpdateTimeRef = useRef(0)

    useEffect(() => {
        const throttledUpdate = (state: AppState) => {
            const { isPlaying } = state
            if (!isPlaying) {
                setCurrentTime(state.currentTime)
                return
            }
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

const deg = Math.PI / 180
const effects = [
    createRotationEffect({
        id: '1',
        start: 0,
        end: 5,
        amount: new THREE.Vector2(deg * 5, 0),
        // bezierCurve: [0.25, 0.1, 0.25, 1],
    }),
    createPositionEffect({
        id: '2',
        start: 0,
        end: 5,
        position: new THREE.Vector3(0.01, 0, 0),
        // bezierCurve: [0.25, 0.1, 0.25, 1],
    }),
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
            set({ isPlaying })

            if (
                isPlaying &&
                (currentTime >= duration ||
                    Math.abs(currentTime - duration) < 0.01)
            ) {
                set({ currentTime: 0 })
            }
        },
        setEffects: (effects) => set({ effects }),
    }
})

