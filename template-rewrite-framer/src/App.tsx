import NProgress from 'nprogress'
import useMeasure from 'react-use-measure'

import { framer } from 'framer-plugin'
import { useEffect, useLayoutEffect } from 'react'

import { Button } from '@/components/Button'
import { NProgressComponent } from '@/components/nprogress'
import { notifyError } from '@/lib/errors'
import { useFocusOnMount } from '@/lib/hooks'
import { supabase } from '@/lib/supabase-framer'
import { Paths, RouteIds, basePath, withMode } from '@/lib/utils'
import { AlreadyHaveWebsite } from '@/routes/AlreadyHaveWebsite'
import { GetWebsiteInfo } from '@/routes/GetWebsiteInfo'
import { LoginPage } from '@/routes/Login'
import { SimplePrompt } from '@/routes/Prompt'
import { ScrapeWebsite } from '@/routes/ScrapeWebsite'
import { Settings } from '@/routes/Settings'
import { LicenseKey } from '@/routes/LicenseKey'
import { Session } from '@supabase/supabase-js'
import { AnimatePresence, MotionConfig, useMotionValue } from 'framer-motion'
import {
    Outlet,
    RouterProvider,
    redirect,
    useLoaderData,
    useLocation,
    useMatches,
    useNavigate,
    useNavigationType,
    useRevalidator,
    useRouteError,
} from 'react-router'
import { Link, createBrowserRouter } from 'react-router-dom'

globalThis.framer = framer

const router = createBrowserRouter(
    [
        {
            path: '/',

            id: RouteIds.root,
            shouldRevalidate: () => {
                return true
            },
            async loader({ request }) {
                const { data, error } = await supabase.auth.getSession()
                if (error) {
                    notifyError(error, 'Failed to get session')
                }
                const session = data?.session

                return { session }
            },

            Component({}) {
                const [ref, { height }] = useMeasure()
                let width = 480
                const { session } = useLoaderData() as { session: Session }
                const [handle] = useMatches().filter((match) => match?.handle)
                const navigate = useNavigate()

                const heightMotionValue = useMotionValue(height)

                // useMotionValueEvent(heightMotionValue, 'change', () => {
                //     // console.log('height changed', heightMotionValue.get())
                //     framer.showUI({
                //         title: (handle?.handle as any) || '',
                //         position: 'top left',
                //         width,
                //         height: heightMotionValue.get() || 100,
                //     })
                // })
                useFocusOnMount()

                useLayoutEffect(() => {
                    console.log('opening framer ui')
                    framer.showUI({
                        title: (handle?.handle as any) || '',
                        position: 'top left',
                        width,
                        height: height || 100,
                    })
                }, [height])
                // useEffect(() => {
                //     console.log({ height })
                // }, [height])

                const location = useLocation()
                const showSettings =
                    session && location.pathname !== Paths.settings
                const revalidator = useRevalidator()

                const navigationType = useNavigationType()
                const canGoBack = ![
                    Paths.login,
                    '/',
                    Paths.doYouAlreadyHaveAWebsite,
                ].includes(location.pathname as any)
                // const history = useHistory()
                return (
                    <MotionConfig
                        transition={{
                            duration: 0.2,
                            type: 'spring',
                            bounce: 0,
                        }}
                    >
                        <AnimatePresence mode='wait'>
                            <div
                                // key={location.pathname}
                                // layoutId='content'
                                // initial={{ opacity: 0 }}
                                // style={{ height: heightMotionValue }}
                                // style={{ height: height }}
                                // animate={{
                                //     height: height,
                                //     opacity: 1,
                                //     scale: 1,
                                // }}
                                // exit={{ opacity: 0 }}

                                className='overflow-hidden '
                            >
                                <div
                                    ref={ref}
                                    className='shrink-0 grow  flex-col p-4 pt-[2px] w-full justify-start '
                                >
                                    <NProgressComponent />
                                    <Outlet />

                                    {showSettings && (
                                        <div className='flex text-[11px] items-center pt-3 opacity-70 justify-between '>
                                            {canGoBack && (
                                                <button
                                                    type='button'
                                                    onClick={() => {
                                                        navigate(-1)
                                                    }}
                                                    className='w-auto flex flex-row items-center -ml-2 gap-1 bg-transparent !py-px text-[11px] '
                                                >
                                                    <BackIcon className='w-2' />
                                                    <div className=''>back</div>
                                                </button>
                                            )}
                                            <div className='grow'></div>
                                            <Link to={withMode(Paths.settings)}>
                                                <Button className='w-auto bg-transparent !py-px text-[11px] '>
                                                    settings
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </AnimatePresence>
                    </MotionConfig>
                )
            },

            ErrorBoundary() {
                const error = useRouteError() as any
                NProgress.done()
                useEffect(() => {
                    notifyError(error, 'ErrorBoundary')
                }, [error])
                return (
                    <div className='flex flex-col w-full h-full gap-2 items-center justify-center'>
                        <span className='dark:text-red-300'>
                            Something went wrong...
                        </span>
                        <div className='text-[11px] text-red-400 text-center font-mono mx-4'>
                            {error?.message || String(error)}
                        </div>
                        <button
                            className='w-auto'
                            type='button'
                            onClick={() => {
                                window.location.pathname = basePath
                            }}
                        >
                            Try again
                        </button>
                    </div>
                )
            },

            // errorElement: <ErrorPage />,
            children: [
                {
                    path: '/',
                    Component() {
                        return null
                    },
                    async loader({ request }) {
                        // const url = new URL(request.url)
                        // if (url.pathname === '/login') {
                        //     return {}
                        // }
                        const { data, error } = await supabase.auth.getSession()
                        if (error) {
                            notifyError(error, 'Failed to get session')
                        }

                        console.log('supabase session', data)
                        const session = data?.session
                        if (!session) {
                            console.log(
                                `redirecting to login because there is no session`,
                            )
                            return redirect(withMode(Paths.login))
                        }
                        console.log(
                            'redirecting to choose website from / because user is logged in',
                        )
                        // return redirect(withMode(Paths.login))
                        return redirect(
                            withMode(Paths.doYouAlreadyHaveAWebsite),
                        )
                        // setTimeout(() => refreshHeight(), 1)
                    },
                    handle: '',
                },
                LoginPage(),
                Settings(),
                ScrapeWebsite(),

                {
                    path: Paths.doYouAlreadyHaveAWebsite,
                    element: <AlreadyHaveWebsite />,
                    handle: 'Do you already have an existing website?',
                },
                {
                    path: Paths.getWebsiteInfo,
                    element: <GetWebsiteInfo />,
                    handle: 'What is your website url?',
                },
                // {
                //     path: Paths.checkWebsiteIsPublished,
                //     element: <IsWebsitePublished />,
                //     loader: async ({}) => {
                //         const publishInfo = await framer.getPublishInfo()
                //         let deploymentTime = publishInfo?.staging?.deploymentTime
                //         let hourAgo = new Date()
                //         hourAgo.setHours(hourAgo.getHours() - 1)
                //         if (deploymentTime && new Date(deploymentTime) > hourAgo) {
                //             return redirect(Paths.getWebsiteInfo)
                //         }
                //         framer.notify('Publish your website first', {
                //             variant: 'error',
                //         })

                //         return {}
                //     },
                //     handle: 'Publish your website first',
                // },
                SimplePrompt(),
                LicenseKey(),
            ],
        },
    ],
    { basename: basePath },
)

export default function Page() {
    return <RouterProvider router={router} />
}


export function BackIcon(props) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            // width='1em'
            // height='1em'
            viewBox='0 0 24 24'
            {...props}
        >
            <path
                fill='currentColor'
                d='M10 22L0 12L10 2l1.775 1.775L3.55 12l8.225 8.225z'
            ></path>
        </svg>
    )
}
