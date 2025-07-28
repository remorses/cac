import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
    CallToolRequest,
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { McpToolNames, mcpTools } from './types'
export type { McpToolWebsocketPayload } from './types'
import { createWebsocketHandling } from './websocket-server'
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
    const start = Date.now()
    const upstreamUrl = `wss://unframer.co/_tunnel/upstream?id=${websocketId}`
    const ws = new WebSocket(upstreamUrl)

    // Track if the Framer plugin is ready
    let isFramerPluginReady = false

    // Wait for connection
    await new Promise<void>((resolve, reject) => {
        ws.addEventListener('open', () => {
            console.log(`Connected to upstream tunnel with ID: ${websocketId}`)
            const elapsed = Date.now() - start
            console.log(
                `Tunnel connection established in ${(elapsed / 1000).toFixed(2)}s`,
            )
            resolve()
        })
        ws.addEventListener('error', (err) => {
            console.error('Upstream WebSocket Error:', err)
            reject(err)
        })
        ws.addEventListener('close', () => {
            console.log('Upstream WebSocket closed')
            isFramerPluginReady = false
        })
    })
    const { send, cleanup } = createWebsocketHandling({ ws })

    // Listen for ready message from Framer plugin
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

    send({
        payload: { type: 'ready' },
    })

    // Graceful shutdown
    const stop = () => {
        console.log('\n⏹ shutting down…')
        if (
            ws.readyState === WebSocket.OPEN ||
            ws.readyState === WebSocket.CONNECTING
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
            // Check if Framer plugin is connected
            if (!isFramerPluginReady) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'The Framer app plugin is not connected. Please ensure the Framer plugin is open and connected.',
                        },
                    ],
                }
            }

            const { name, arguments: args = {} } = request.params
            const reply = await send({
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

    server.onclose = () => {
        console.log('Server closed, cleaning up...')
        cleanup()
        stop()
    }

    // Use your handler
}
