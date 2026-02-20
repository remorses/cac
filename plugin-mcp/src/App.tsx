import {
    framer,
    isTextNode,
    isComponentNode,
    TextStyle,
    ProtectedMethod,
    FieldDataEntry,
    FieldDataEntryInput,
    isColorStyle,
    isImageAsset,
    isFileAsset,
    ManagedCollectionFieldInput,
} from 'framer-plugin'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import useMeasure from 'react-use-measure'
import { websocketClientHandling } from './lib/plugin-websocket.js'
import { McpToolNames, type FramerLayersTree } from './lib/schema.js'
import { mcpToolHandler } from './lib/mcp-handlers.js'
import { framerLayersTreeToXml } from './lib/xml.js'
import { getFramerTree } from './lib/framer.js'
import { processReactExportData } from './lib/react-export.js'
import './lib/framer.js'
import { useStore } from './lib/store.js'
import {
    CopyIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CircleIcon,
} from 'lucide-react'
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
import { LoginPage } from './routes/Login.js'
import {
    Paths,
    withMode,
    LoaderReturnType,
    pluginApiClient,
    LocalStorageKeys,
} from './lib/utils.js'

globalThis.framer = framer

// Initialize websocket connection (will be moved to authenticated component)
let cleanup: (() => void) | undefined
// Track current websocket ID to prevent duplicate connections for same user
let currentWebsocketId: string | undefined

// Websocket handler function - delegates to shared mcpToolHandler
async function websocketHandler({
    input,
    type,
}: {
    input: any
    type: McpToolNames
}) {
    return mcpToolHandler({ type, input })
}

function MainComponent() {
    const isConnected = useStore((state) => state.isConnected)
    const isExpanded = useStore((state) => state.isExpanded)
    const error = useStore((state) => state.error)
    const [copied, setCopied] = useState(false)
    const data = useLoaderData() as LoaderReturnType<typeof rootLoader>
    const navigate = useNavigate()

    const sessionId = useMemo(
        () => localStorage.getItem(LocalStorageKeys.sessionId) || '',
        [],
    )

    useEffect(() => {
        framer.setMenu([
            {
                label: 'Sign Out',
                async onAction() {
                    localStorage.removeItem(LocalStorageKeys.sessionId)
                    await navigate(Paths.login)
                },
            },
            {
                label: !isExpanded
                    ? 'Increase Window Size'
                    : 'Reduce Window Size',
                onAction() {
                    useStore.setState({ isExpanded: !isExpanded })
                },
            },
            {
                label: 'Run in Background',
                async onAction() {
                    await framer.setBackgroundMessage('MCP server running')
                    await framer.hideUI()
                },
            },
        ])
    }, [isExpanded])

    useEffect(() => {
        const handleKeyDown = async (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'x') {
                event.preventDefault()
                event.stopPropagation()

                try {
                    const selectedNodes = await framer.getSelection()
                    if (!selectedNodes || selectedNodes.length === 0) {
                        await framer.notify('No nodes selected', { variant: 'error' })
                        return
                    }

                    const tree = await getFramerTree({
                        rootNodes: selectedNodes,
                        recursive: false,
                    })

                    const firstNode = tree[0]
                    if (!firstNode) {
                        await framer.notify('No tree data', { variant: 'error' })
                        return
                    }

                    const children = firstNode.children
                    if (!children || children.length === 0) {
                        await framer.notify('No children in selected node', { variant: 'error' })
                        return
                    }

                    const removeNodeIds = (node: FramerLayersTree[number]): FramerLayersTree[number] => {
                        const { nodeId, ...rest } = node
                        const newAttributes = { ...rest.attributes }
                        delete newAttributes.nodeId
                        return {
                            ...rest,
                            attributes: newAttributes,
                            children: node.children?.map(removeNodeIds) || [],
                        }
                    }

                    const cleanedTree = children.map(removeNodeIds)
                    const xml = framerLayersTreeToXml(cleanedTree, {
                        shouldAddNodeIdAlways: false,
                    })

                    await navigator.clipboard.writeText(xml)
                    await framer.notify('XML copied to clipboard', { variant: 'success' })
                } catch (error) {
                    await framer.notify(`Failed to copy: ${error instanceof Error ? error.message : 'Unknown error'}`, { variant: 'error' })
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown, true)
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true)
        }
    }, [])

    const mcpServerUrl = `https://mcp.unframer.co/mcp?id=${data.userId}&secret=${sessionId}`

    const connectFramerMcpGuide = (() => {
        const url = new URL('https://unframer.co/guides/connect-framer-mcp')
        url.searchParams.set('userId', data.userId)

        url.searchParams.set('secret', sessionId)

        return url.toString()
    })()

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
            <div className='flex items-center justify-between ml-1 -mr-2 bg-framer-primary'>
                <div className='flex items-center truncate gap-2'>
                    <CircleIcon
                        className={`size-2 shrink-0 fill-current ${error ? 'text-red-500' : isConnected ? 'text-green-500' : 'text-gray-500'}`}
                    />
                    <div className='truncate'>
                        {error
                            ? 'Error'
                            : isConnected
                              ? 'Working...'
                              : 'MCP ready'}
                    </div>
                </div>
                <button
                    onClick={toggleExpanded}
                    className='w-auto p-1 shrink-0 bg-transparent hover:bg-framer-tertiary rounded transition-colors'
                >
                    <ChevronDownIcon className='size-4  text-framer-secondary' />
                </button>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-3 bg-framer-primary'>
            <p className='text-xs text-framer-secondary'>
                Copy the MCP server URL below and{' '}
                <a href={connectFramerMcpGuide} target='_blank'>
                    add it to your MCP client{' '}
                </a>
                (Claude Desktop, Cursor, etc.).
            </p>

            <div className='flex items-center justify-start gap-2'>
                <p className='text-xs text-framer-secondary'>
                    Keep this plugin open while using MCP
                </p>
                <CircleIcon
                    className={`size-2 fill-current ${error ? 'text-red-500' : isConnected ? 'text-green-500' : 'text-gray-500'}`}
                />
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
            {error && (
                <div className='p-2 bg-framer-tertiary rounded border border-framer-divider'>
                    <p className='text-xs text-red-500'>{error}</p>
                </div>
            )}
            {!error && sessionId && (
                <div className='p-2 bg-orange-500/2 rounded border border-yellow-500/30'>
                    <p className='text-xs text-yellow-500'>
                        Never share this URL with anyone, it contains your
                        personal session key
                    </p>
                </div>
            )}
            <div className='flex items-center -mt-px justify-between border-framer-divider'>
                <div className='flex items-center gap-2 text-[11px] text-framer-tertiary'>
                    <span className='truncate'>{data?.email}</span>
                    <span className='text-framer-tertiary/50'>•</span>
                    <a
                        href='mailto:tommy@unframer.co?subject=MCP%20Framer%20plugin%20support'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-framer-tertiary/60 hover:text-framer-tertiary transition-colors'
                    >
                        support
                    </a>
                </div>
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

async function createMcpFirstExportProject() {
    try {
        const projectInfo = await framer.getProjectInfo()
        if (!projectInfo?.id) {
            return
        }

        const [components, codeFiles] = await Promise.all([
            framer.getNodesWithType('ComponentNode'),
            framer.getCodeFiles(),
        ])

        const selectedComponentIds = new Set<string>()
        for (const component of components) {
            if (!component.id || !component.insertURL) {
                continue
            }
            selectedComponentIds.add(component.id)
        }
        for (const file of codeFiles) {
            if (
                !file.exports.some(
                    (exp) => exp.type === 'component' && exp.isDefaultExport,
                )
            ) {
                continue
            }
            selectedComponentIds.add(file.id)
        }

        if (selectedComponentIds.size === 0) {
            return
        }

        await framer.setPluginData('alreadyDoneFirstExport', 'true')
        const data = await processReactExportData({
            selectedComponentIds,
        })

        await pluginApiClient.api.plugins.reactExportPlugin.upsertProject.post({
            ...data,
            creationReason: 'MCP_FIRST_OPEN',
        })
    } catch (error) {
        console.error('Failed to process first export:', error)
    }
}

// Root loader to check authentication
async function rootLoader({}: LoaderFunctionArgs) {
    const sessionKey = localStorage.getItem(LocalStorageKeys.sessionId)
    if (!sessionKey) {
        throw redirect(withMode(Paths.login))
    }

    // Get current user info

    const { data, error } = await pluginApiClient.api.plugins.currentOrg.post()

    if (error) {
        console.error('Failed to get current org:', error)
        // Clear session on error
        localStorage.removeItem(LocalStorageKeys.sessionId)
        throw redirect(withMode(Paths.login))
    }

    // Get Framer user ID
    const user = await framer.getCurrentUser()
    const userId = user.id

    // Initialize websocket with user ID only if not already connected for this user
    if (!cleanup || currentWebsocketId !== userId) {
        // Clean up previous connection if user changed
        if (cleanup && currentWebsocketId !== userId) {
            cleanup()
            cleanup = undefined
        }

        currentWebsocketId = userId
        cleanup = await websocketClientHandling({
            websocketId: userId,
            handle: websocketHandler,
        })
    }

    const alreadyDoneFirstExport = await framer.getPluginData(
        'alreadyDoneFirstExport',
    )
    if (!alreadyDoneFirstExport) {
        createMcpFirstExportProject().catch((error) => {
            console.error('Failed to create MCP first export project:', error)
        })
    }

    return { email: data.email || 'Unknown', userId, websocketId: userId }
}

function RootLayout() {
    const [ref, { height }] = useMeasure()
    const isExpanded = useStore((state) => state.isExpanded)

    // Update framer UI size when height changes or expansion state changes
    useLayoutEffect(() => {
        void framer.showUI({
            position: 'top left',
            width: isExpanded ? 300 : 160,
            height: height || 400,
        })
    }, [height, isExpanded])

    return (
        <div ref={ref} className='flex flex-col p-3 pb-2 pt-0'>
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
