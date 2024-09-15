import { create } from 'zustand'
import { Effect, bfs } from './effects'

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
    updateEffect: (id: string, updatedEffect: Partial<Effect<any>>) => void
    selectedEffectIds: string[]
    setSelectedEffectIds: (id: string[]) => void
    selectedKeyframeIds: string[]
    setSelectedKeyframeIds: (id: string[], effectIds: string[]) => void
    scale: number
}

import { useEffect, useRef, useState } from 'react'
function selectKeyframesOnCurrentTime(currentTime) {
    const state = useEditorState.getState()
    const allEffects = bfs(state.effects)
    const allKeyframes = allEffects.flatMap((x) => {
        return x.node.keyframes.map((kf) => ({ ...kf, effectId: x.node.id }))
    })
    const keyframeThreshold = 0.08 // TODO use fps to determine threshold
    const selectedKeyframes = allKeyframes.filter(
        (kf) => Math.abs(kf.time - currentTime) < keyframeThreshold,
    )
    const newSelectedKeyframeIds = selectedKeyframes.map((kf) => kf.id)
    const newSelectedEffectIds = [
        ...new Set(selectedKeyframes.map((kf) => kf.effectId)),
    ]

    // TODO optimize this
    if (
        JSON.stringify(newSelectedKeyframeIds) !==
            JSON.stringify(state.selectedKeyframeIds) &&
        (state.selectedEffectIds.length === 0 ||
            // TODO maybe needs more work
            state.setSelectedEffectIds?.[0] === newSelectedEffectIds[0])
    ) {
        state.setSelectedKeyframeIds(
            newSelectedKeyframeIds,
            newSelectedEffectIds,
        )
    }
}

export const useCurrentTime = () => {
    // return useEditorState((state) => state.currentTime)
    const [currentTime, setCurrentTime] = useState(
        useEditorState.getState().currentTime,
    )
    const lastUpdateTimeRef = useRef(0)

    useEffect(() => {
        const throttledUpdate = (state: AppState, prevState: AppState) => {
            const { isPlaying } = state
            // if (prevState.currentTime - state.currentTime < 0.001) return
            if (!isPlaying) {
                setCurrentTime(state.currentTime)
                selectKeyframesOnCurrentTime(state.currentTime)
                return
            }
            const now = Date.now()

            if (now - lastUpdateTimeRef.current >= 30) {
                setCurrentTime(state.currentTime)
                selectKeyframesOnCurrentTime(state.currentTime)
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

export const useEditorState = create<AppState>((set, get) => {
    return {
        currentTime: 0,
        outputSize: { width: 1920, height: 1080 },
        scale: 1,
        isLooping: true,
        isPlaying: false,
        effects: [],
        duration: 10,

        selectedEffectIds: [],
        setSelectedEffectIds: (id: string[]) => {
            set({ selectedEffectIds: id })
        },
        setSelectedKeyframeIds: (ids: string[], effectIds: string[]) => {
            set({ selectedKeyframeIds: ids, selectedEffectIds: effectIds })
        },
        selectedKeyframeIds: [],

        updateEffect: (id: string, updatedEffect: Partial<Effect<any>>) => {
            set((state) => {
                const effectsTree = bfs(state.effects, (x) => x.node.id === id)
                const updatedEffects = effectsTree.map(({ node }) => {
                    if (node.id === id) {
                        return { ...node, ...updatedEffect }
                    }
                    return node
                })
                return { effects: updatedEffects }
            })
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
