import { framer } from 'framer-plugin'
import { useEffect, useLayoutEffect, useState } from 'react'
import useMeasure from 'react-use-measure'
import { websocketClientHandling } from './lib/client-websocket'
import { McpToolNames } from './lib/types'
import './lib/framer'
import { useStore } from './lib/store'
import { CopyIcon, CheckIcon, MaximizeIcon, CircleIcon } from 'lucide-react'

globalThis.framer = framer

framer.showUI({
    position: 'top left',
    width: 140,
    height: 44,
})
// Get initial websocketId from store
const { websocketId } = useStore.getState()

// Initialize websocket connection
const cleanup = await websocketClientHandling({
    // @ts-ignore
    handle({ input, type }) {
        switch (type) {
            case 'applyColorStyle': {
                break
            }
        }
    },
    websocketId,
})

export default function App() {
    const isConnected = useStore((state) => state.isConnected)
    const isExpanded = useStore((state) => state.isExpanded)
    const websocketId = useStore((state) => state.websocketId)
    const [copied, setCopied] = useState(false)
    const [ref, { height }] = useMeasure()

    const mcpServerUrl = `https://mcp.unframer.co/mcp?id=${websocketId}`

    const handleCopy = async () => {
        await navigator.clipboard.writeText(mcpServerUrl)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    const toggleExpanded = () => {
        const newExpanded = !isExpanded
        useStore.setState({ isExpanded: newExpanded })
    }

    // Update framer UI size when height changes or expansion state changes
    useLayoutEffect(() => {
        void framer.showUI({
            position: 'top left',
            width: isExpanded ? 340 : 160,
            height: height || 280,
        })
    }, [height, isExpanded])

    if (!isExpanded) {
        return (
            <div className='flex items-center justify-between px-3 py-3 bg-framer-primary'>
                <div className='flex items-center gap-2'>
                    <CircleIcon
                        className={`size-2 fill-current ${isConnected ? 'text-green-500' : 'text-orange-500'}`}
                    />
                    <span className='text-xs truncate font-medium text-framer-primary'>
                        Framer MCP
                    </span>
                </div>
                <button
                    onClick={toggleExpanded}
                    className='w-auto bg-transparent hover:bg-framer-tertiary rounded transition-colors'
                >
                    <MaximizeIcon className='size-3 text-framer-secondary' />
                </button>
            </div>
        )
    }

    return (
        <div
            ref={ref}
            className='flex flex-col gap-4 p-4 pt-0 bg-framer-primary'
        >
            <div className='flex items-center justify-between'>
                <h2 className='text-sm font-medium text-framer-primary'>
                    {/* Framer MCP Installation */}
                </h2>
            </div>
            <div className='flex flex-col gap-2'>
                <p className='text-xs text-framer-secondary'>
                    Copy the MCP server URL below and add it to your MCP client
                    (Claude Desktop, Cline, etc.)
                </p>
            </div>

            <div className='flex flex-col gap-2'>
                <label className='text-xs font-medium text-framer-secondary'>
                    MCP Server URL
                </label>
                <div className='flex gap-2'>
                    <input
                        type='text'
                        value={mcpServerUrl}
                        readOnly
                        className='flex-1 px-3 py-2 text-xs rounded bg-framer-tertiary text-framer-primary border border-framer-divider'
                    />
                    <button
                        onClick={handleCopy}
                        className='w-auto px-3 py-2 hover:bg-framer-tertiary rounded border border-framer-divider transition-colors'
                    >
                        {copied ? (
                            <CheckIcon className='size-3.5 text-green-500' />
                        ) : (
                            <CopyIcon className='size-3.5 text-framer-secondary' />
                        )}
                    </button>
                </div>
            </div>

            <div className='flex flex-col gap-2 mt-auto'>
                <div className='flex items-center gap-2'>
                    <CircleIcon
                        className={`size-2 fill-current ${isConnected ? 'text-green-500' : 'text-orange-500'}`}
                    />
                    <span className='text-xs text-framer-secondary'>
                        {isConnected
                            ? 'Connected to MCP client'
                            : 'Waiting for connection'}
                    </span>
                </div>
                <div className='flex items-center justify-between'>
                    <p className='text-xs text-framer-tertiary'>
                        Keep this plugin open while using MCP
                    </p>
                    <button
                        onClick={toggleExpanded}
                        className='w-auto p-1 bg-transparent hover:bg-framer-tertiary rounded transition-colors'
                    >
                        <MaximizeIcon className='size-3 rotate-180 text-framer-secondary' />
                    </button>
                </div>
            </div>
        </div>
    )
}

import.meta.hot?.accept(() => {
    import.meta.hot?.invalidate()
})
import.meta.hot?.dispose(() => {
    cleanup?.()
})
