import { Button } from '@/components/Button'
import { supabase } from '@/lib/supabase-framer'
import {
    LoaderReturnType,
    Paths,
    PluginLoaderData,
    RouteIds,
    pluginApiClient,
    buyMoreCreditsUrl,
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

async function loader({}: LoaderFunctionArgs) {
    const { data: user } = await supabase.auth.getSession()

    const { data, error } = await pluginApiClient.api.v1.getCredits.post({})
    if (error) {
        throw error
    }
    const credits = data
    return { credits }
}

export function Settings(): RouteObject {
    return {
        handle: 'Plugin settings',
        path: Paths.settings,
        loader,
        Component() {
            const [isLoading, setIsLoading] = useState(false)
            const { session } = useRouteLoaderData(
                RouteIds.root,
            ) as PluginLoaderData
            const { credits } = useLoaderData() as LoaderReturnType<
                typeof loader
            >
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
                                    const { error } =
                                        await supabase.auth.signOut()
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
        },
    }
}

function useIsDocumentVisibile() {
    const [isVisible, setIsVisible] = useState(
        document.visibilityState === 'visible',
    )

    useEffect(() => {
        const handleVisibilityChange = () => {
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
