import { framer } from 'framer-plugin'
import { websocketClientHandling } from './lib/client-websocket'
import { McpToolNames } from './lib/types'

void framer.showUI({ position: 'top left', width: 280, height: 120 })

const websocketId =
    globalThis.websocketId || Math.random().toString(36).substring(2, 18)

globalThis.websocketId = websocketId

const cleanup = await websocketClientHandling({
    handle({ input, type }) {
        switch (type) {
            case McpToolNames.ApplyColorStyle: {
                break
            }
        }
    },
    websocketId,
})

import.meta.hot?.accept(() => {
    import.meta.hot?.invalidate()
})
import.meta.hot?.dispose(() => {
    cleanup?.()
})

export default function App() {
    return (
        <div className='flex items-center justify-center h-screen text-2xl font-medium text-framer-primary'>
            Framer MCP
        </div>
    )
}
