// show toasts on success and failure and manages loading state

import { useState, useEffect, useRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useRevalidator, useNavigation } from 'react-router'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import getCaretCoordinates from 'textarea-caret'

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
    const ref = useRef(null)
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
const safeParse = (str: string | null, fallback: any = []) => {
    if (!str) return fallback
    try {
        return JSON.parse(str)
    } catch (e) {
        console.error('Failed to parse stored data:', e)
        return fallback
    }
}

export function useHistoryNavigation({ value, setValue }) {
    const STORAGE_KEY = 'description-history'

    const [descriptionHistory, setDescriptionHistory] = useState<string[]>(
        () => {
            if (typeof localStorage === 'undefined' || !localStorage) {
                return []
            }
            const saved = localStorage.getItem(STORAGE_KEY)
            return safeParse(saved, [])
        },
    )
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
        if (
            e.target instanceof HTMLTextAreaElement &&
            (e.key === 'ArrowUp' || e.key === 'ArrowDown')
        ) {
            const textarea = e.target

            // Get caret coordinates
            const caretCoords = getCaretCoordinates(
                textarea,
                textarea.selectionStart,
            )

            // Get line height in pixels
            const lineHeight =
                parseFloat(getComputedStyle(textarea).lineHeight) ||
                parseFloat(getComputedStyle(textarea).fontSize) * 1.2

            // Calculate visual line (0-based)
            const visualLine = Math.floor(
                (caretCoords.top + textarea.scrollTop) / lineHeight,
            )

            if (e.key === 'ArrowUp') {
                // Only proceed with history navigation if we're on the first visual line
                if (visualLine > 0) {
                    return // Let the default textarea navigation handle this
                }
            } else if (e.key === 'ArrowDown') {
                const totalVisualLines = Math.ceil(
                    caretCoords.height / lineHeight,
                )

                // Only proceed with history navigation if we're on the last visual line
                if (visualLine < totalVisualLines - 1) {
                    console.log(
                        `not going down because ${visualLine} is lower than ${totalVisualLines}`,
                    )
                    return // Let the default textarea navigation handle this
                }
            }
        }

        // Handle history navigation with arrow keys
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

            // Move up in history
            const newPosition = historyPosition - 1
            flushSync(() => {
                setHistoryPosition(newPosition)
                setValue(descriptionHistory[newPosition])
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
                    setValue(descriptionHistory[newPosition] || '')
                })
            }
        }
    }

    const onSubmit = () => {
        if (!value.trim()) {
            return
        }

        setDescriptionHistory((prev) => {
            // Replace empty last entry, otherwise append
            const newArr = [...prev]
            if (newArr.length && !newArr[newArr.length - 1]) {
                newArr[newArr.length - 1] = value
            } else {
                newArr.push(value)
            }
            const deduped = deduplicate(newArr)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped))
            setHistoryPosition(deduped.length - 1)
            return deduped
        })
    }

    return {
        onKeyDown,
        onSubmit,
        setHistoryPosition,
    }
}
