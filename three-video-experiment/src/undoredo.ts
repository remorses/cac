import { StoreApi, UseBoundStore } from 'zustand'
import { debounce } from './utils'

export function undoRedo<T>({
    store,
    debounce: debounceMs = 0,
    mapState = (x) => x,
    onStateChange,
}: {
    store: StoreApi<T> //
    debounce?: number
    mapState?: (state: T, prevState?: T) => any
    onStateChange?: (state: T, prevState: T) => void
}) {
    const userSet = store.setState
    const get = () => store.getState()
    class Zundo {
        pastStates: any[] = []
        futureStates: any[] = []

        undo(steps = 1) {
            if (!this.pastStates.length) {
                console.log('no states to undo')
                return
            }
            // userGet must be called before userSet
            const currentState = get()

            const statesToApply = this.pastStates.splice(-steps, steps)

            // If there is length, we know that statesToApply is not empty
            const nextState = statesToApply.shift()!

            onStateChange?.(nextState, currentState)
            userSet(nextState)
            this.futureStates = this.futureStates.concat(
                currentState,
                statesToApply.reverse(),
            )
        }

        redo(steps = 1) {
            if (this.futureStates.length) {
                const currentState = get()

                const statesToApply = this.futureStates.splice(-steps, steps)

                // If there is length, we know that statesToApply is not empty
                const nextState = statesToApply.shift()!
                onStateChange?.(nextState, currentState)
                userSet(nextState)

                this.pastStates = this.pastStates.concat(
                    nextState,
                    statesToApply.reverse(),
                )
                this.futureStates = this.futureStates
            }
        }
    }

    const undoRedoState = new Zundo()

    let debounceTimeout: number | null = null

    store.setState = (...args) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout)
        }
        let state = store.getState()

        debounceTimeout = setTimeout(() => {
            if (!state) {
                return
            }
            const prevState =
                undoRedoState.pastStates[undoRedoState.pastStates.length - 1]

            onStateChange?.(state, prevState)
            const mapped = mapState(state, prevState)
            if (mapped) {
                undoRedoState.pastStates.push(mapped)
                undoRedoState.futureStates = []
            }

            debounceTimeout = null
        }, debounceMs)
        userSet(...args)
    }
    return {
        undo: () => undoRedoState.undo(),
        redo: () => undoRedoState.redo(),
        canUndo: () => undoRedoState.pastStates.length > 0,
        canRedo: () => undoRedoState.futureStates.length > 0,
        setWithUndo: store.setState as StoreApi<T>['setState'],
    }
}
