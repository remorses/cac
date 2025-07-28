import { framer, isTextNode, isComponentNode, TextStyle } from 'framer-plugin'
import dedent from 'string-dedent'
import { useEffect, useLayoutEffect, useState } from 'react'
import useMeasure from 'react-use-measure'
import { websocketClientHandling } from './lib/plugin-websocket'
import { FramerLayersTree, McpToolNames } from './lib/schema'
import './lib/framer'
import { useStore } from './lib/store'
import {
    CopyIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CircleIcon,
} from 'lucide-react'
import { framerLayersTreeToXml, extractObjectsFromXmlContent } from './lib/xml'
import { getFramerTree, applyAttributes } from './lib/framer'
import { processReactExportData } from './lib/react-export'
import {
    createBrowserRouter,
    RouterProvider,
    redirect,
    RouteObject,
    Outlet,
    LoaderFunctionArgs,
    useLoaderData,
    useNavigate,
} from 'react-router'
import { LoginPage } from './routes/Login'
import {
    PluginDataKeys,
    Paths,
    withMode,
    LoaderReturnType,
    pluginApiClient,
} from './lib/utils'

globalThis.framer = framer

framer.showUI({
    position: 'top left',
    width: 140,
    height: 44,
})

// Helper function to get XML for a node
async function getNodeXml(
    nodeId: string,
): Promise<{ xml: string; isReplica: boolean } | null> {
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
    return { xml, isReplica: node.isReplica }
}

// Initialize websocket connection (will be moved to authenticated component)
let cleanup: (() => void) | undefined

// Websocket handler function
async function websocketHandler({
    input,
    type,
}: {
    input: any
    type: McpToolNames
}) {
    switch (type) {
        case 'getNodeXml': {
            const result = await getNodeXml(input.nodeId)
            if (!result) {
                return `Node with ID ${input.nodeId} not found.`
            }
            let response = `Node xml:\n${result.xml}`
            if (result.isReplica) {
                response = `WARNING: This is a replica node (variant). It's recommended to update the original component instead to maintain consistency.\n\n${response}`
            }
            return response
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

            // Check if any selected nodes are replicas
            const replicaCount = selectedNodes.filter(
                (node) => node.isReplica,
            ).length
            let response = `Selected nodes XML:\n${xml}`

            if (replicaCount > 0) {
                const warning =
                    replicaCount === 1
                        ? "WARNING: One of the selected nodes is a replica (variant). It's recommended to update the original component instead."
                        : `WARNING: ${replicaCount} of the selected nodes are replicas (variants). It's recommended to update the original components instead.`
                response = `${warning}\n\n${response}`
            }

            return response
        }
        case 'getProjectXml': {
            const pages = await framer.getNodesWithType('WebPageNode')
            const components = await framer.getNodesWithType('ComponentNode')
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
                if (
                    extractedNode.attributes &&
                    Object.keys(extractedNode.attributes).length > 0
                ) {
                    await applyAttributes(node, extractedNode.attributes)
                    results.push(`Updated attributes for node ${targetNodeId}`)
                    wasUpdated = true
                }

                if (wasUpdated) {
                    updatedNodeIds.push(targetNodeId)
                }
            }

            // Get the updated XML for the primary node
            const updatedResult = await getNodeXml(nodeId)

            const resultMessage =
                results.length > 0
                    ? `Successfully updated:\n${results.join('\n')}`
                    : 'No updates were made.'

            return updatedResult
                ? `${resultMessage}\n\nUpdated XML:\n${updatedResult.xml}`
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
            return colorStyles.map((style) => ({
                path: style.path,
                light: style.light,
                dark: style.dark,
            }))
        }
        case 'getProjectTextStyles': {
            const textStyles = await framer.getTextStyles()

            return textStyles.map((style) => ({
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
            const colorStyle = colorStyles.find(
                (style) => style.path === stylePath,
            )

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
                    path: result.path,

                    light: result.light,
                    dark: result.dark,
                },
            }
        }
        case 'createColorStyle': {
            const { stylePath, properties } = input

            if (!stylePath.startsWith('/')) {
                return `Color style path must start with /. Got: ${stylePath}`
            }

            // Check if style already exists
            const colorStyles = await framer.getColorStyles()
            const existingStyle = colorStyles.find(
                (style) => style.path === stylePath,
            )

            if (existingStyle) {
                return `Color style with path ${stylePath} already exists.`
            }

            // Prepare the attributes with proper types
            type ColorStyleAttributes = Parameters<
                typeof framer.createColorStyle
            >[0]
            const attributes: ColorStyleAttributes = {
                ...properties,
                path: stylePath,
            }

            try {
                const result = await framer.createColorStyle(attributes)

                if (!result) {
                    return `Failed to create color style at ${stylePath}.`
                }

                return {
                    message: `Successfully created color style: ${result.name}`,
                    style: {
                        path: result.path,
                        name: result.name,
                        light: result.light,
                        dark: result.dark,
                    },
                }
            } catch (error) {
                return `Failed to create color style: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'updateTextStyle': {
            const { stylePath, updates } = input

            if (!stylePath.startsWith('/')) {
                return `Text style path must start with /. Got: ${stylePath}`
            }

            // Get all text styles and find by path
            const textStyles = await framer.getTextStyles()
            const textStyle = textStyles.find(
                (style) => style.path === stylePath,
            )

            if (!textStyle) {
                return `Text style with path ${stylePath} not found.`
            }

            // Get color styles once if needed
            const needsColorStyles = 
                (typeof updates.color === 'string' && updates.color.startsWith('/')) ||
                (typeof updates.decorationColor === 'string' && updates.decorationColor.startsWith('/'))
            
            const colorStyles = needsColorStyles ? await framer.getColorStyles() : []

            // Prepare the attributes with proper types
            type TextStyleAttributes = Parameters<TextStyle['setAttributes']>[0]
            const attributes: TextStyleAttributes = { ...updates }

            // Handle color style paths for color field
            if (
                typeof updates.color === 'string' &&
                updates.color.startsWith('/')
            ) {
                const colorStyle = colorStyles.find(
                    (style) => style.path === updates.color,
                )

                if (!colorStyle) {
                    return `Color style with path ${updates.color} not found.`
                }

                // Use the color style object instead of the path string
                attributes.color = colorStyle as any
            }

            // Handle color style paths for decorationColor field
            if (
                typeof updates.decorationColor === 'string' &&
                updates.decorationColor.startsWith('/')
            ) {
                const colorStyle = colorStyles.find(
                    (style) => style.path === updates.decorationColor,
                )

                if (!colorStyle) {
                    return `Color style with path ${updates.decorationColor} not found.`
                }

                // Use the color style object instead of the path string
                attributes.decorationColor = colorStyle as any
            }

            const result = await textStyle.setAttributes(attributes)

            if (!result) {
                return `Failed to update text style ${stylePath}.`
            }

            return {
                message: `Successfully updated text style: ${result.name}`,
                style: {
                    path: result.path,
                    name: result.name,
                    fontSize: result.fontSize,
                    lineHeight: result.lineHeight,
                    letterSpacing: result.letterSpacing,
                    paragraphSpacing: result.paragraphSpacing,
                    transform: result.transform,
                    alignment: result.alignment,
                    decoration: result.decoration,
                    balance: result.balance,
                    tag: result.tag,
                },
            }
        }
        case 'createTextStyle': {
            const { stylePath, properties } = input

            if (!stylePath.startsWith('/')) {
                return `Text style path must start with /. Got: ${stylePath}`
            }

            // Check if style already exists
            const textStyles = await framer.getTextStyles()
            const existingStyle = textStyles.find(
                (style) => style.path === stylePath,
            )

            if (existingStyle) {
                return `Text style with path ${stylePath} already exists.`
            }

            // Get color styles once if needed
            const needsColorStyles = 
                (typeof properties.color === 'string' && properties.color.startsWith('/')) ||
                (typeof properties.decorationColor === 'string' && properties.decorationColor.startsWith('/'))
            
            const colorStyles = needsColorStyles ? await framer.getColorStyles() : []

            // Prepare the attributes with proper types
            type TextStyleAttributes = Parameters<
                typeof framer.createTextStyle
            >[0]
            const attributes: TextStyleAttributes = {
                ...properties,
                path: stylePath,
            }

            // Handle color style paths for color field
            if (
                typeof properties.color === 'string' &&
                properties.color.startsWith('/')
            ) {
                const colorStyle = colorStyles.find(
                    (style) => style.path === properties.color,
                )

                if (!colorStyle) {
                    return `Color style with path ${properties.color} not found.`
                }

                // Use the color style object instead of the path string
                attributes.color = colorStyle as any
            }

            // Handle color style paths for decorationColor field
            if (
                typeof properties.decorationColor === 'string' &&
                properties.decorationColor.startsWith('/')
            ) {
                const colorStyle = colorStyles.find(
                    (style) => style.path === properties.decorationColor,
                )

                if (!colorStyle) {
                    return `Color style with path ${properties.decorationColor} not found.`
                }

                // Use the color style object instead of the path string
                attributes.decorationColor = colorStyle as any
            }

            try {
                const result = await framer.createTextStyle(attributes)

                if (!result) {
                    return `Failed to create text style at ${stylePath}.`
                }

                return {
                    message: `Successfully created text style: ${result.name}`,
                    style: {
                        path: result.path,
                        name: result.name,
                        fontSize: result.fontSize,
                        lineHeight: result.lineHeight,
                        letterSpacing: result.letterSpacing,
                        paragraphSpacing: result.paragraphSpacing,
                        transform: result.transform,
                        alignment: result.alignment,
                        decoration: result.decoration,
                        balance: result.balance,
                        tag: result.tag,
                    },
                }
            } catch (error) {
                return `Failed to create text style: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'searchFonts': {
            const { query } = input

            // Get all fonts from Framer
            const allFonts = await framer.getFonts()

            // Filter fonts that contain the query substring in their selector
            const matchingFonts = allFonts.filter((font) =>
                font.selector.toLowerCase().includes(query.toLowerCase()),
            )

            // Limit to 20 results
            const limitedFonts = matchingFonts.slice(0, 20)

            // Return formatted results
            const results = limitedFonts.map((font) => ({
                family: font.family,
                selector: font.selector,
                weight: font.weight,
                style: font.style,
            }))

            const baseMessage =
                matchingFonts.length > 20
                    ? `Found ${matchingFonts.length} fonts matching "${query}". Showing first 20. Use a more specific search term to narrow results.`
                    : `Found ${matchingFonts.length} fonts matching "${query}".`

            const message = `${baseMessage}\n\nTo use a font: <Text font="selector">Text</Text>\nNote: font and inlineTextStyle attributes are mutually exclusive`

            return {
                message,
                results,
                totalMatches: matchingFonts.length,
            }
        }
        case 'deleteNode': {
            const { nodeId } = input
            const node = await framer.getNode(nodeId)

            if (!node) {
                return `Node with ID ${nodeId} not found.`
            }

            try {
                await node.remove()
                return `Successfully deleted node ${nodeId}.`
            } catch (error) {
                return `Failed to delete node ${nodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'duplicateNode': {
            const { nodeId } = input
            const node = await framer.getNode(nodeId)

            if (!node) {
                return `Node with ID ${nodeId} not found.`
            }

            try {
                const parent = await node.getParent()
                if (!parent) {
                    throw new Error('No parent found for node')
                }
                let cloned = await node.clone()
                if (!cloned) {
                    throw new Error('No new node cloned found')
                }
                await framer.setParent(cloned.id, parent.id)
                if (!cloned) {
                    return `Failed to duplicate node ${nodeId}: The operation returned null.`
                }
                return `Here is the new node XML:\n\n` + getNodeXml(cloned.id)
            } catch (error) {
                return `Failed to duplicate node ${nodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'exportReactComponents': {
            const { nodeIds } = input

            // Validate that all nodes exist and are components
            const componentIds = new Set<string>()
            const invalidNodes: string[] = []

            for (const nodeId of nodeIds) {
                const node = await framer.getNode(nodeId)
                if (!node) {
                    invalidNodes.push(`${nodeId} (not found)`)
                    continue
                }

                // Check if it's a component node
                if (isComponentNode(node)) {
                    componentIds.add(nodeId)
                } else {
                    invalidNodes.push(`${nodeId} (not a component)`)
                }
            }

            if (invalidNodes.length > 0) {
                return `Cannot export the following nodes: ${invalidNodes.join(', ')}. Only component nodes can be exported.`
            }

            if (componentIds.size === 0) {
                return `No valid component nodes found to export.`
            }

            try {
                // Process the export data
                const data = await processReactExportData({
                    selectedComponentIds: componentIds,
                })

                // Get the API client and submit the export

                const { error, data: responseData } =
                    await pluginApiClient.api.plugins.reactExportPlugin.upsertProject.post(
                        data,
                    )

                if (error) {
                    throw new Error(error.message || 'Export failed')
                }

                const projectId = responseData.projectId

                return dedent`
                  Components successfully exported!

                  Now you can run the following command to download the React components into your own codebase

                  \`npx unframer --outDir src/framer ${projectId}\`

                  You can also run \`npx unframer --help\` for more available options.

                  If you install unframer locally in the project you won't need to use npx. Install as a dependency and not a devDependency to use it in production builds.


                  `
            } catch (error) {
                return `Failed to export components: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        default:
            throw new Error(`Unknown tool type: ${type}`)
    }
}

function MainComponent() {
    const isConnected = useStore((state) => state.isConnected)
    const isExpanded = useStore((state) => state.isExpanded)
    const error = useStore((state) => state.error)
    const [copied, setCopied] = useState(false)
    const data = useLoaderData() as LoaderReturnType<typeof rootLoader>
    const navigate = useNavigate()

    // Get session ID from localStorage
    const [sessionId, setSessionId] = useState<string | null>(null)
    useEffect(() => {
        const storedSessionId = localStorage.getItem('framer-mcp-session-id')
        setSessionId(storedSessionId)
    }, [])

    const mcpServerUrl = sessionId
        ? `https://mcp.unframer.co/sse?id=${data.userId}&secret=${sessionId}`
        : `https://mcp.unframer.co/sse?id=${data.userId}`

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

    if (!isExpanded) {
        return (
            <div className='flex items-center justify-between px-3 py-3 bg-framer-primary'>
                <div className='flex items-center gap-2'>
                    <CircleIcon
                        className={`size-2 fill-current ${error ? 'text-red-500' : isConnected ? 'text-green-500' : 'text-orange-500'}`}
                    />
                    <span className='text-xs truncate font-medium text-framer-primary'>
                        Framer MCP
                    </span>
                </div>
                <button
                    onClick={toggleExpanded}
                    className='w-auto p-1 bg-transparent hover:bg-framer-tertiary rounded transition-colors'
                >
                    <ChevronDownIcon className='size-4 text-framer-secondary' />
                </button>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-4 bg-framer-primary'>
            <div className='flex items-center justify-between'>
                <h2 className='text-sm font-medium text-framer-primary'>
                    {/* Framer MCP Installation */}
                </h2>
            </div>
            <div className='flex flex-col gap-2'>
                <p className='text-xs text-framer-secondary'>
                    Copy the MCP server URL below and add it to your MCP client
                    (Claude Desktop, Cursor, etc.)
                </p>
            </div>
            <div className='flex flex-col gap-2 mt-auto'>
                <div className='flex items-center justify-start gap-2'>
                    <p className='text-xs text-framer-secondary'>
                        Keep this plugin open while using MCP
                    </p>
                    <CircleIcon
                        className={`size-2 fill-current ${error ? 'text-red-500' : isConnected ? 'text-green-500' : 'text-orange-500'}`}
                    />
                </div>
                {error && (
                    <div className='p-2 bg-framer-tertiary rounded border border-framer-divider'>
                        <p className='text-xs text-red-500'>{error}</p>
                    </div>
                )}
                {sessionId && (
                    <div className='p-2 bg-orange-500/10 rounded border border-orange-500/30'>
                        <p className='text-xs text-orange-600'>
                            ⚠️ Never share this URL with anyone - it contains your personal session
                        </p>
                    </div>
                )}
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
                        className='w-auto px-3 py-2 hover:bg-framer-secondary rounded border border-framer-divider transition-colors'
                    >
                        {copied ? (
                            <CheckIcon className='size-3.5 text-green-500' />
                        ) : (
                            <CopyIcon className='size-3.5 text-framer-secondary' />
                        )}
                    </button>
                </div>
            </div>

            <div className='flex items-center justify-between pt-2 border-t border-framer-divider'>
                <span className='text-xs text-framer-tertiary truncate'>
                    {data?.email}
                </span>
                <button
                    onClick={async () => {
                        await framer.setPluginData(
                            PluginDataKeys.sessionKey,
                            null,
                        )
                        localStorage.removeItem('framer-mcp-session-id')
                        navigate(Paths.login)
                    }}
                    className='!text-xs text-framer-tertiary  transition-colors w-auto bg-transparent'
                >
                    sign out
                </button>
                <button
                    onClick={toggleExpanded}
                    className='w-auto p-1 bg-transparent hover:bg-framer-secondary rounded transition-colors'
                >
                    <ChevronUpIcon className='size-4 text-framer-secondary' />
                </button>
            </div>
        </div>
    )
}

// Root loader to check authentication
async function rootLoader({}: LoaderFunctionArgs) {
    const sessionKey = await framer.getPluginData(PluginDataKeys.sessionKey)
    if (!sessionKey) {
        throw redirect(withMode(Paths.login))
    }
    
    // Also save to localStorage for access in the component
    localStorage.setItem('framer-mcp-session-id', sessionKey)

    // Get current user info

    const { data, error } = await pluginApiClient.api.plugins.currentOrg.post()

    if (error) {
        console.error('Failed to get current org:', error)
        // Clear session on error
        await framer.setPluginData(PluginDataKeys.sessionKey, null)
        localStorage.removeItem('framer-mcp-session-id')
        throw redirect(withMode(Paths.login))
    }

    // Get Framer user ID
    const user = await framer.getCurrentUser()
    const userId = user.id

    // Initialize websocket with user ID
    if (!cleanup) {
        cleanup = await websocketClientHandling({
            websocketId: userId,
            handle: websocketHandler,
        })
    }

    return { email: data.email || 'Unknown', userId }
}

function RootLayout() {
    const [ref, { height }] = useMeasure()
    const isExpanded = useStore((state) => state.isExpanded)

    // Update framer UI size when height changes or expansion state changes
    useLayoutEffect(() => {
        void framer.showUI({
            position: 'top left',
            width: isExpanded ? 300 : 180,
            height: height || 400,
        })
    }, [height, isExpanded])

    return (
        <div ref={ref} className='flex flex-col p-4 pt-0'>
            <Outlet />
        </div>
    )
}

function MainPage(): RouteObject {
    return {
        path: Paths.main,
        loader: rootLoader,
        Component: MainComponent,
    }
}

const routes: RouteObject[] = [
    {
        path: '/',
        Component: RootLayout,
        children: [MainPage(), LoginPage()],
    },
]

const router = createBrowserRouter(routes)

export default function App() {
    return <RouterProvider router={router} />
}

import.meta.hot?.accept(() => {
    import.meta.hot?.invalidate()
})
import.meta.hot?.dispose(() => {
    cleanup?.()
})
