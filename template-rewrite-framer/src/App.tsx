import useMeasure from 'react-use-measure'
import NProgress from 'nprogress'

import { framer } from 'framer-plugin'
import { useEffect, useLayoutEffect } from 'react'

import { supabase } from '@/lib/supabase-framer'
import { Paths, RouteIds, pluginApiClient, withMode } from '@/lib/utils'
import { LoginPage } from '@/routes/Login'
import { AlreadyHaveWebsite } from '@/routes/AlreadyHaveWebsite'
import { GetWebsiteInfo } from '@/routes/GetWebsiteInfo'
import { SimplePrompt } from '@/routes/Prompt'
import { IsWebsitePublished } from '@/routes/PublishWebsite'
import {
    AnimatePresence,
    MotionConfig,
    motion,
    useMotionValue,
    useMotionValueEvent,
} from 'framer-motion'
import {
    Outlet,
    RouterProvider,
    createRoutesFromElements,
    redirect,
    useLoaderData,
    useLocation,
    useMatches,
    useNavigate,
    useNavigation,
    useRevalidator,
    useRouteError,
} from 'react-router'
import { Link, createBrowserRouter } from 'react-router-dom'
import type { RephraseSchema } from 'website/src/lib/elysia.server'
import { Session } from '@supabase/supabase-js'
import { Button } from '@/components/Button'
import { Settings } from '@/routes/Settings'
import { NProgressComponent } from '@/components/nprogress'
import { useIsDocumentVisibile } from '@/lib/hooks'
import { notifyError } from '@/lib/errors'

const router = createBrowserRouter([
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

            useMotionValueEvent(heightMotionValue, 'change', () => {
                // console.log('height changed', heightMotionValue.get())
                framer.showUI({
                    title: (handle?.handle as any) || '',
                    position: 'top left',
                    width,
                    height: heightMotionValue.get() || 100,
                })
            })

            useLayoutEffect(() => {
                console.log('mounted app, opening framer ui')
                framer.showUI({
                    title: (handle?.handle as any) || '',
                    position: 'top left',
                    width,
                    height: height || 100,
                })
            }, [])
            // useEffect(() => {
            //     console.log({ height })
            // }, [height])

            const location = useLocation()
            const showSettings = session && location.pathname !== Paths.settings
            const revalidator = useRevalidator()

            return (
                <MotionConfig
                    transition={{ duration: 0.2, type: 'spring', bounce: 0 }}
                >
                    <AnimatePresence>
                        <motion.div
                            key={'content'}
                            layoutId='content'
                            initial={{ opacity: 0 }}
                            style={{ height: heightMotionValue }}
                            animate={{
                                height: height,
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{ opacity: 0, scale: 0.93 }}
                            // transition={{ duration: 0.5 }}
                            className='overflow-hidden '
                        >
                            <div
                                ref={ref}
                                className='shrink-0 grow  flex-col p-4 pt-[2px] w-full justify-start '
                            >
                                <NProgressComponent />
                                <Outlet />

                                {showSettings && (
                                    <div className='flex text-[11px] items-center pt-3 opacity-50 justify-between '>
                                        <div className='grow'></div>
                                        <Link to={withMode(Paths.settings)}>
                                            <Button className='w-auto bg-transparent !py-px text-[11px] '>
                                                settings
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
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
                        {error?.message}
                    </div>
                    <button
                        className='w-auto'
                        type='button'
                        onClick={() => {
                            window.location.pathname = '/'
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
                    return redirect(withMode(Paths.doYouAlreadyHaveAWebsite))
                    // setTimeout(() => refreshHeight(), 1)
                },
                handle: '',
            },
            LoginPage(),
            Settings(),

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
        ],
    },
])

export default function Page() {
    return <RouterProvider router={router} />
}

export function MaterialSymbolsMagicButton(props) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' {...props}>
            <path
                fill='currentColor'
                d='m10 19l-2.5-5.5L2 11l5.5-2.5L10 3l2.5 5.5L18 11l-5.5 2.5L10 19Zm8 2l-1.25-2.75L14 17l2.75-1.25L18 13l1.25 2.75L22 17l-2.75 1.25L18 21Z'
            ></path>
        </svg>
    )
}
