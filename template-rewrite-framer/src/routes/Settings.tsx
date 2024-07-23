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
        Component() {
            const [isLoading, setIsLoading] = useState(false)
            useRefreshOnVisible({ enabled: !isLoading })
            const { session, buyMoreCreditsUrl } =
                useLoaderData() as LoaderReturnType<typeof loader>
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
