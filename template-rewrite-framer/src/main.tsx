import 'framer-plugin/framer.css'
import '@/styles/globals.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { NextUIProvider } from '@nextui-org/react'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

function Providers({ children }) {
    return (
        <div className='dark h-full w-full flex flex-col bg-framer-primary text-framer-primary'>
            <NextUIProvider className='h-full flex flex-col '>
                {children}
            </NextUIProvider>
        </div>
    )
}

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en'>
            <head>
                <meta charSet='utf-8' />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1'
                />
            </head>
            <body>
                <Providers>
                    <div className='flex w-full flex-col text-center items-center justify-center gap-6 p-4 pt-0'>
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    )
}

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <Layout>
            <App />
        </Layout>
    </React.StrictMode>,
)
