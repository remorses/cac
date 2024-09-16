import { create } from 'zustand'
import {
    EditorKeyframe,
    Effect,
    EffectInit,
    bfs,
    updateEffectInTree,
} from './effects'

interface AppState {
    currentTime: number
    timeGridSize: number
    outputSize: { width: number; height: number }
    isPlaying: boolean
    duration: number
    media?: File | null
    isLooping: boolean
    effects: Effect<any>[]
    setCurrentTime: (time: number) => void
    setIsPlaying: (isPlaying: boolean) => void
    setEffects: (effects: Effect<any>[]) => void
    updateEffect: (id: string, updatedEffect: EffectInit<Effect<any>>) => void
    updateSelectedKeyframes: (keyframe: Partial<EditorKeyframe>) => void
    selectedEffectIds: string[]
    setSelectedEffectIds: (id: string[]) => void
    selectedKeyframeIds: string[]
    setSelectedKeyframeIds: (id: string[], effectIds: string[]) => void
    timeScale: number
}

import { useEffect, useRef, useState } from 'react'
import { threeCanvas } from './App'
export function getKeyframeOnCurrentTime() {
    const state = useEditorState.getState()
    const allEffects = bfs(state.effects)
    const keyframeThreshold = 0.08 // TODO use fps to determine threshold

    return allEffects.flatMap((effect) => {
        return effect.node.keyframes
            .filter(
                (kf) =>
                    Math.abs(kf.time - state.currentTime) < keyframeThreshold,
            )
            .map((keyframe) => {
                return {
                    keyframe: keyframe,
                    effect: effect.node,
                }
            })
    })
}

function selectKeyframesOnCurrentTime() {
    const state = useEditorState.getState()
    const selectedKeyframes = getKeyframeOnCurrentTime()
    const newSelectedKeyframeIds = selectedKeyframes.map((kf) => kf.keyframe.id)
    const newSelectedEffectIds = [
        ...new Set(selectedKeyframes.map((kf) => kf.effect.id)),
    ]

    // if you scrub to a time location while in pause, select any keyframes if none are selected
    if (
        !state.isPlaying &&
        // newSelectedKeyframeIds.length > 0 &&
        JSON.stringify(newSelectedKeyframeIds) !==
            JSON.stringify(state.selectedKeyframeIds)
    ) {
        state.setSelectedKeyframeIds(
            newSelectedKeyframeIds,
            newSelectedEffectIds,
        )
    }
}

export function snapToTimeGrid(time: number) {
    const timeGridSize = useEditorState.getState().timeGridSize
    return Math.round(time / timeGridSize) * timeGridSize
}

export const useCurrentTime = () => {
    const [currentTime, setCurrentTime] = useState(
        snapToTimeGrid(useEditorState.getState().currentTime),
    )
    const lastUpdateTimeRef = useRef(0)

    useEffect(() => {
        const throttledUpdate = (state: AppState, prevState: AppState) => {
            const { isPlaying } = state
            if (!isPlaying) {
                setCurrentTime(snapToTimeGrid(state.currentTime))
                return
            }
            const now = Date.now()

            if (now - lastUpdateTimeRef.current >= 30) {
                setCurrentTime(snapToTimeGrid(state.currentTime))
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
        timeGridSize: (1 / 30) * 3,
        outputSize: { width: 1920, height: 1080 },
        timeScale: 1,
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
        updateSelectedKeyframes: (keyframe: Partial<EditorKeyframe>) => {
            const { effects, selectedEffectIds, selectedKeyframeIds } = get()

            const updatedEffects = effects.map((effect) => {
                if (selectedEffectIds.includes(effect.id)) {
                    const updatedKeyframes = effect.keyframes.map((kf) => {
                        if (selectedKeyframeIds.includes(kf.id)) {
                            return { ...kf, ...keyframe }
                        }
                        return kf
                    })
                    return { ...effect, keyframes: updatedKeyframes }
                }
                return effect
            })

            set({ effects: updatedEffects })
        },

        updateEffect: (id: string, updatedEffect) => {
            set((state) => {
                let newEffects = updateEffectInTree(
                    state.effects,
                    updatedEffect,
                )
                return { effects: newEffects }
            })
        },
        setCurrentTime: (time) => {
            // time = snapToTimeGrid(time)
            const { duration, isLooping, setIsPlaying } = get()
            if (isLooping) {
                // If looping, wrap the time around to the beginning
                set({ currentTime: time % duration })
            } else if (time >= duration) {
                // If not looping and time exceeds duration, pause and set to end
                set({ currentTime: duration })
                setIsPlaying(false)
            } else {
                // Otherwise, update the time normally
                set({ currentTime: time })
            }
            selectKeyframesOnCurrentTime()
            threeCanvas.applyAllEffects({ isUserChange: false })
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
            if (!isPlaying) {
                selectKeyframesOnCurrentTime()
            }
        },
        setEffects: (effects) => set({ effects }),
    }
})
