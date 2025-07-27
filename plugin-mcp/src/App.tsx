import { framer } from 'framer-plugin'
import { useEffect, useState } from 'react'
import { websocketClientHandling } from './lib/client-websocket'
import { McpToolNames } from './lib/types'
import { useStore } from './lib/store'
import { CopyIcon, CheckIcon, MaximizeIcon, CircleIcon } from 'lucide-react'

const websocketId =
    globalThis.websocketId || Math.random().toString(36).substring(2, 18)

globalThis.websocketId = websocketId
useStore.setState({ websocketId })

const isExpanded = useStore.getState().isExpanded
void framer.showUI({
    position: 'top left',
    width: isExpanded ? 320 : 120,
    height: isExpanded ? 280 : 40,
})

// Subscribe to isExpanded changes
useStore.subscribe((state) => {
    void framer.showUI({
        position: 'top left',
        width: state.isExpanded ? 320 : 120,
        height: state.isExpanded ? 280 : 40,
    })
})

const cleanup = await websocketClientHandling({
    // @ts-ignore
    handle({ input, type }) {
        useStore.setState({ isConnected: true })
        switch (type) {
            case McpToolNames.ApplyColorStyle: {
                break
            }
        }
    },
    websocketId,
})

export default function App() {
    const isConnected = useStore((state) => state.isConnected)
    const isExpanded = useStore((state) => state.isExpanded)
    const [copied, setCopied] = useState(false)

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

    useEffect(() => {
        const interval = setInterval(() => {
            useStore.setState({ isConnected: false })
        }, 10000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    if (!isExpanded) {
        return (
            <div className='flex items-center justify-between h-full px-3'>
                <div className='flex items-center gap-2'>
                    <CircleIcon
                        className={`size-2 fill-current ${isConnected ? 'text-green-500' : 'text-orange-500'}`}
                    />
                    <span className='text-xs font-medium'>MCP</span>
                </div>
                <button
                    onClick={toggleExpanded}
                    className='p-1 hover:bg-gray-100 rounded'
                >
                    <MaximizeIcon className='size-3' />
                </button>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-4 p-4 h-full'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <h1 className='text-lg font-semibold'>Framer MCP</h1>
                    <CircleIcon
                        className={`size-2 fill-current ${isConnected ? 'text-green-500' : 'text-orange-500'}`}
                    />
                </div>
                <button
                    onClick={toggleExpanded}
                    className='p-1 hover:bg-gray-100 rounded'
                >
                    <MaximizeIcon className='size-3 rotate-180' />
                </button>
            </div>

            <div className='flex flex-col gap-2'>
                <h2 className='text-sm font-medium'>Installation</h2>
                <p className='text-xs text-gray-600'>
                    Copy the MCP server URL below and add it to your MCP client
                    (Claude Desktop, Cline, etc.)
                </p>
            </div>

            <div className='flex flex-col gap-2'>
                <label className='text-xs font-medium text-gray-600'>
                    MCP Server URL
                </label>
                <div className='flex gap-2'>
                    <input
                        type='text'
                        value={mcpServerUrl}
                        readOnly
                        className='flex-1 px-2 py-1 text-xs border rounded bg-gray-50'
                    />
                    <button
                        onClick={handleCopy}
                        className='p-1.5 hover:bg-gray-100 rounded border'
                    >
                        {copied ? (
                            <CheckIcon className='size-3 text-green-600' />
                        ) : (
                            <CopyIcon className='size-3' />
                        )}
                    </button>
                </div>
            </div>

            <div className='flex flex-col gap-2 mt-auto'>
                <div className='flex items-center gap-2'>
                    <CircleIcon
                        className={`size-2 fill-current ${isConnected ? 'text-green-500' : 'text-orange-500'}`}
                    />
                    <span className='text-xs text-gray-600'>
                        {isConnected
                            ? 'Connected to MCP client'
                            : 'Waiting for connection'}
                    </span>
                </div>
                <p className='text-xs text-gray-500'>
                    Keep this plugin open while using MCP
                </p>
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
