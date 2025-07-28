import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
    CallToolRequest,
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
    GetPromptRequest,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ReadResourceRequest,
} from '@modelcontextprotocol/sdk/types.js'
import { McpToolNames, mcpTools } from './types'
export type { McpToolWebsocketPayload } from './types'
import { createWebsocketHandling, type WebsocketRpc } from './websocket-server'
import { toJSONSchema } from 'zod'

export async function implementMcpTools({
    server,
    websocketId,
}: {
    server: Server
    websocketId?: string
}) {
    if (!websocketId) {
        const bytes = new Uint8Array(8)
        crypto.getRandomValues(bytes)
        websocketId = Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
    }

    // Track if the Framer plugin is ready
    let isFramerPluginReady = false
    let ws: WebSocket | null = null
    let websocketRpc: WebsocketRpc | undefined = undefined
    let isServerStopped = false
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
    const reconnectDelay = 2000 // Fixed 2 second delay

    let retries = 0

    const connectWebSocket = async () => {
        if (isServerStopped) {
            console.log('Server is stopped, not attempting reconnection')
            return
        }

        console.log(
            `trying to connect to Websocket tunnel to get access to Framer app MCP with id ${websocketId}, retry #${retries + 1}`,
        )
        retries += 1

        try {
            const start = Date.now()
            const upstreamUrl = `wss://unframer.co/_tunnel/upstream?id=${websocketId}`
            ws = new WebSocket(upstreamUrl)

            // Wait for connection and ready message
            await new Promise<void>((resolve, reject) => {
                const handleOpen = () => {
                    console.log(
                        `Connected to upstream tunnel with ID: ${websocketId}`,
                    )

                    // Send ready message after WebSocket opens
                    websocketRpc = createWebsocketHandling({ ws: ws! })
                    websocketRpc.send({
                        payload: { type: 'ready' },
                    })
                }

                const handleMessageReady = (event: MessageEvent) => {
                    try {
                        const data = JSON.parse(event.data)
                        if (data.type === 'ready') {
                            isFramerPluginReady = true
                            const elapsed = Date.now() - start
                            console.log(
                                `Framer plugin is ready, connection established in ${(elapsed / 1000).toFixed(2)}s`,
                            )
                            // Remove the message listener since we only need it once
                            ws!.removeEventListener(
                                'message',
                                handleMessageReady,
                            )
                            resolve()
                        }
                    } catch {
                        // Ignore parse errors
                    }
                }

                const handleError = (err: Event) => {
                    console.error('Upstream WebSocket Error:', err)
                    reject(err)
                }

                ws!.addEventListener('open', handleOpen, { once: true })
                ws!.addEventListener('error', handleError, { once: true })
                ws!.addEventListener('message', handleMessageReady)
            })

            // Set up persistent event listeners
            ws.addEventListener('close', () => {
                console.log('Upstream WebSocket closed')
                isFramerPluginReady = false

                // Attempt reconnection if server is not stopped
                if (!isServerStopped) {
                    console.log(
                        `Attempting reconnection in ${reconnectDelay}ms`,
                    )
                    reconnectTimeout = setTimeout(() => {
                        connectWebSocket().catch((err) => {
                            console.error('Reconnection failed:', err)
                        })
                    }, reconnectDelay)
                }
            })

            ws.addEventListener('error', (err) => {
                console.error('Upstream WebSocket Error:', err)
            })

            ws.addEventListener('message', (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type === 'ready') {
                        isFramerPluginReady = true
                        console.log('Framer plugin is ready')
                    }
                } catch {
                    // Ignore parse errors
                }
            })

            return true
        } catch (error) {
            console.error('Failed to connect WebSocket:', error)

            // Attempt reconnection if server is not stopped
            if (!isServerStopped) {
                console.log(`Attempting reconnection in ${reconnectDelay}ms`)
                reconnectTimeout = setTimeout(() => {
                    connectWebSocket().catch((err) => {
                        console.error('Reconnection failed:', err)
                    })
                }, reconnectDelay)
            }

            throw error
        }
    }

    let clientConnectedPromise = connectWebSocket()

    // Graceful shutdown
    const stop = () => {
        console.log('\n⏹ shutting down…')
        isServerStopped = true

        // Clear any pending reconnect timeout
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout)
            reconnectTimeout = null
        }

        if (
            ws &&
            (ws.readyState === WebSocket.OPEN ||
                ws.readyState === WebSocket.CONNECTING)
        ) {
            ws.close()
        }
    }

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: Object.entries(mcpTools).map(([name, tool]) => ({
            name,
            description: tool.description,
            inputSchema: toJSONSchema(tool.input),
        })),
    }))

    server.setRequestHandler(
        CallToolRequestSchema,
        async (request: CallToolRequest) => {
            await clientConnectedPromise
            // Check if Framer plugin is connected
            if (!isFramerPluginReady || !websocketRpc) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'The Framer app plugin is not connected. Please ensure the Framer plugin is open and connected.',
                        },
                    ],
                }
            }

            if (!websocketRpc) throw new Error('Websocket RPC is not initialized')
            const { name, arguments: args = {} } = request.params
            const reply = await websocketRpc.send({
                payload: { type: name as any, input: args as any },
            })
            const text =
                typeof reply === 'string'
                    ? reply
                    : JSON.stringify(reply, null, 2)

            return {
                content: [
                    {
                        type: 'text',
                        text,
                    },
                ],
            }
        },
    )

    // Prompts handlers - return empty array
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
        prompts: [],
    }))

    server.setRequestHandler(
        GetPromptRequestSchema,
        async (request: GetPromptRequest) => {
            throw new Error(`No prompts available`)
        },
    )

    // Resources handlers - return empty array
    server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: [],
    }))

    server.setRequestHandler(
        ReadResourceRequestSchema,
        async (request: ReadResourceRequest) => {
            throw new Error(`No resources available`)
        },
    )

    server.onclose = () => {
        console.log('Server closed, cleaning up...')

        websocketRpc?.cleanup()

        stop()
    }

    // Use your handler
}
