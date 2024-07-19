import 'framer-plugin/framer.css'
import '@/styles/globals.css'
import '@/styles/reset.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { NextUIProvider } from '@nextui-org/react'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

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
                <div className='flex w-full flex-col text-center items-center justify-center gap-6 p-4 pt-0'>
                    {children}
                </div>
            </body>
        </html>
    )
}

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
