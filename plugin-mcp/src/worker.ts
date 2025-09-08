import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import codeComponentsResourceMarkdown from './prompts/how-to-write-framer-code-files.md'
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
import { codeComponentsResourceUri, mcpTools } from './lib/schema.js'
import { WebsocketRpc, createWebsocketHandling } from './lib/mcp-websocket.js'
import { sleep } from './lib/utils.js'
import { KnownError, notifyError } from './lib/errors.js'

export class MyMCP extends McpAgent<Env> {
    server = new Server(
        {
            name: 'Framer MCP',
            version: '1.8.0',
            title: `Framer MCP, created by https://unframer.co`,
        },
        {
            capabilities: {
                tools: {},
                prompts: {},
                resources: {},
            },
        },
    )

    onError(error: Error): { status: number; message: string } {
        return {
            status: 500,
            message: `Error initializing MCP: ${error instanceof Error ? error.message : String(error)}`,
        }
    }

    async init() {
        try {
            const server = this.server
            const websocketId = this.props?.websocketId as string
            const secret = (this.props?.secret as string) || ''

            if (!websocketId) {
                throw new KnownError('websocketId ?id search param is required')
            }

            if (!secret) {
                throw new KnownError(
                    'secret ?secret search param is required for authentication',
                )
            }

            console.log(
                'Initializing MyMCP with websocketId:',
                websocketId,
                'sessionId:',
                secret.slice(0, 6),
            )
            if (!secret) {
                throw new KnownError('secret param is required in MCP')
            }

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
                const error = new Error(
                    `Session validation failed: ${data.error}`,
                )
                throw error
            }

            console.log('Session validated successfully')

            let ws: WebSocket | null = null
            let isServerStopped = false
            let idleTimeout: ReturnType<typeof setTimeout> | null = null
            const idleTimeoutDelay = 9 * 1000

            // Reset idle timeout helper function
            const resetIdleTimeout = () => {
                if (idleTimeout) {
                    clearTimeout(idleTimeout)
                }
                idleTimeout = setTimeout(() => {
                    console.log('Closing WebSocket due to inactivity')
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.close(1000, 'Idle timeout')
                    }
                    clientConnectedPromise = null
                }, idleTimeoutDelay)
            }

            const connectWebSocket = async (): Promise<WebsocketRpc> => {
                if (isServerStopped) {
                    console.log(
                        'Server is stopped, not attempting reconnection',
                    )
                    throw new Error('Server is stopped')
                }

                console.log(
                    `trying to connect to Websocket tunnel to get access to Framer app MCP with id ${websocketId}`,
                )

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
                                ws!.addEventListener(
                                    'message',
                                    handleMessageReady,
                                )

                                rpc.send({
                                    payload: { type: 'ready' },
                                })
                            }

                            const handleError = (err: Event) => {
                                reject(err)
                            }

                            ws!.addEventListener('open', handleOpen, {
                                once: true,
                            })
                            ws!.addEventListener('error', handleError, {
                                once: true,
                            })
                        },
                    )

                    // Set up persistent event listeners
                    // Start idle timeout on successful connection
                    resetIdleTimeout()

                    ws.addEventListener('close', () => {
                        console.log('Upstream WebSocket closed')

                        if (idleTimeout) {
                            clearTimeout(idleTimeout)
                            idleTimeout = null
                        }

                        // Don't auto-reconnect - wait for next request
                        clientConnectedPromise = null
                    })

                    ws.addEventListener('error', (err) => {
                        notifyError(
                            new Error('Upstream WebSocket Error'),
                            'WebSocket error occurred',
                        )
                    })

                    // Reset idle timeout on any message activity
                    ws.addEventListener('message', () => {
                        resetIdleTimeout()
                    })

                    return rpc
                } catch (error) {
                    // Attempt reconnection if server is not stopped
                    // Don't auto-reconnect on error - wait for next request
                    clientConnectedPromise = null

                    throw error
                }
            }

            let clientConnectedPromise: Promise<WebsocketRpc> | null = null

            // Graceful shutdown
            const stop = () => {
                console.log('\n⏹ shutting down…')
                isServerStopped = true

                // Clear any pending timeout
                if (idleTimeout) {
                    clearTimeout(idleTimeout)
                    idleTimeout = null
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
                        // Create a timeout promise that returns an error after 2 seconds
                        const timeoutPromise = sleep(3000).then(() => {
                            return new Error(
                                'Connection timeout: Make sure the Framer plugin is open in one of your projects',
                            )
                        })

                        // Lazy connect - only establish WebSocket when needed
                        if (!clientConnectedPromise) {
                            clientConnectedPromise = connectWebSocket()
                        }

                        // Race between the connection promise and timeout
                        const result = await Promise.race([
                            clientConnectedPromise,
                            timeoutPromise,
                        ])

                        // Check if the result is an error
                        if (result instanceof Error) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: result.message,
                                    },
                                ],
                            }
                        }

                        const rpc = result as WebsocketRpc
                        if (!rpc)
                            throw new Error(
                                'Framer plugin failed to connect to MCP, no websocket client available',
                            )
                        const { name, arguments: args = {} } = request.params
                        const reply = await rpc.send({
                            payload: { type: name as any, input: args as any },
                        })

                        // Reset idle timeout after successful request
                        resetIdleTimeout()
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
                        notifyError(error, 'MCP tool')
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text:
                                        `Encountered an error: ` +
                                        (error?.message || String(error)),
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
                    throw new KnownError(`No prompts available`)
                },
            )

            // Resources handlers - return empty array
            server.setRequestHandler(ListResourcesRequestSchema, async () => ({
                resources: [
                    {
                        title: `How to write Framer code components files in TypeScript`,
                        name: 'How to write Framer code components files in TypeScript',

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
        } catch (e) {
            notifyError(e, 'mcp init')
            throw e
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

        if (url.pathname === new URL(codeComponentsResourceUri).pathname) {
            return new Response(codeComponentsResourceMarkdown, {
                headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
            })
        }

        return new Response('Not found', { status: 404 })
    },
}
