// show toasts on success and failure and manages loading state

import { useState, useEffect, useRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useRevalidator, useNavigation } from 'react-router'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'

// you can skip showing the toast on failure putting a field skipToast: true in the error
export function useThrowingFn({
    fn: fnToWrap,

    immediate = false,
}) {
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        if (immediate) {
            fn()
        }
    }, [immediate])
    const fn = async function wrappedThrowingFn(...args) {
        try {
            setIsLoading(true)
            const result = await fnToWrap(...args)
            if (result?.skipToast) {
                return result
            }

            return result
        } catch (err) {
            notifyError('useThrowingFn', err)
            // how to handle unreadable errors? simply don't return them from APIs, just return something went wrong

            return err
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        fn,
    }
}

export function useIsDocumentVisibile() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const handleVisibilityChange = () => {
            console.log('visibility changed')
            setIsVisible(document.visibilityState === 'visible')
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            )
        }
    }, [])

    return isVisible
}

export function usePrevious(value) {
    const ref = useRef()
    useEffect(() => {
        ref.current = value
    })
    return ref.current
}

export function useRefreshOnVisible({ enabled = true }) {
    const documentVisible = useIsDocumentVisibile()
    const revalidator = useRevalidator()

    const navigation = useNavigation()
    const previousVisible = usePrevious(documentVisible)
    useEffect(() => {
        if (!enabled) {
            return
        }
        if (navigation.state !== 'idle') {
            return
        }
        if (revalidator.state !== 'idle') {
            return
        }
        if (documentVisible && previousVisible === false) {
            console.log(`document visible again, revalidating`)
            revalidator.revalidate()
        }
    }, [documentVisible, enabled, navigation.state, previousVisible])
}

export function useFocusOnMount() {
    const handleKeyDown = () => {
        window.document.body.classList.add('show-focus')
        window.removeEventListener('keydown', handleKeyDown)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
        window.removeEventListener('keydown', handleKeyDown)
    }
}

export function useLatestFunction(fn) {
    const ref = useRef(fn)

    useEffect(() => {
        ref.current = fn
    }, [fn])

    return useCallback((...args) => {
        return ref.current(...args)
    }, [])
}

export function useHistoryNavigation({ description, setDescription }) {
    const [descriptionHistory, setDescriptionHistory] = useState<string[]>([])
    const [historyPosition, setHistoryPosition] = useState(
        descriptionHistory.length,
    )

    const deduplicate = (arr: string[]) => {
        const seen = new Set()
        return arr.filter((item) => {
            if (seen.has(item)) {
                return false
            }
            seen.add(item)
            return true
        })
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        // Only handle history navigation if not navigating within textarea
        if (e.target instanceof HTMLTextAreaElement) {
            const textarea = e.target
            const lines = textarea.value.split('\n')
            const currentPosition = textarea.selectionStart
            const currentLine =
                textarea.value.substring(0, currentPosition).split('\n')
                    .length - 1

            if (
                (e.key === 'ArrowUp' && currentLine > 0) ||
                (e.key === 'ArrowDown' && currentLine < lines.length - 1)
            ) {
                return
            }
        }

        if (
            e.key === 'ArrowUp' &&
            !e.metaKey &&
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey
        ) {
            e.preventDefault()

            // If we're at the start of history, do nothing
            if (historyPosition <= 0) return

            // if (
            //     description.trim() &&
            //     !descriptionHistory.includes(description)
            // ) {
            //     // Add current description to history
            //     flushSync(() => {
            //         setDescriptionHistory((prev) =>
            //             deduplicate([...prev, description]),
            //         )
            //         setHistoryPosition((prev) => prev + 1)
            //     })
            // }

            // Move up in history
            const newPosition = historyPosition - 1
            flushSync(() => {
                setHistoryPosition(newPosition)
                setDescription(descriptionHistory[newPosition])
            })
        } else if (
            e.key === 'ArrowDown' &&
            !e.metaKey &&
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey
        ) {
            e.preventDefault()

            // If we're not at the end of history
            if (historyPosition < descriptionHistory.length) {
                const newPosition = historyPosition + 1
                flushSync(() => {
                    setHistoryPosition(newPosition)
                    setDescription(descriptionHistory[newPosition] || '')
                })
            }
        }
    }

    const onSubmit = () => {
        if (!description.trim()) {
            return
        }

        setDescriptionHistory((prev) => {
            // Replace empty last entry, otherwise append
            const newArr = [...prev]
            if (newArr.length && !newArr[newArr.length - 1]) {
                newArr[newArr.length - 1] = description
            } else {
                newArr.push(description)
            }
            setHistoryPosition(newArr.length)
            return deduplicate(newArr)
        })
    }

    return {
        onKeyDown,
        onSubmit,
        setHistoryPosition,
    }
}
