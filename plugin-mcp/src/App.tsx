import { framer, isTextNode } from 'framer-plugin'
import { useEffect, useLayoutEffect, useState } from 'react'
import useMeasure from 'react-use-measure'
import { websocketClientHandling } from './lib/client-websocket'
import { FramerLayersTree, McpToolNames } from './lib/types'
import './lib/framer'
import { useStore } from './lib/store'
import { CopyIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, CircleIcon } from 'lucide-react'
import { framerLayersTreeToXml, extractObjectsFromXmlContent } from './lib/xml'
import { getFramerTree, applyAttributes } from './lib/framer'

globalThis.framer = framer

framer.showUI({
    position: 'top left',
    width: 140,
    height: 44,
})
// Get initial websocketId from store
const { websocketId } = useStore.getState()

// Helper function to get XML for a node
async function getNodeXml(nodeId: string): Promise<string | null> {
    const node = await framer.getNode(nodeId)
    if (!node) {
        return null
    }
    const tree = await getFramerTree({
        rootNodes: [node],
        recursive: false,
    })
    const xml = framerLayersTreeToXml(tree, {
        shouldAddNodeIdAlways: true,
    })
    return xml
}

// Initialize websocket connection
const cleanup = await websocketClientHandling({
    async handle({ input, type }) {
        switch (type) {
            case 'getNodeXml': {
                const xml = await getNodeXml(input.nodeId)
                if (!xml) {
                    return `Node with ID ${input.nodeId} not found.`
                }
                return `Node xml:\n${xml}`
            }
            case 'getSelectedNodesXml': {
                const selectedNodes = await framer.getSelection()
                if (!selectedNodes || selectedNodes.length === 0) {
                    return 'No nodes are currently selected.'
                }

                const tree = await getFramerTree({
                    rootNodes: selectedNodes,
                    recursive: false,
                })
                const xml = framerLayersTreeToXml(tree, {
                    shouldAddNodeIdAlways: true,
                })
                return `Selected nodes XML:\n${xml}`
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
            case 'updateXmlForNode': {
                const { nodeId, xml } = input

                // Extract nodes from the provided XML
                const extractedNodes = extractObjectsFromXmlContent(xml)

                const results: string[] = []
                const updatedNodeIds: string[] = []

                for (const extractedNode of extractedNodes) {
                    const targetNodeId = extractedNode.nodeId || nodeId
                    const node = await framer.getNode(targetNodeId)

                    if (!node) {
                        results.push(`Node with ID ${targetNodeId} not found.`)
                        continue
                    }

                    let wasUpdated = false

                    // Update text if it's a text node and new content is provided
                    if (extractedNode.newContent && isTextNode(node)) {
                        await node.setText(extractedNode.newContent)
                        results.push(`Updated text for node ${targetNodeId}`)
                        wasUpdated = true
                    }

                    // Apply attributes if any
                    if (extractedNode.attributes && Object.keys(extractedNode.attributes).length > 0) {
                        await applyAttributes(node, extractedNode.attributes)
                        results.push(`Updated attributes for node ${targetNodeId}`)
                        wasUpdated = true
                    }

                    if (wasUpdated) {
                        updatedNodeIds.push(targetNodeId)
                    }
                }

                // Get the updated XML for the primary node
                const updatedXml = await getNodeXml(nodeId)

                const resultMessage = results.length > 0
                    ? `Successfully updated:\n${results.join('\n')}`
                    : 'No updates were made.'

                return updatedXml
                    ? `${resultMessage}\n\nUpdated XML:\n${updatedXml}`
                    : resultMessage
            }
            case 'zoomIntoView': {
                const { nodeId } = input
                const node = await framer.getNode(nodeId)
                if (!node) {
                    return `Node with ID ${nodeId} not found.`
                }
                await framer.zoomIntoView(nodeId)
                return `Zoomed into view for node ${nodeId}`
            }
            case 'getProjectColorStyles': {
                const colorStyles = await framer.getColorStyles()

                // Return color styles with available properties
                return colorStyles.map(style => ({
                    id: style.id,
                    name: style.name,
                    path: style.path,
                    light: style.light,
                    dark: style.dark,
                }))
            }
            case 'getProjectTextStyles': {
                const textStyles = await framer.getTextStyles()

                return textStyles.map(style => ({
                    id: style.id,
                    name: style.name,
                    path: style.path,
                    fontSize: style.fontSize,
                    lineHeight: style.lineHeight,
                    letterSpacing: style.letterSpacing,
                    paragraphSpacing: style.paragraphSpacing,
                    transform: style.transform,
                    alignment: style.alignment,
                    decoration: style.decoration,
                    balance: style.balance,
                    tag: style.tag,
                }))
            }
            case 'updateColorStyle': {
                const { stylePath, updates } = input

                if (!stylePath.startsWith('/')) {
                    return `Color style path must start with /. Got: ${stylePath}`
                }

                // Get all color styles and find by path
                const colorStyles = await framer.getColorStyles()
                const colorStyle = colorStyles.find(style => style.path === stylePath)

                if (!colorStyle) {
                    return `Color style with path ${stylePath} not found.`
                }

                const result = await colorStyle.setAttributes(updates)

                if (!result) {
                    return `Failed to update color style ${stylePath}.`
                }

                return {
                    message: `Successfully updated color style: ${result.name}`,
                    style: {
                        id: result.id,
                        name: result.name,
                        path: result.path,
                        light: result.light,
                        dark: result.dark,
                    }
                }
            }
            case 'updateTextStyle': {
                const { stylePath, updates } = input

                if (!stylePath.startsWith('/')) {
                    return `Text style path must start with /. Got: ${stylePath}`
                }

                // Get all text styles and find by path
                const textStyles = await framer.getTextStyles()
                const textStyle = textStyles.find(style => style.path === stylePath)

                if (!textStyle) {
                    return `Text style with path ${stylePath} not found.`
                }

                // Prepare the attributes with proper types
                const attributes: any = {}

                if (updates.name !== undefined) {
                    attributes.name = updates.name
                }
                if (updates.fontSize !== undefined) {
                    attributes.fontSize = updates.fontSize as any
                }
                if (updates.lineHeight !== undefined) {
                    attributes.lineHeight = updates.lineHeight as any
                }
                if (updates.letterSpacing !== undefined) {
                    attributes.letterSpacing = updates.letterSpacing as any
                }
                if (updates.paragraphSpacing !== undefined) {
                    attributes.paragraphSpacing = updates.paragraphSpacing
                }
                if (updates.transform !== undefined) {
                    attributes.transform = updates.transform
                }
                if (updates.alignment !== undefined) {
                    attributes.alignment = updates.alignment
                }
                if (updates.decoration !== undefined) {
                    attributes.decoration = updates.decoration
                }
                if (updates.balance !== undefined) {
                    attributes.balance = updates.balance
                }

                const result = await textStyle.setAttributes(attributes)

                if (!result) {
                    return `Failed to update text style ${stylePath}.`
                }

                return {
                    message: `Successfully updated text style: ${result.name}`,
                    style: {
                        id: result.id,
                        name: result.name,
                        path: result.path,
                        fontSize: result.fontSize,
                        lineHeight: result.lineHeight,
                        letterSpacing: result.letterSpacing,
                        paragraphSpacing: result.paragraphSpacing,
                        transform: result.transform,
                        alignment: result.alignment,
                        decoration: result.decoration,
                        balance: result.balance,
                        tag: result.tag,
                    }
                }
            }
            case 'searchFonts': {
                const { query } = input
                
                // Get all fonts from Framer
                const allFonts = await framer.getFonts()
                
                // Filter fonts that contain the query substring in their selector
                const matchingFonts = allFonts.filter(font => 
                    font.selector.toLowerCase().includes(query.toLowerCase())
                )
                
                // Limit to 20 results
                const limitedFonts = matchingFonts.slice(0, 20)
                
                // Return formatted results
                const results = limitedFonts.map(font => ({
                    family: font.family,
                    selector: font.selector,
                    weight: font.weight,
                    style: font.style,
                }))
                
                const message = matchingFonts.length > 20 
                    ? `Found ${matchingFonts.length} fonts matching "${query}". Showing first 20. Use a more specific search term to narrow results.`
                    : `Found ${matchingFonts.length} fonts matching "${query}".`
                
                return {
                    message,
                    results,
                    totalMatches: matchingFonts.length,
                }
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
