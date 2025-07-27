import { framer } from 'framer-plugin'
import React from 'react'

void framer.showUI({ position: "top left", width: 280, height: 120 })


export default function App() {
    return (
        <div className="flex items-center justify-center h-screen text-2xl font-medium text-framer-primary">
            Framer MCP
        </div>
    )
}
