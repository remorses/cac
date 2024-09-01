import NProgress from 'nprogress'
import './chrome-emulator'
import 'nprogress/nprogress.css'
import 'tailwindcss/tailwind.css'
import '@/styles/reset.css'
import '@/styles/global.css'
import '@/styles/framer-env.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(<App />)
