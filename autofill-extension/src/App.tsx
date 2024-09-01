import NProgress from 'nprogress'

import useMeasure from 'react-use-measure'

import { useEffect } from 'react'

import { notifyError } from '@/lib/errors'

import {
    LoaderReturnType,
    Paths,
    RouteIds,
    basePath,
    getExtensionData,
} from '@/lib/utils'
import { LoginPage } from '@/routes/Login'

import { Button } from '@/components/Button'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import {
    Outlet,
    RouterProvider,
    createMemoryRouter,
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

async function loader({ request }) {
    const { sessionKey } = await getExtensionData()

    return { sessionKey }
}
const router = createMemoryRouter(
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
                const [handle] = useMatches().filter((match) => match?.handle)
                const navigate = useNavigate()

                const location = useLocation()
                const showSettings =
                    sessionKey && location.pathname !== Paths.settings
                const revalidator = useRevalidator()

                const navigationType = useNavigationType()
                const canGoBack = ![Paths.login, '/'].includes(
                    location.pathname as any,
                )
                return (
                    <MotionConfig
                        transition={{
                            duration: 0.2,
                            type: 'spring',
                            bounce: 0,
                        }}
                    >
                        <AnimatePresence mode='wait'>
                            <div className=' '>
                                <div
                                    ref={ref}
                                    className='shrink-0 grow flex-col p-4 w-full justify-start '
                                >
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
                                            <Link to={Paths.settings}>
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
                            {error?.message || JSON.stringify(error)}
                            {error?.stack}
                        </div>
                        <button
                            className='w-auto'
                            type='button'
                            onClick={() => {
                                window.location.pathname =
                                    window.location.pathname
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
            ],
        },
    ],
    { basename: basePath },
)

async function rootLoader({ request }) {
    const { sessionKey } = await getExtensionData()

    console.log(' session key', sessionKey)

    if (!sessionKey) {
        console.log(`redirecting to login because there is no session`)
        return redirect(Paths.login)
    }

    return redirect(Paths.login)
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
