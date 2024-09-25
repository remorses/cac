import NProgress from 'nprogress'
import useMeasure from 'react-use-measure'

import { framer } from 'framer-plugin'
import { useEffect, useLayoutEffect } from 'react'

import { NProgressComponent } from 'template-rewrite-framer/src/components/nprogress'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'

import {
    LoaderReturnType,
    Paths,
    RouteIds,
    basePath,
    getPluginData,
    reload,
    withMode,
} from 'template-rewrite-framer/src/lib/utils'
import { AlreadyHaveWebsite } from 'template-rewrite-framer/src/routes/AlreadyHaveWebsite'
import { WebsiteInfo } from 'template-rewrite-framer/src/routes/GetWebsiteInfo'
import { LicenseKey } from 'template-rewrite-framer/src/routes/LicenseKey'
import { LoginPage } from 'template-rewrite-framer/src/routes/Login'
import { SimplePrompt } from 'template-rewrite-framer/src/routes/Prompt'
import { ScrapeWebsite } from 'template-rewrite-framer/src/routes/ScrapeWebsite'
import { Settings } from 'template-rewrite-framer/src/routes/Settings'

import { AnimatePresence, MotionConfig } from 'framer-motion'
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
import { createBrowserRouter } from 'react-router-dom'
import { useFocusOnMount } from 'template-rewrite-framer/src/lib/hooks'




globalThis.framer = framer
async function loader({ request }) {

    const { sessionKey } = await getPluginData()

    return { sessionKey }
}
const router = createBrowserRouter(
    [
        {
            path: '/',

            id: RouteIds.root,
            shouldRevalidate: () => {
                return true
            },
            loader,
            Component({}) {
                const [ref, { height }] = useMeasure()
                let width = 260
                const { sessionKey } = useLoaderData() as LoaderReturnType<
                    typeof loader
                >
                const [handle] = useMatches().filter((match) => match?.handle)
                const navigate = useNavigate()

                useFocusOnMount()

                useLayoutEffect(() => {
                    framer.showUI({
                        // title: 'Migrate',
                        position: 'top left',
                        width,
                        height: height || 100,
                    })
                }, [height])

                const location = useLocation()
                const showSettings =
                    sessionKey && location.pathname !== Paths.settings
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
                                <div className='px-4 w-full'>
                                    <hr className='loading-bar relative' />
                                </div>

                                <div
                                    ref={ref}
                                    className='min-h-[320px] flex shrink-0 h-full pt-3 grow justify-stretch flex-col p-4 w-full '
                                >
                                    <NProgressComponent />
                                    <Outlet />
                                </div>
                            </div>
                        </AnimatePresence>
                    </MotionConfig>
                )
            },

            ErrorBoundary,

            children: [
                {
                    path: '/',
                    Component() {
                        return null
                    },
                    async loader({ request }) {
                        const { sessionKey } = await getPluginData()

                        if (!sessionKey) {
                            console.log(
                                `redirecting to login because there is no session`,
                            )
                            return redirect(withMode(Paths.login))
                        }

                        return redirect(
                            withMode(Paths.doYouAlreadyHaveAWebsite),
                        )
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

                WebsiteInfo(),
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

export function ErrorBoundary() {
    const error = useRouteError() as any
    NProgress.done()
    useEffect(() => {
        notifyError(error, 'ErrorBoundary')
    }, [error])
    return (
        <div className='flex flex-col w-full h-full gap-2 items-center justify-center'>
            <span className='dark:text-red-300'>Something went wrong...</span>
            <div className='text-[11px] text-red-400 text-center font-mono mx-4'>
                {error?.message || String(error)}
            </div>
            <button
                className='w-auto'
                type='button'
                onClick={() => {
                    reload()
                }}
            >
                Try again
            </button>
        </div>
    )
}
