import { createPatch, diffChars, diffLines } from 'diff'
import { create } from 'zustand'
import * as indexDb from 'idb-keyval'

import { bfs, EditorKeyframe, Effect, updateEffectInTree } from './effects'

export interface EditorState {
    isExporting: boolean
    projectId: string
    currentTime: number
    timeGridTick: number
    outputSize: { width: number; height: number }
    isPlaying: boolean
    duration: number
    start: number
    mediaHandleId?: string
    isLooping: boolean
    effects: Effect[]
    selectedEffectIds: string[]
    selectedKeyframeIds: string[]
    visibleTimelineSeconds: number
    // timelineDuration: number
    setMediaHandleId: (mediaHandleId: string) => void
    setCurrentTime: (time: number) => void
    setIsPlaying: (isPlaying: boolean) => void
    setEffects: (effects: Effect[]) => void
    updateEffect: (id: string, updatedEffect: Partial<Effect>) => void
    updateSelectedKeyframes: (keyframe: Partial<EditorKeyframe>) => void
    setSelectedEffectIds: (id: string[]) => void
    setSelectedKeyframeIds: (id: string[], effectIds: string[]) => void
    undo: () => void
    redo: () => void
    canUndo: () => boolean
    canRedo: () => boolean
    internalUpdate(): void
}

import { useEffect, useRef, useState } from 'react'
import { threeCanvas } from './canvas'
import { deserializeParams, serializeParams } from './canvas'
import { undoRedo } from './undoredo'
import { debounce, projectStateKey } from './utils'
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
    const timeGridSize = useEditorState.getState().timeGridTick
    return Math.round(time / timeGridSize) * timeGridSize
}

export const useThrottledCurrentTime = () => {
    const [currentTime, setCurrentTime] = useState(
        snapToTimeGrid(useEditorState.getState().currentTime),
    )
    const lastUpdateTimeRef = useRef(0)

    useEffect(() => {
        const throttledUpdate = (
            state: EditorState,
            prevState: EditorState,
        ) => {
            const { isPlaying } = state
            if (!isPlaying) {
                setCurrentTime(snapToTimeGrid(state.currentTime))
                return
            }
            setCurrentTime(snapToTimeGrid(state.currentTime))
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
export const useEditorState = create<EditorState>()((
    setWithoutUndo,
    get,
    store,
) => {
    const {
        setWithUndo: set,
        canRedo,
        canUndo,
        redo,
        undo,
    } = undoRedo({
        store,
        debounce: 200,
        // onStateChange(state, prevState) {
        //     if (import.meta.env.DEV) {
        //         const prevSerialized = serializeParams(prevState)

        //         const currentSerialized = serializeParams(state)
        //         // const diffed = diffLines(prevSerialized, currentSerialized)
        //         const patch = createPatch(
        //             '',
        //             prevSerialized,
        //             currentSerialized,
        //             '',
        //             '',
        //         )

        //         // const linesDiff = diffChars(prevSerialized, currentSerialized)

        //         console.log('state changed:', patch)
        //     }
        // },
        mapState(state, prevState) {
            const prevSerialized = serializeParams(prevState)
            const currentSerialized = serializeParams(state)
            if (prevSerialized === currentSerialized) {
                console.log('no change, ignoring state update')
                return null
            }
            // console.log(currentSerialized)
            return deserializeParams(currentSerialized)
        },
    })

    store.subscribe(
        debounce(async (state) => {
            const temp = serializeParams(state)
            const projectId = state.projectId
            // console.log('saving editor state to db', temp)
            await indexDb.set(projectStateKey({ projectId }), temp)
        }, 200),
    )

    return {
        projectId: '',
        canRedo,
        canUndo,
        redo,
        undo,
        isExporting: false,
        internalUpdate() {
            set({ currentTime: get().currentTime })
        },
        setMediaHandleId(id) {
            set({ mediaHandleId: id })
        },
        currentTime: 0,
        timelineDuration: 100,
        timeGridTick: (1 / 30) * 3,
        outputSize: { width: 1920, height: 1080 },
        visibleTimelineSeconds: 10,
        isLooping: true,
        isPlaying: false,
        effects: [],
        duration: 10,
        start: 0,

        selectedEffectIds: [],
        setSelectedEffectIds: (id: string[]) => {
            setWithoutUndo({ selectedEffectIds: id })
        },
        setSelectedKeyframeIds: (ids: string[], effectIds: string[]) => {
            setWithoutUndo({
                selectedKeyframeIds: ids,
                selectedEffectIds: effectIds,
            })
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
            const { duration, isPlaying, start, isLooping, setIsPlaying } =
                get()
            if (isPlaying && time < start) {
                setWithoutUndo({ currentTime: start })
            } else if (isPlaying && isLooping) {
                // If looping, wrap the time around to the beginning
                setWithoutUndo({
                    currentTime: start + ((time - start) % (duration - start)),
                })
            } else if (isPlaying && time >= duration) {
                // If not looping and time exceeds duration, pause and set to end
                setWithoutUndo({ currentTime: duration })
                setIsPlaying(false)
            } else {
                // Otherwise, update the time normally
                setWithoutUndo({ currentTime: time })
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
                setWithoutUndo({ currentTime: 0 })
            }
            if (!isPlaying) {
                selectKeyframesOnCurrentTime()
            }
        },
        setEffects: (effects) => set({ effects }),
    }
})

export const useUndoRedo = () => {
    useEffect(() => {
        const state = useEditorState.getState()
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey) {
                if (event.key === 'z') {
                    event.preventDefault()
                    if (event.shiftKey) {
                        state.redo()
                    } else {
                        state.undo()
                    }
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])
}
