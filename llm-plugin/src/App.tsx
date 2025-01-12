import NProgress from 'nprogress'
import { useLocation } from 'react-router'
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
    getLLMPluginData,
    withMode,
} from '@/lib/utils'
import { LoginPage } from '@/routes/Login'

import { Components } from '@/routes/Rewrite'
import { Settings } from '@/routes/Settings'

import {
    Outlet,
    RouterProvider,
    redirect,
    useLoaderData,
    useRouteError,
} from 'react-router'
import { createBrowserRouter } from 'react-router-dom'
import { basePath, reload } from 'template-rewrite-framer/src/lib/utils'
import { BuyMore } from '@/routes/Buy'

globalThis.framer = framer

async function loader({ request }) {
    const { sessionKey } = await getLLMPluginData()

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
                const { sessionKey } = useLoaderData() as LoaderReturnType<
                    typeof loader
                >
                const location = useLocation()
                let width = location.pathname === Paths.login ? 260 : 320

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

                return (
                    <>
                        <div className='px-3 w-full'>
                            <hr className='loading-bar relative' />
                        </div>
                        <div
                            ref={ref}
                            className='shrink-0 grow pt-3 gap-3 flex-col p-3 w-full justify-start '
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
                    <div className='flex max-w-full flex-col w-full h-full gap-2 items-center '>
                        <div className='px-4 w-full'>
                            <hr className='loading-bar relative' />
                        </div>
                        <span className='dark:text-red-300'>
                            Something went wrong...
                        </span>
                        <button
                            className='w-auto'
                            type='button'
                            onClick={() => {
                                reload()
                            }}
                        >
                            Try again
                        </button>
                        <div className='text-[11px] text-red-400 text-center font-mono mx-4 max-w-full'>
                            {error?.message || String(error)}
                        </div>
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

                BuyMore(),
            ],
        },
    ],
    { basename: basePath },
)

async function rootLoader({ request }) {
    const { sessionKey } = await getLLMPluginData()

    console.log(' session key', sessionKey)

    if (!sessionKey) {
        console.log(`redirecting to login because there is no session`)
        return redirect(withMode(Paths.login))
    }

    // return redirect(withMode(Paths.login))

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
