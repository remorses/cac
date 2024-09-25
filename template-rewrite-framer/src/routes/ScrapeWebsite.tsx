import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import NProgress from 'nprogress'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import {
    pluginApiClient,
    withMode,
    Paths,
    globalState,
} from 'template-rewrite-framer/src/lib/utils'
import { useState, useRef, useEffect, Component } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useLocation, RouteObject } from 'react-router'
import { Button } from 'template-rewrite-framer/src/components/Button'

let abortController = new AbortController()

export function ScrapeWebsite(): RouteObject {
    return {
        handle: 'Getting website content...',
        path: Paths.scrapeWebsite,
        // loader,
        Component: ScrapeWebsiteComponent,
    }
}

function ScrapeWebsiteComponent() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    useRefreshOnVisible({ enabled: !isLoading })
    const location = useLocation()

    let [error, setError] = useState('')
    useEffect(() => {
        const domain = new URLSearchParams(location.search).get('domain') || ''
        if (!domain) {
            notifyError(new Error('No domain provided'), 'scrape website')
        }
        if (!domain) {
            return
        }

        if (abortController) {
            abortController.abort()
        }
        abortController = new AbortController()
        setLogs(['getting website html...'])
        setIsLoading(true)

        const fetchData = async () => {
            NProgress.start()
        }

        fetchData()
        // abort when leaving the page
        return () => {
            NProgress.done()
            abortController.abort()
        }
    }, [])
    let hasScrolled = useRef(false)

    return (
        <div className='flex flex-col grow justify-start gap-3'>
            <div
                ref={containerRef}
                onWheel={() => {
                    hasScrolled.current = true
                }}
                className='flex h-[180px] overflow-y-auto overflow-x-hidden flex-col grow rounded justify-start gap-px'
            >
                <div className='grow'></div>
                {logs.map((log, i) => (
                    <div
                        key={i}
                        className='text-[11px] opacity-60 font-mono max-w-full'
                    >
                        {log}
                    </div>
                ))}
            </div>
            {error && (
                <div className=' text-sm flex flex-col gap-2'>
                    <div className='text-red-300 text-[11px] font-mono overflow-hidden'>
                        {error}
                    </div>
                    <button
                        className='w-auto'
                        type='button'
                        onClick={() => {
                            navigate(-1)
                        }}
                    >
                        Try again
                    </button>
                </div>
            )}
            {isLoading && (
                <Button
                    onClick={() => {
                        abortController.abort()
                        navigate(-1)
                    }}
                >
                    Cancel
                </Button>
            )}
        </div>
    )
}
