import 'plugin-mcp/src/styles/globals.css'
import 'plugin-mcp/src/styles/reset.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(<App />)
