import './styles/globals.css'
import { Toaster } from 'react-hot-toast'
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from '@remix-run/react'
import './framer/styles.css'

import { NextUIProvider } from '@nextui-org/react'
import { PageContainer } from './components/Container'

function Providers({ children }) {
    return (
        <div className='h-full grow w-full items-center justify-start flex flex-col bg-[#080807] text-gray-100'>
            <div className='flex w-full flex-col grow max-w-[1200px]'>
                <Toaster />
                <NextUIProvider className='grow w-full flex flex-col '>
                    {children}
                </NextUIProvider>
            </div>
        </div>
    )
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

export default function App() {
    return <Outlet />
}
