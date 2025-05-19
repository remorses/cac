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
} from 'react-router';
import './framer/styles.css'

import { HeroUIProvider } from "@heroui/react"
import { PageContainer } from './components/Container'
import { LoaderFunctionArgs } from 'react-router';
import { getSupabaseSession } from 'website/src/lib/supabase.server'
import { Suspense } from 'react'

function Providers({ children }) {
    return (
        <Suspense>
            <div className='h-full grow w-full items-center justify-start flex flex-col bg-[#080807] text-gray-100'>
                <div className='flex w-full flex-col grow max-w-[1200px]'>
                    <Toaster />
                    <HeroUIProvider className='grow w-full flex flex-col '>
                        {children}
                    </HeroUIProvider>
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
function ErrorWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className='min-h-screen flex items-center justify-center p-4'>
            <div className='p-8 max-w-lg text-center w-full'>{children}</div>
        </div>
    )
}

export function ErrorBoundary() {
    const error = useRouteError()

    if (isRouteErrorResponse(error)) {
        return (
            <ErrorWrapper>
                <h1 className='text-4xl font-bold mb-4'>
                    {error.status} {error.statusText}
                </h1>
                <p>{error.data}</p>
            </ErrorWrapper>
        )
    } else if (error instanceof Error) {
        return (
            <ErrorWrapper>
                <h1 className='text-4xl font-bold mb-4'>Error</h1>
                <p className='mb-4'>{error.message}</p>
                <p className='text-sm mb-2'>The stack trace is:</p>
                <pre className='p-4 rounded text-sm font-mono overflow-auto max-h-[400px]'>
                    {error.stack}
                </pre>
            </ErrorWrapper>
        )
    } else {
        return (
            <ErrorWrapper>
                <h1 className='text-4xl font-bold'>Unknown Error</h1>
            </ErrorWrapper>
        )
    }
}

export default function App() {
    return <Outlet />
}
