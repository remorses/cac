import { Button } from '@/components/Button'
import { supabase } from '@/lib/supabase-framer'
import {
    LoaderReturnType,
    Paths,
    PluginLoaderData,
    RouteIds,
    createBuyLink,
    pluginApiClient,
    withMode,
} from '@/lib/utils'
import { framer } from 'framer-plugin'
import { useEffect, useState } from 'react'
import {
    LoaderFunctionArgs,
    Route,
    RouteObject,
    useLoaderData,
    useNavigate,
    useRouteLoaderData,
} from 'react-router'
import { Link } from 'react-router-dom'
import {
    framerLoginUrl,
    generateSecurePassword,
    sleep,
} from 'website/src/lib/utils'

import {} from 'react-router'
import { useRefreshOnVisible } from '@/lib/hooks'
import classNames from 'classnames'
import { motion } from 'framer-motion'

async function loader({}: LoaderFunctionArgs) {
    const [session, credits] = await Promise.all([
        supabase.auth.getSession().then(({ data }) => data.session),
        pluginApiClient.api.v1.getCredits.post({}).then(({ data, error }) => {
            if (error) {
                throw error
            }
            return data
        }),
    ])
    let buyMoreCreditsUrl = createBuyLink({
        email: session?.user?.email,
        orgId: session?.user?.id,
    })
    return { credits, session, buyMoreCreditsUrl }
}

export function Settings(): RouteObject {
    return {
        handle: 'Plugin settings',
        path: Paths.settings,
        loader,
        Component,
    }
}

function Component() {
    const [isLoading, setIsLoading] = useState(false)
    useRefreshOnVisible({ enabled: !isLoading })
    const { session, buyMoreCreditsUrl } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    const { credits } = useLoaderData() as LoaderReturnType<typeof loader>
    // const isDocumentVisible = useIsDocumentVisibile()
    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-4'>
            <div className='flex items-center'>
                <div className=''>
                    Currently logged in as{' '}
                    <span className='font-semibold inline'>
                        {session?.user?.email}
                    </span>
                </div>
                <div className='grow'></div>
                <Button
                    onClick={async () => {
                        // if (isLoading) {
                        //     return
                        // }
                        setIsLoading(true)
                        try {
                            const { error } = await supabase.auth.signOut()
                            if (error) {
                                throw error
                            }
                            window.location.pathname = '/'
                        } finally {
                            // setIsLoading(false)
                        }
                    }}
                    className='w-auto'
                    isLoading={isLoading}
                >
                    Sign Out
                </Button>
            </div>
            <div className='flex items-center'>
                <div className=''>
                    <span className='font-semibold inline'>
                        {credits.remaining}
                        {credits.free ? ' free' : ''}
                    </span>{' '}
                    credits available
                </div>
                <div className='grow'></div>
                <a target='_blank' href={buyMoreCreditsUrl}>
                    <Button className='w-auto'>Buy More Credits</Button>
                </a>
            </div>
            <div className='flex group self-stretch gap-4 flex-row-reverse py-2 items-center'>
                <ProgressBar
                    className='grow'
                    progress={credits.used / credits.total || 0}
                />
                <div className='whitespace-pre'>
                    {credits.used} / {formatLargeNumber(credits.total)}
                </div>
            </div>

            <Button
                onClick={() => {
                    navigate(-1)
                }}
                className=''
            >
                Go Back
            </Button>
        </div>
    )
}

function formatLargeNumber(x: number) {
    if (x < 1000) {
        return x.toFixed(0)
    }
    return (x / 1000).toFixed(0) + 'k'
}

function ProgressBar({ progress, className = '' }) {
    const backgroundColor = (() => {
        if (progress > 0.9) {
            return 'bg-red-400'
        }
        if (progress > 0.6) {
            return 'bg-yellow-400'
        }

        return 'bg-green-500'
    })()
    if (progress < 0.03) {
        progress = 0.03
    }
    // progress= 0.5
    return (
        <div
            // style={{ backgroundColor }}
            className={classNames(
                'relative rounded-md overflow-hidden w-full bg-gray-700 flex h-[8px]',
                className,
            )}
        >
            <motion.div
                // layout
                transition={{ duration: 0.4 }}
                animate={{
                    width: Number(Math.min(progress, 1) * 100).toFixed(1) + '%',
                }}
                className={classNames(
                    'h-full bg-gray-200 rounded overflow-hidden',
                    backgroundColor,
                )}
            ></motion.div>
        </div>
    )
}
