import { framer } from 'framer-plugin'
import { useEffect, useLayoutEffect, useState } from 'react'
import useMeasure from 'react-use-measure'
import { websocketClientHandling } from './lib/client-websocket'
import { FramerLayersTree, McpToolNames } from './lib/types'
import './lib/framer'
import { useStore } from './lib/store'
import { CopyIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, CircleIcon } from 'lucide-react'
import { framerLayersTreeToXml } from './lib/xml'
import { getFramerTree } from './lib/framer'

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
    async handle({ input, type }) {
        switch (type) {
            case 'getNodeXml': {
                const node = await framer.getNode(input.nodeId)
                if (!node) {
                    return `Node with ID ${input.nodeId} not found.`
                }
                const tree = await getFramerTree({
                    rootNodes: [node],
                    recursive: false,
                })
                const xml = framerLayersTreeToXml(tree, {
                    shouldAddNodeIdAlways: true,
                })
                return `Node xml:\n` + xml
            }
            case 'getProjectXml': {
                const pages = await framer.getNodesWithType('WebPageNode')
                const components =
                    await framer.getNodesWithType('ComponentNode')
                const tree: FramerLayersTree = [
                    {
                        name: 'Project', //
                        children: [
                            {
                                name: 'Pages',
                                children: pages.map((page) => ({
                                    name: page.path || 'Page',
                                    id: page.id,
                                    attributes: {
                                        type: 'WebPageNode',
                                        nodeId: page.id,
                                        path: page.path || '',
                                    },
                                    children: [],
                                })),
                            },
                            {
                                name: 'Components',
                                children: components.map((component) => ({
                                    name: component.name || 'Component',
                                    id: component.id,
                                    attributes: {
                                        type: 'ComponentNode',
                                        nodeId: component.id,
                                        name: component.componentName || '',
                                    },
                                    children: [],
                                })),
                            },
                        ],
                    },
                ]
                const xml = framerLayersTreeToXml(tree, {
                    shouldAddNodeIdAlways: true,
                })
                return `Project structure:\n` + xml
            }
            default:
                throw new Error(`Unknown tool type: ${type}`)
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

    const mcpServerUrl = `https://mcp.unframer.co/sse?id=${websocketId}`

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
                    className='w-auto p-1 bg-transparent hover:bg-framer-tertiary rounded transition-colors'
                >
                    <ChevronDownIcon className='size-3 text-framer-secondary' />
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
                        <ChevronUpIcon className='size-3 text-framer-secondary' />
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
