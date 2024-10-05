import './globals.css'
import './slider.css'
import './styles.css'
import './framer-env.css'
import 'tailwindcss/tailwind.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './development'

const root = document.getElementById('root')
if (!root) {
    throw new Error('Root element not found')
}
ReactDOM.createRoot(root).render(<App />)
