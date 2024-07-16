import React from 'react'
import toast from 'react-hot-toast'

export function useThrowingFn({ fn: fnToWrap }) {
    const [isLoading, setIsLoading] = React.useState(false)
    const fn = async function wrappedThrowingFn(...args) {
        try {
            setIsLoading(true)
            const result = await fnToWrap(...args)

            return result
        } catch (err) {
            console.error(err)
            // how to handle unreadable errors? simply don't return them from APIs, just return something went wrong
            if (err instanceof Error && !err?.['skipToast']) {
                toast.error(err.message, {})
                return err
            }
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
