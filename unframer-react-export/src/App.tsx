import NProgress from 'nprogress'
import { Button } from 'template-rewrite-framer/src/components/Button'
import { NProgressComponent } from 'template-rewrite-framer/src/components/nprogress'
import { useFocusOnMount } from 'template-rewrite-framer/src/lib/hooks'

import useMeasure from 'react-use-measure'

import { framer } from 'framer-plugin'
import { useEffect, useLayoutEffect } from 'react'

import { notifyError } from '@/lib/errors'

import {
    LoaderReturnType,
    Paths,
    RouteIds,
    getReactPluginData,
    withMode,
} from '@/lib/utils'
import { LoginPage } from '@/routes/Login'

import { Settings } from '@/routes/Settings'
import { Components } from '@/routes/Components'

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
import { Link, createBrowserRouter } from 'react-router-dom'
import { basePath, reload } from 'template-rewrite-framer/src/lib/utils'
import { Readme } from '@/routes/Readme'

globalThis.framer = framer

async function loader({ request }) {
    const { sessionKey } = await getReactPluginData()

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
                let width = 320
                const { sessionKey } = useLoaderData() as LoaderReturnType<
                    typeof loader
                >
                const [handle] = useMatches().filter((match) => match?.handle)
                const navigate = useNavigate()

                useFocusOnMount()

                useLayoutEffect(() => {
                    console.log('opening framer ui')
                    framer.showUI({
                        // title: (handle?.handle as any) || '',
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
                const canGoBack = ![Paths.login, '/'].includes(
                    location.pathname as any,
                )
                return (
                    <>
                        <div className='px-4 w-full'>
                            <hr className='loading-bar relative' />
                        </div>
                        <div
                            ref={ref}
                            className='shrink-0 grow pt-4 gap-3 flex-col p-4 w-full justify-start '
                        >
                            <NProgressComponent />

                            <Outlet />
                        </div>
                    </>
                )
            },

            ErrorBoundary() {
                const error = useRouteError() as any

                useEffect(() => {
                    notifyError(error, 'ErrorBoundary')
                    NProgress.done()
                }, [error])
                return (
                    <div className='flex max-w-full flex-col w-full h-full gap-2 items-center justify-center'>
                        <span className='dark:text-red-300'>
                            Something went wrong...
                        </span>
                        <div className='text-[11px] text-red-400 text-center font-mono mx-4 max-w-full'>
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
            },

            children: [
                {
                    path: '/',
                    Component() {
                        return null
                    },
                    loader: rootLoader,
                    handle: '',
                },
                LoginPage(),

                Components(),
                Settings(),
                Readme(),
            ],
        },
    ],
    { basename: basePath },
)

async function rootLoader({ request }) {
    const { sessionKey } = await getReactPluginData()

    console.log(' session key', sessionKey)

    if (!sessionKey) {
        console.log(`redirecting to login because there is no session`)
        return redirect(withMode(Paths.login))
    }

    const { owner, githubAccountLogin, repo } = await getReactPluginData()

    let canRedirect = owner && repo && githubAccountLogin

    return redirect(withMode(Paths.components))
}

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
