import { McpAgent } from 'agents/mcp'
import { createServerClient, parse, serialize } from '@supabase/ssr'
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { OAuthProvider } from '@cloudflare/workers-oauth-provider'
import { createClient } from '@supabase/supabase-js'
import * as cookie from 'cookie'
import codeComponentsResourceMarkdown from './prompts/how-to-write-framer-code-files.md'
import { codeComponentsResourceUri, mcpTools } from './lib/schema.js'
import { WebsocketRpc, createWebsocketHandling } from './lib/mcp-websocket.js'
import { sleep } from './lib/utils.js'
import { KnownError, notifyError } from './lib/errors.js'

// Helper to return text responses from tools
const textResponse = (text: string) => ({
    content: [{ type: 'text' as const, text }],
})

// Helper to create Supabase client with headers
interface SupabaseSessionArgs {
    request: Request
    env: Env
    response?: Response
}

function getSupabaseWithHeaders({
    request,
    env,
    response,
}: SupabaseSessionArgs) {
    const cookies = parse(request.headers.get('Cookie') ?? '')
    const headers = response?.headers
        ? new Headers(response.headers)
        : new Headers()

    const supabase = createServerClient(
        env.PUBLIC_SUPABASE_URL!,
        env.PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(key) {
                    return cookies[key]
                },
                set(key, value, options) {
                    headers.append('Set-Cookie', serialize(key, value, options))
                },
                remove(key, options) {
                    headers.append('Set-Cookie', serialize(key, '', options))
                },
            },
            auth: {
                detectSessionInUrl: true,
                flowType: 'pkce',
            },
        },
    )

    return { supabase, headers }
}

// OAuth handler for non-authenticated requests
const defaultHandler = {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const provider = env.OAUTH_PROVIDER
        const url = new URL(request.url)

        // Handle OAuth authorization
        if (url.pathname === '/authorize') {
            const oauthReq = await provider.parseAuthRequest(request)

            // Store OAuth request info for later
            const stateId = crypto.randomUUID()
            await env.OAUTH_KV.put(
                `oauth:${stateId}`,
                JSON.stringify({
                    oauthReq,
                    timestamp: Date.now(),
                }),
                { expirationTtl: 600 },
            ) // 10 minute expiration

            const { supabase, headers } = getSupabaseWithHeaders({
                request,
                env,
            })
            const redirectTo = new URL('/callback', url).toString()
            console.log(`redirecting to callback and then to ${redirectTo}`)
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',

                options: {
                    skipBrowserRedirect: true,
                    queryParams: {
                        prompt: 'select_account',
                    },

                    redirectTo,
                },
            })

            if (error || !data?.url) {
                notifyError(error, 'Failed to generate Google OAuth URL')
                return new Response(
                    'Failed to initiate OAuth. Please try again.',
                    { status: 500 },
                )
            }

            // Set stateId in cookie and redirect
            // IMPORTANT: Set our oauth_state cookie AFTER Supabase has set its cookies
            headers.append(
                'Set-Cookie',
                cookie.serialize('oauth_state', stateId, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    maxAge: 600, // 10 minutes
                    path: '/',
                }),
            )
            headers.append('Location', data.url)

            return new Response(null, {
                status: 302,
                headers,
            })
        }

        // Handle OAuth callback
        if (url.pathname === '/callback') {
            const code = url.searchParams.get('code')

            if (!code) {
                return new Response('Missing code', { status: 400 })
            }

            // Get stateId from cookie
            const cookies = cookie.parse(request.headers.get('Cookie') || '')
            const stateId = cookies.oauth_state

            if (!stateId) {
                return new Response('Missing state cookie', { status: 400 })
            }

            // Retrieve stored OAuth request
            const stored = await env.OAUTH_KV.get(`oauth:${stateId}`)
            if (!stored) {
                return new Response('Invalid or expired state', { status: 400 })
            }

            const { oauthReq } = JSON.parse(stored)
            await env.OAUTH_KV.delete(`oauth:${stateId}`)

            // Create Supabase client with headers
            const { supabase, headers } = getSupabaseWithHeaders({
                request,
                env,
            })

            // Exchange code for session
            const { data: sessionData, error } =
                await supabase.auth.exchangeCodeForSession(code)

            if (error || !sessionData?.session) {
                notifyError(error, 'Failed to exchange code for session')
                return new Response(
                    `Authentication failed${error ? `: ${error.message || error}` : ''}`,
                    { status: 401 },
                )
            }

            const { user, session } = sessionData

            // Create MCP session in your website API
            const baseUrl = env.WEBSITE_URL
            const sessionResponse = await fetch(
                new URL('/api/mcp/create-session', baseUrl).toString(),
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        supabaseUserId: user.id,
                        email: user.email,
                        framerUserId: user.user_metadata?.framer_id || user.id,
                    }),
                },
            )

            if (!sessionResponse.ok) {
                const resText = await sessionResponse.text()
                return new Response(
                    `Failed to create MCP session: ${resText}`,
                    { status: 500 },
                )
            }

            const { sessionToken, framerUserId } =
                (await sessionResponse.json()) as {
                    sessionToken: string
                    framerUserId: string
                }

            // Complete OAuth flow
            const { redirectTo } = await provider.completeAuthorization({
                request: oauthReq,
                userId: framerUserId,
                metadata: {
                    email: user.email,
                    sessionToken,
                    framerUserId,
                },
                scope: oauthReq.scope || ['read', 'write'],
                props: {
                    framerUserId,
                },
            })

            // Clear the state cookie and redirect back to MCP client
            headers.append(
                'Set-Cookie',
                cookie.serialize('oauth_state', '', {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    maxAge: 0, // Delete cookie
                    path: '/',
                }),
            )
            headers.append('Location', redirectTo)

            return new Response(null, {
                status: 302,
                headers,
            })
        }

        // Handle direct resource URL access
        if (url.pathname === new URL(codeComponentsResourceUri).pathname) {
            return new Response(codeComponentsResourceMarkdown, {
                headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
            })
        }

        return new Response('Not Found', { status: 404 })
    },
}

export class MyMCP extends McpAgent<Env> {
    server = new Server(
        {
            name: 'Framer MCP',
            version: '1.8.0',
            title: 'Framer MCP, created by https://unframer.co',
        },
        {
            capabilities: {
                tools: {},
                prompts: {},
                resources: {},
            },
        },
    )

    onError(_: unknown, error?: unknown): void | Promise<void> {
        console.error('MyMCP initialization error:', error)
        notifyError(error, 'MyMCP onError')
    }

    async init() {
        try {
            const server = this.server

            // Get the framerUserId from the OAuth context
            const framerUserId = this.props?.framerUserId

            console.log(
                'Initializing MCP with authenticated framerUserId:',
                framerUserId,
            )

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

            const env = this.env
            const connectWebSocket = async (): Promise<WebsocketRpc> => {
                if (isServerStopped) {
                    console.log(
                        'Server is stopped, not attempting reconnection',
                    )
                    throw new Error('Server is stopped')
                }

                console.log(
                    `trying to connect to Websocket tunnel to get access to Framer app MCP with id ${framerUserId}`,
                )

                try {
                    const start = Date.now()
                    const baseUrl = new URL(env.WEBSITE_URL).host
                    const upstreamUrl = `wss://unfarmer.co/_tunnel/client?id=${framerUserId}`
                    ws = new WebSocket(upstreamUrl)

                    // Wait for connection and ready message with timeout
                    const rpc = await new Promise<WebsocketRpc>(
                        (resolve, reject) => {
                            // Set up 3 second timeout
                            const timeoutId = setTimeout(() => {
                                ws!.close()
                                reject(
                                    new Error(
                                        'Connection timeout: Make sure the Framer plugin is open in one of your projects. Ask user to open Framer, press cmd-k and search MCP. Open the MCP plugin and try again then.',
                                    ),
                                )
                            }, 3000)

                            const handleOpen = () => {
                                console.log(
                                    `Connected to upstream tunnel with ID: ${framerUserId}`,
                                )

                                // Send ready message after WebSocket opens
                                const rpc = createWebsocketHandling({ ws: ws! })
                                const handleMessageReady = (
                                    event: MessageEvent,
                                ) => {
                                    try {
                                        const data = JSON.parse(event.data)
                                        if (data.type === 'ready') {
                                            // IMPORTANT! every ready message is replied with another ready message from upstream. we know upstream is online if it replies to ready with ready
                                            // even if upstream was not already connected, it sends a ready message as soon as it connects so we can catch it
                                            clearTimeout(timeoutId)
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
                                clearTimeout(timeoutId)
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

            // Register list tools handler
            server.setRequestHandler(ListToolsRequestSchema, async () => {
                const tools = Object.entries(mcpTools).map(([name, tool]) => ({
                    name,
                    description: tool.description,
                    inputSchema: tool.input,
                }))
                return { tools }
            })

            // Register call tool handler
            server.setRequestHandler(CallToolRequestSchema, async (request) => {
                const { name, arguments: args } = request.params
                const tool = mcpTools[name as keyof typeof mcpTools]

                if (!tool) {
                    throw new Error(`Unknown tool: ${name}`)
                }

                try {
                    // Lazy connect - only establish WebSocket when needed
                    if (!clientConnectedPromise) {
                        clientConnectedPromise = connectWebSocket()
                    }

                    const rpc = await clientConnectedPromise

                    if (!rpc) {
                        throw new Error(
                            'Framer plugin failed to connect to MCP, no websocket client available',
                        )
                    }

                    const reply = await rpc.send({
                        payload: {
                            type: name as keyof typeof mcpTools,
                            input: (args as any) || {},
                        },
                    })

                    // Reset idle timeout after successful request
                    resetIdleTimeout()

                    const text =
                        typeof reply === 'string'
                            ? reply
                            : JSON.stringify(reply, null, 2)

                    return textResponse(text)
                } catch (error) {
                    notifyError(error, 'MCP tool')
                    const errorMessage =
                        error instanceof Error ? error.message : String(error)
                    return textResponse(`Encountered an error: ${errorMessage}`)
                }
            })

            // Register prompt handlers (empty for now, but expected by MCP clients)
            server.setRequestHandler(ListPromptsRequestSchema, async () => ({
                prompts: [],
            }))

            server.setRequestHandler(GetPromptRequestSchema, async () => {
                throw new Error('No prompts available')
            })

            // Register resources handlers
            server.setRequestHandler(ListResourcesRequestSchema, async () => ({
                resources: [
                    {
                        title: 'How to write Framer code components files in TypeScript',
                        name: 'How to write Framer code components files in TypeScript',
                        uri: codeComponentsResourceUri,
                        description:
                            'Prompt explaining how to write code components for Framer. ALWAYS read this resource before calling createCodeFile or updateCodeFile',
                    },
                ],
            }))

            server.setRequestHandler(
                ReadResourceRequestSchema,
                async (request) => {
                    if (request.params.uri === codeComponentsResourceUri) {
                        return {
                            contents: [
                                {
                                    text: codeComponentsResourceMarkdown,
                                    uri: codeComponentsResourceUri,
                                },
                            ],
                        }
                    }
                    throw new Error(
                        `Resource with uri ${request.params.uri} not found`,
                    )
                },
            )
        } catch (e) {
            notifyError(e, 'mcp init')
            throw e
        }
    }
}

// Export with OAuth provider wrapper
const oauthProvider = new OAuthProvider({
    apiHandlers: {
        '/mcp': MyMCP.serve('/mcp'),
    },
    defaultHandler: defaultHandler as ExportedHandler,
    authorizeEndpoint: '/authorize',
    tokenEndpoint: '/token',
    clientRegistrationEndpoint: '/register',
})

const handler = {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url)
        // Simple SSE endpoint that logs "hello" on connect
        if (url.pathname === '/sse' || url.pathname === '/sse/message') {
            const id = url.searchParams.get('id')
            const secret = url.searchParams.get('secret')

            if (!id || !secret) {
                // will show login page
                return new Response('Invalid session', { status: 401 })
            }
            // Legacy authentication mode - validate and set props
            const baseUrl = env.WEBSITE_URL
            const response = await fetch(
                new URL('/api/mcp/validate-session', baseUrl).toString(),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionToken: secret,
                    }),
                },
            )

            if (!response.ok) {
                return new Response('Invalid session', { status: 401 })
            }

            const data = (await response.json()) as {
                framerUserId: string
                websocketId: string
                userId: string
                email: string
            }

            // Set props for legacy mode
            ctx.props = {
                framerUserId: data.framerUserId || id,
                websocketId: id,
                secret,
            }

            // Call the SSE handler with legacy props
            return MyMCP.serveSSE('/sse').fetch(request, env, ctx)
        }
        return await oauthProvider.fetch(request, env, ctx)
    },
}
export default handler
