import './styles/globals.css'
import { Toaster } from 'react-hot-toast'
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useRouteError,
} from '@remix-run/react'
import './framer/styles.css'

import { NextUIProvider } from '@nextui-org/react'
import { PageContainer } from './components/Container'
import { LoaderFunctionArgs } from '@remix-run/node'
import { getSupabaseSession } from 'website/src/lib/supabase.server'
import { Suspense } from 'react'

function Providers({ children }) {
    return (
        <Suspense>
            <div className='h-full grow w-full items-center justify-start flex flex-col bg-[#080807] text-gray-100'>
                <div className='flex w-full flex-col grow max-w-[1200px]'>
                    <Toaster />
                    <NextUIProvider className='grow w-full flex flex-col '>
                        {children}
                    </NextUIProvider>
                </div>
            </div>
        </Suspense>
    )
}

// refresh token if necessary
export async function loader({ request }: LoaderFunctionArgs) {
    const response = Response.json({})
    const {} = await getSupabaseSession({ request, response })
    return response
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' className='h-full'>
            <head>
                <meta charSet='utf-8' />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1'
                />
                <Meta />
                <Links />
            </head>
            <body className='dark flex flex-col grow min-h-full'>
                <Providers>{children}</Providers>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}

export function ErrorBoundary() {
    const error = useRouteError()
    return (
        <html>
            <head>
                <title>Oops!</title>
                <Meta />
                <Links />
            </head>
            <body className='flex items-center justify-center min-h-[200px] '>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold mb-4'>
                        {isRouteErrorResponse(error)
                            ? `${error.status} ${error.statusText}`
                            : error instanceof Error
                              ? error.message
                              : 'Unknown Error'}
                    </h1>
                    <Scripts />
                </div>
            </body>
        </html>
    )
}

export default function App() {
    return <Outlet />
}
