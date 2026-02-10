import { McpAgent } from 'agents/mcp'
import type {
    OAuthHelpers,
    AuthRequest,
} from '@cloudflare/workers-oauth-provider'

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
import {
    codeComponentsResourceUri,
    mcpTools,
    type McpToolDefinition,
} from './lib/schema.js'
import { WebsocketRpc, createWebsocketHandling } from './lib/mcp-websocket.js'
import { sleep } from './lib/utils.js'
import { KnownError, notifyError } from './lib/errors.js'
import dedent from 'string-dedent'
import { toJSONSchema } from 'zod'
import { createSpiceflowClient, type SpiceflowClient } from 'spiceflow/client'
import type { RouteType } from 'website/src/lib/spiceflow-plugins.server'

// Type for MCP props passed through OAuth or legacy auth
interface MCPProps extends Record<string, unknown> {
    framerUserId?: string
    email?: string
    secret: string
    clientId?: string
}

type MyEnv = Env & {
    OAUTH_PROVIDER: OAuthHelpers // your OAuth binding
    OAUTH_KV: KVNamespace // required for provider
    RATE_LIMITER: RateLimit // 500 requests per minute per IP
    PUBLIC_SUPABASE_URL: string
    PUBLIC_SUPABASE_ANON_KEY: string
    SERVICE_SECRET: string // to authenticate requests from Framer plugin
    WEBSITE_URL?: string // to call website API
    STAGE?: 'preview' | 'production'
}

// Helper to return text responses from tools
const textResponse = (text: string) => ({
    content: [{ type: 'text' as const, text }],
})

const html = dedent
const framerInstructions = `Make sure the Framer plugin is open in one of your projects. Ask user to open Framer, press cmd-k and search MCP. Open the MCP plugin and try again then.'`

// Helper to create spiceflow client for website API
function createWebsiteApiClient(env: MyEnv): SpiceflowClient.Create<RouteType> {
    const baseUrl = env.WEBSITE_URL || 'https://unframer.co'
    return createSpiceflowClient<RouteType>(baseUrl)
}

const SESSION_CACHE_TTL = 60 * 5 // 5 minutes

interface CachedSessionData {
    framerUserId: string
    email: string | undefined
    cachedAt: number
}

async function getValidatedSession({
    env,
    secret,
    id,
}: {
    env: MyEnv
    secret: string
    id: string
}): Promise<{ framerUserId: string; email: string | undefined } | null> {
    const cacheKey = `session-valid:${secret}`

    const cached = (await env.OAUTH_KV.get(
        cacheKey,
        'json',
    )) as CachedSessionData | null
    if (cached) {
        return { framerUserId: cached.framerUserId, email: cached.email }
    }
    const apiClient = createWebsiteApiClient(env)
    const { data, error } = await apiClient.api.plugins.mcp.validateSession.post(
        {
            sessionToken: secret,
        },
    )

    if (error) {
        return null
    }

    const cacheData: CachedSessionData = {
        framerUserId: data.framerUserId || id,
        email: data.email,
        cachedAt: Date.now(),
    }
    await env.OAUTH_KV.put(cacheKey, JSON.stringify(cacheData), {
        expirationTtl: SESSION_CACHE_TTL,
    })

    return { framerUserId: cacheData.framerUserId, email: cacheData.email }
}

// Helper to create Supabase client with headers
interface SupabaseSessionArgs {
    request: Request
    env: MyEnv
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
    async fetch(request: Request, env: MyEnv, ctx: ExecutionContext) {
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

            const { oauthReq }: { oauthReq: AuthRequest } = JSON.parse(stored)
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

            // Create MCP session using spiceflow client
            const apiClient = createWebsiteApiClient(env)
            const { data: sessionResult, error: sessionError } =
                await apiClient.api.plugins.mcp.createSession.post(
                    {
                        supabaseUserId: user.id,
                        email: user.email,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    },
                )

            // when user still has not logged in into Framer MCP
            if (sessionError && sessionError.status === 428) {
                return htmlForUserWithoutFramerUserId()
            }
            if (sessionError) {
                return new Response(
                    `Failed to create MCP session: ${sessionError.message}`,
                    { status: 500 },
                )
            }

            const { sessionToken, framerUserId } = sessionResult

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
                    email: user.email,
                    secret: sessionToken,
                    clientId: oauthReq.clientId,
                } satisfies MCPProps,
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

export class MyMCP extends McpAgent<MyEnv, {}, MCPProps> {
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
            const provider = this.env.OAUTH_PROVIDER
            // Get the framerUserId and email from the OAuth context
            const framerUserId = this.props?.framerUserId
            const userEmail = this.props?.email

            const secret = this.props?.secret
            if (!secret) {
                throw new Error(`Missing MCP secret prop`)
            }

            console.log(`MCP init for ${framerUserId} (${userEmail})`)
            // const apiClient = createWebsiteApiClient(this.env)
            // const { data: data, error: validationError } =
            //     await apiClient.api.plugins.mcp.validateSession.post({
            //         sessionToken: secret,
            //     })

            // if (validationError) {
            //     throw new Error('Invalid session')
            // }

            let ws: WebSocket | null = null
            let isServerStopped = false
            let idleTimeout: ReturnType<typeof setTimeout> | null = null
            // Longer idle timeout reduces DO wake-ups between tool call bursts, saving on DO invocation + SQLite init costs
            const idleTimeoutDelay = 30 * 1000
            let pendingToolCalls = 0

            const resetIdleTimeout = () => {
                if (idleTimeout) {
                    clearTimeout(idleTimeout)
                }
                idleTimeout = setTimeout(() => {
                    if (pendingToolCalls > 0) {
                        resetIdleTimeout()
                        return
                    }
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.close(1000, 'Idle timeout')
                    }
                    clientConnectedPromise = null
                }, idleTimeoutDelay)
            }

            const env = this.env
            const connectWebSocket = async (): Promise<WebsocketRpc> => {
                if (isServerStopped) {
                    throw new Error('Server is stopped')
                }

                try {
                    const start = Date.now()
                    const baseUrlHost =
                        env.STAGE === 'preview'
                            ? 'preview.unframer.co'
                            : 'unframer.co'
                    const upstreamUrl = `wss://${baseUrlHost}/_tunnel/client?id=${framerUserId}`
                    ws = new WebSocket(upstreamUrl)

                    // Wait for first message with timeout
                    const rpc = await new Promise<WebsocketRpc>(
                        (resolve, reject) => {
                            if (!ws)
                                throw new Error('WebSocket not initialized')
                            // Set up 5 second timeout for first message
                            const timeoutId = setTimeout(() => {
                                ws?.close()
                                reject(
                                    new Error(
                                        `Connection timeout: ${framerInstructions}`,
                                    ),
                                )
                            }, 8000)

                            let rpc: WebsocketRpc | null = null
                            let readySentTime: number

                            const handleError = (err: Event) => {
                                clearTimeout(timeoutId)
                                reject(err)
                            }

                            ws.addEventListener(
                                'close',
                                (event) => {
                                    if (idleTimeout) {
                                        clearTimeout(idleTimeout)
                                        idleTimeout = null
                                    }
                                    clearTimeout(timeoutId)

                                    clientConnectedPromise = null
                                    if (event.code === 4008) {
                                        reject(
                                            new Error(
                                                `Upstream not connected for ${framerUserId} (email: ${userEmail}), Framer MCP plugin is not running. User should login with same Google account (${userEmail}) in both ends. ${framerInstructions}`,
                                            ),
                                        )
                                    } else {
                                        reject(
                                            new Error(
                                                `WebSocket closed early with code ${event.code}: ${event.reason || 'No reason provided'}`,
                                            ),
                                        )
                                    }
                                },
                                { once: true },
                            )

                            ws.addEventListener(
                                'open',
                                () => {
                                    // Create RPC handler
                                    rpc = createWebsocketHandling({ ws: ws! })

                                    // Send ready message
                                    readySentTime = Date.now()
                                    rpc.send({
                                        payload: { type: 'ready' },
                                    })
                                },
                                {
                                    once: true,
                                },
                            )
                            const handleFirstMessage = (
                                _event: MessageEvent,
                            ) => {
                                clearTimeout(timeoutId)
                                const elapsed = Date.now() - start
                                console.log(`WS connected to ${framerUserId} in ${elapsed}ms`)
                                resolve(rpc!)
                            }
                            ws.addEventListener('message', handleFirstMessage)
                            ws.addEventListener('error', handleError, {
                                once: true,
                            })

                            ws.addEventListener('error', (err) => {
                                console.error(`WS error for ${framerUserId}:`, err.type)
                            })

                            // Reset idle timeout on any message activity
                            ws.addEventListener('message', () => {
                                resetIdleTimeout()
                            })
                        },
                    )

                    // Set up persistent event listeners
                    // Start idle timeout on successful connection
                    resetIdleTimeout()

                    return rpc
                } catch (error) {
                    notifyError(error, 'connectWebSocket')
                    // Attempt reconnection if server is not stopped
                    // Don't auto-reconnect on error - wait for next request
                    clientConnectedPromise = null

                    throw error
                }
            }

            let clientConnectedPromise: Promise<WebsocketRpc> | null = null

            // Graceful shutdown
            const stop = () => {
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

            server.setRequestHandler(ListToolsRequestSchema, async () => {
                const tools = Object.entries(mcpTools).map(([name, tool]) => {
                    const schema = toJSONSchema(tool.input) as any
                    // Remove the $schema field as it's not needed for MCP
                    delete schema.$schema
                    return {
                        name,
                        description: tool.description,
                        inputSchema: schema,
                    }
                })
                return { tools }
            })

            server.setRequestHandler(CallToolRequestSchema, async (request) => {
                const { name, arguments: args } = request.params
                const tool = mcpTools[
                    name as keyof typeof mcpTools
                ] as McpToolDefinition

                if (!tool) {
                    throw new Error(`Unknown tool: ${name}`)
                }

                pendingToolCalls++
                try {
                    if (
                        !clientConnectedPromise ||
                        ws?.readyState === WebSocket.CLOSED
                    ) {
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

                    const text =
                        typeof reply === 'string'
                            ? reply
                            : JSON.stringify(reply, null, 2)
                    const prefixedText = tool.outputPrefix
                        ? `${tool.outputPrefix?.trim()}\n\n${text}`
                        : text

                    return textResponse(prefixedText)
                } catch (error) {
                    notifyError(error, 'MCP tool')
                    const errorMessage =
                        error instanceof Error ? error.message : String(error)
                    return textResponse(`Encountered an error: ${errorMessage}`)
                } finally {
                    pendingToolCalls--
                    resetIdleTimeout()
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
    // accessTokenTTL: 60 * 60 * 24 * 7,

    clientRegistrationEndpoint: '/register',
})

const handler = {
    async fetch(request: Request, env: MyEnv, ctx: ExecutionContext) {
        const url = new URL(request.url)

        // Rate limit by IP: 500 requests per minute
        const ip = request.headers.get('cf-connecting-ip') || 'unknown'
        const { success } = await env.RATE_LIMITER.limit({ key: ip })
        if (!success) {
            return new Response('Rate limit exceeded', { status: 429 })
        }

        // https://mcp.preview.unframer.co/htmlForUserWithoutFramerUserId
        // http://localhost:8787/htmlForUserWithoutFramerUserId
        if (url.pathname === '/htmlForUserWithoutFramerUserId') {
            return htmlForUserWithoutFramerUserId()
        }

        // Legacy SSE transport with query-based auth
        if (url.pathname === '/sse' || url.pathname === '/sse/message') {
            
            const id = url.searchParams.get('id')
            const secret = url.searchParams.get('secret')

            if (!id || !secret) {
                return new Response('Invalid session', { status: 401 })
            }

            const sessionData = await getValidatedSession({ env, secret, id })
            if (!sessionData) {
                return new Response('Invalid session', { status: 401 })
            }

            ctx.props = {
                framerUserId: sessionData.framerUserId,
                secret,
                email: sessionData.email,
            } satisfies MCPProps

            return MyMCP.serveSSE('/sse').fetch(request, env, ctx)
        }

        // HTTP Streamable transport with query-based auth (bypass OAuth)
        if (url.pathname === '/mcp' || url.pathname.startsWith('/mcp')) {
            const id = url.searchParams.get('id')
            const secret = url.searchParams.get('secret')

            if (id && secret) {
                const sessionData = await getValidatedSession({ env, secret, id })
                if (!sessionData) {
                    return new Response('Invalid session', { status: 401 })
                }

                ctx.props = {
                    framerUserId: sessionData.framerUserId,
                    secret,
                    email: sessionData.email,
                } satisfies MCPProps

                return MyMCP.serve('/mcp', { binding: 'MCP_OBJECT' }).fetch(
                    request,
                    env,
                    ctx,
                )
            }
            // Fall through to OAuth provider for token-based auth
        }

        return await oauthProvider.fetch(request, env, ctx)
    },
}
function htmlForUserWithoutFramerUserId() {
    return new Response(
        html`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    />
                    <title>Framer MCP Plugin Required</title>
                    <style>
                        html,
                        body {
                            height: 100%;
                            margin: 0;
                            padding: 0;
                        }
                        body {
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: #f7f7f8;
                            color: #222;
                            font-family: system-ui, sans-serif;
                        }
                        .container {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            max-width: 600px;
                            width: 100%;
                            padding: 24px;
                            box-sizing: border-box;
                        }
                        h1 {
                            font-size: 2.2rem;
                            margin-bottom: 1.4rem;
                            font-weight: 700;
                            letter-spacing: -0.01em;
                            text-wrap: balance;
                            text-align: center;
                        }
                        p {
                            font-size: 1.1rem;
                            margin: 0 0 0.9em 0;
                            color: #444;
                            text-wrap: pretty;
                            text-align: center;
                        }
                        a {
                            color: #2575ef;
                            text-decoration: none;
                            word-break: break-all;
                        }
                        a:hover {
                            text-decoration: underline;
                        }

                        ol {
                            padding-left: 1.25em;
                        }
                        li {
                            margin-bottom: 1em;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Framer MCP Plugin Not Open</h1>
                        <ol>
                            <li>
                                <a
                                    href="https://www.framer.com/marketplace/plugins/mcp/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    >Open the Framer MCP plugin</a
                                >
                                inside the Framer app or website.
                            </li>
                            <li>
                                Sign in inside the plugin using the
                                <b>same Google account</b> you use here.
                            </li>
                            <li>
                                Return to this page and log in again with MCP.
                            </li>
                        </ol>
                    </div>
                </body>
            </html>
        `,
        {
            status: 428,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
    )
}

export default handler
