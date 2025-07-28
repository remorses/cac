import { useEffect } from 'react'

export function useRefreshOnVisible({ enabled }: { enabled: boolean }) {
    useEffect(() => {
        if (!enabled) return

        function handleVisibilityChange() {
            if (document.visibilityState === 'visible') {
                window.location.reload()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [enabled])
}