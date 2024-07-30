import 'template-rewrite-framer/src/styles/globals.css'
import 'template-rewrite-framer/src/styles/reset.css'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// import 'framer-plugin/framer.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(<App />)
