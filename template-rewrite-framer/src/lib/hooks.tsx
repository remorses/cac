// show toasts on success and failure and manages loading state


import { useState, useEffect, useRef } from 'react'
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
