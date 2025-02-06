import NProgress from 'nprogress'
import { useEffect } from 'react'
import { useNavigation, useRevalidator } from 'react-router'

export function NProgressComponent() {
    let navigation = useNavigation()

    const revalidator = useRevalidator()
    useEffect(() => {
        NProgress.configure({ showSpinner: false, parent: 'hr.loading-bar' })

        // if it's not idle then it's submitting a form and loading the next location loaders
        if (navigation.state !== 'idle' || revalidator.state !== 'idle') {
            NProgress.start() // so you start it
        } else {
            NProgress?.done?.() // when it's idle again complete it
        }
    }, [navigation.state, revalidator.state])

    useEffect(() => {
        const handleBeforeUnload = () => {
            NProgress.start()
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    return null
}
