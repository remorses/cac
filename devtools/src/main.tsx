import './globals.css'
import 'tailwindcss/tailwind.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Editor } from './Editor/index'

const root = document.getElementById('root')
if (!root) {
    throw new Error('Root element not found')
}

function App() {
    return <Editor user={{ isPro: true }} />
}

ReactDOM.createRoot(root).render(<App />)
