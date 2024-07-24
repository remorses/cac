import { Button } from '@/components/Button'
import { notifyError } from '@/lib/errors'
import { useRefreshOnVisible } from '@/lib/hooks'
import {
    withMode,
    Paths,
    pluginApiClient,
    exampleTextToMigrate,
} from '@/lib/utils'

import { framer } from 'framer-plugin'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useLocation, useNavigate } from 'react-router'

let abortController: AbortController = new AbortController()

export function GetWebsiteInfo() {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    useRefreshOnVisible({ enabled: !isLoading })
    const location = useLocation()
    useEffect(() => {
        console.log('location changed', location.pathname)
        if (!isLoading) {
            return
        }
        abortController.abort()
    }, [location.pathname])

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault()

                if (abortController) {
                    abortController.abort()
                }
                abortController = new AbortController()
                try {
                    const data = new FormData(e.target as any)
                    const domain = data.get('domain')?.toString() || ''
                    setLogs(['getting website info...'])
                    // navigate(withMode(Paths.scrapeWebsite, { domain }))
                    flushSync(() => setIsLoading(true))

                    const { error, data: stream } =
                        await pluginApiClient.api.v1.scrapeWebsite.post(
                            {
                                domain,
                            },
                            { fetch: { signal: abortController.signal } },
                        )
                    if (error) {
                        throw error
                    }

                    exampleTextToMigrate.length = 0
                    for await (let chunk of stream) {
                        console.log('chunk', chunk)
                        // if (chunk.error) {
                        //     throw new Error(chunk.error)
                        // }
                        if (chunk.object) {
                            exampleTextToMigrate.push(chunk.object)
                        }

                        flushSync(() => {
                            setLogs((logs) => [...logs, chunk.message])
                        })
                        // scroll to bottom
                        const container = containerRef.current
                        if (container) {
                            container.scrollTop = container.scrollHeight
                        }
                    }
                    navigate(withMode(Paths.prompt))
                } catch (e) {
                    notifyError(e, 'error scraping website')
                } finally {
                    setIsLoading(false)
                    setLogs([])
                }
            }}
            className='flex flex-col justify-start gap-4'
        >
            {!isLoading && (
                <div className='flex flex-col justify-start gap-4'>
                    <div className='opacity-70'>
                        The website will be scraped to get the content to apply
                        to this website
                    </div>
                    <input
                        placeholder='example.com'
                        type='text'
                        name='domain'
                        className='rounded-md p-2 w-full bg-framer-tertiary'
                    />
                    <Button
                        isLoading={isLoading}
                        type='submit'
                        className='framer-button-primary'
                    >
                        Get Info
                    </Button>
                </div>
            )}
            {isLoading && (
                <div
                    ref={containerRef}
                    className='flex h-[200px] overflow-y-auto overflow-x-hidden flex-col grow rounded justify-start gap-px'
                >
                    {logs.map((log, i) => (
                        <pre key={i} className='text-[11px] opacity-60'>
                            {log}
                        </pre>
                    ))}
                </div>
            )}
        </form>
    )
}
