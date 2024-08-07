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
            try {
                const { error, data: stream } =
                    await pluginApiClient.api.plugins.rewritePlugin.scrapeWebsite.post(
                        {
                            domain,
                        },
                        { fetch: { signal: abortController.signal } },
                    )
                if (error) {
                    throw error
                }

                globalState.exampleTextToMigrate.length = 0
                for await (let chunk of stream) {
                    if (abortController.signal.aborted) {
                        break
                    }
                    console.log('chunk', chunk)
                    if (chunk.object) {
                        globalState.exampleTextToMigrate.push(chunk.object)
                    }

                    if (chunk.extractedDescription) {
                        globalState.extractedDescription =
                            chunk.extractedDescription
                    }

                    flushSync(() => {
                        setLogs((logs) => [...logs, chunk.message || ''])
                    })
                    // scroll to bottom
                    const container = containerRef.current
                    if (container && !hasScrolled.current) {
                        container.scrollTop = container.scrollHeight
                    }
                }
                navigate(withMode(Paths.prompt), { replace: true })
            } catch (e) {
                setError(String(e))
                setIsLoading(false)
                setLogs([])
                notifyError(e, 'error scraping website')
            } finally {
                // setIsLoading(false)
                // setLogs([])
            }
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
        <div className='flex flex-col justify-start gap-4'>
            <div
                ref={containerRef}
                onWheel={() => {
                    hasScrolled.current = true
                }}
                className='flex h-[200px] overflow-y-auto overflow-x-hidden flex-col grow rounded justify-start gap-px'
            >
                <div className='grow'></div>
                {logs.map((log, i) => (
                    <pre key={i} className='text-[11px] opacity-60'>
                        {log}
                    </pre>
                ))}
                {error && (
                    <div className=' text-sm flex flex-col gap-2'>
                        <pre className='text-red-300 text-[11px] overflow-hidden'>
                            {error}
                        </pre>
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
            </div>
        </div>
    )
}
