import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import codeComponentsResourceMarkdown from './lib/workshop.md?raw'
import {
    CallToolRequest,
    CallToolRequestSchema,
    GetPromptRequest,
    GetPromptRequestSchema,
    ListPromptsRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequest,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { McpAgent } from 'agents/mcp'
import { toJSONSchema } from 'zod'
import { codeComponentsResourceUri, mcpTools } from './lib/schema'
import { WebsocketRpc, createWebsocketHandling } from './lib/mcp-websocket'

export class MyMCP extends McpAgent<Env> {
    server = new Server(
        {
            name: 'Framer MCP',
            version: '1.2.0',
        },
        {
            capabilities: {
                tools: {},
                prompts: {},
                resources: {},
            },
        },
    )

    async init() {
        const server = this.server
        const websocketId = this.props?.websocketId as string
        const secret = this.props?.secret as string

        if (!websocketId) {
            throw new Error('websocketId ?id search param is required')
        }

        if (!secret) {
            throw new Error(
                'secret ?secret search param is required for authentication',
            )
        }

        console.log('Initializing MyMCP with websocketId:', websocketId)

        // Validate session
        try {
            const response = await fetch(
                'https://unframer.co/api/plugins/validateSession',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId: secret,
                        framerUserId: websocketId,
                    }),
                },
            )

            const data = (await response.json()) as {
                valid: boolean
                error?: string
            }

            if (!data.valid) {
                console.error('Session validation failed:', data.error)
                throw new Error(`Session validation failed: ${data.error}`)
            }

            console.log('Session validated successfully')
        } catch (error) {
            console.error('Failed to validate session:', error)
            throw new Error('Failed to validate session')
        }

        let ws: WebSocket | null = null
        let isServerStopped = false
        let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
        const reconnectDelay = 2000 // Fixed 2 second delay

        let retries = 0

        const connectWebSocket = async (): Promise<WebsocketRpc> => {
            if (isServerStopped) {
                console.log('Server is stopped, not attempting reconnection')
                throw new Error('Server is stopped')
            }

            console.log(
                `trying to connect to Websocket tunnel to get access to Framer app MCP with id ${websocketId}, retry #${retries + 1}`,
            )
            retries += 1

            try {
                const start = Date.now()
                const upstreamUrl = `wss://unframer.co/_tunnel/client?id=${websocketId}`
                ws = new WebSocket(upstreamUrl)

                // Wait for connection and ready message
                const rpc = await new Promise<WebsocketRpc>(
                    (resolve, reject) => {
                        const handleOpen = () => {
                            console.log(
                                `Connected to upstream tunnel with ID: ${websocketId}`,
                            )

                            // Send ready message after WebSocket opens
                            const rpc = createWebsocketHandling({ ws: ws! })
                            const handleMessageReady = (
                                event: MessageEvent,
                            ) => {
                                try {
                                    const data = JSON.parse(event.data)
                                    if (data.type === 'ready') {
                                        const elapsed = Date.now() - start
                                        console.log(
                                            `Framer plugin is ready, connection established in ${(elapsed / 1000).toFixed(2)}s`,
                                        )
                                        // Remove the message listener since we only need it once
                                        ws!.removeEventListener(
                                            'message',
                                            handleMessageReady,
                                        )
                                        resolve(rpc)
                                    }
                                } catch {
                                    // Ignore parse errors
                                }
                            }
                            ws!.addEventListener('message', handleMessageReady)

                            rpc.send({
                                payload: { type: 'ready' },
                            })
                        }

                        const handleError = (err: Event) => {
                            console.error('Upstream WebSocket Error:', err)
                            reject(err)
                        }

                        ws!.addEventListener('open', handleOpen, { once: true })
                        ws!.addEventListener('error', handleError, {
                            once: true,
                        })
                    },
                )

                // Set up persistent event listeners
                ws.addEventListener('close', () => {
                    console.log('Upstream WebSocket closed')

                    // Attempt reconnection if server is not stopped
                    if (!isServerStopped) {
                        console.log(
                            `Attempting reconnection in ${reconnectDelay}ms`,
                        )
                        reconnectTimeout = setTimeout(() => {
                            clientConnectedPromise = connectWebSocket().catch(
                                (err) => {
                                    console.error('Reconnection failed:', err)
                                    throw err
                                },
                            )
                        }, reconnectDelay)
                    }
                })

                ws.addEventListener('error', (err) => {
                    console.error('Upstream WebSocket Error:', err)
                })

                return rpc
            } catch (error) {
                console.error('Failed to connect WebSocket:', error)

                // Attempt reconnection if server is not stopped
                if (!isServerStopped) {
                    console.log(
                        `Attempting reconnection in ${reconnectDelay}ms`,
                    )
                    reconnectTimeout = setTimeout(() => {
                        clientConnectedPromise = connectWebSocket().catch(
                            (err) => {
                                console.error('Reconnection failed:', err)
                                throw err
                            },
                        )
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
                try {
                    const rpc = await clientConnectedPromise

                    const { name, arguments: args = {} } = request.params
                    const reply = await rpc.send({
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
                } catch (error) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'The Framer app plugin is not connected. Please ensure the Framer plugin is open and connected.',
                            },
                        ],
                    }
                }
            },
        )

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
            resources: [
                {
                    title: `How to write Framer code components files in TypeScript`,
                    // name: 'framer-code-component',
                    uri: codeComponentsResourceUri,
                    description: `Prompt explaining how to write code components for Framer. ALWAYS read this resource before calling createCodeFile or updateCodeFile`,
                },
            ],
        }))

        server.setRequestHandler(
            ReadResourceRequestSchema,
            async (request: ReadResourceRequest) => {
                if (request.params.uri === codeComponentsResourceUri) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: codeComponentsResourceMarkdown,
                            },
                        ],
                    }
                }
                return {
                    error: {
                        message: `Resource with uri ${request.params.uri} not found`,
                        code: 'NOT_FOUND',
                    },
                }
            },
        )

        server.onclose = () => {
            console.log('Server closed, cleaning up...')
            stop()
            // this.ctx.storage.deleteAll()
        }
    }
}


export default {
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url)

        const id = url.searchParams.get('id') as string | undefined
        const secret = url.searchParams.get('secret') as string | undefined
        ctx.props = {
            websocketId: id,
            secret,
        }
        if (url.pathname === '/sse' || url.pathname === '/sse/message') {
            const mcp = MyMCP.serveSSE('/sse')

            return mcp.fetch(request, env, ctx)
        }

        if (url.pathname === '/mcp') {
            return MyMCP.serve('/mcp').fetch(request, env, ctx)
        }

        return new Response('Not found', { status: 404 })
    },
}
