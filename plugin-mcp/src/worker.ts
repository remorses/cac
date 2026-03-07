/**
 * MCP Worker — lightweight replacement for the agents-based McpAgent.
 *
 * Architecture:
 * - One Worker handles all HTTP routes + tunnel WebSocket upgrades.
 * - One Durable Object (McpTunnel) per framerUserId combines:
 *   1. WebSocket tunnel relay (inherited from cloudflare-tunnel's Tunnel class)
 *      with hibernation support — plugin connects as upstream, zero compute when idle.
 *   2. MCP protocol handling via @modelcontextprotocol/sdk Server +
 *      WebStandardStreamableHTTPServerTransport (stateless, Web Standard APIs).
 *   3. RPC-style send-and-wait for tool calls: sends to upstream plugin WS,
 *      intercepts responses in webSocketMessage() via pendingRequests map.
 *
 * Why this is cheaper than the previous agents-based approach:
 * - No SQLite tables (agents creates 5 per DO)
 * - No outbound WebSocket (plugin connects directly to this DO)
 * - WebSocket hibernation (DO sleeps between requests, auto-responds to pings)
 * - 1 DO per framerUserId instead of 1 per MCP session
 * - 1 Worker instead of 2 (no separate tunnel worker for unframer.co)
 *
 * Auth: query params only (?id=X&secret=Y), validated via KV-cached website API call.
 * OAuth was removed — nobody was using it.
 *
 * ┌──────────────────────────────────────┐
 * │         MCP Client (Claude, etc.)    │
 * │                                      │
 * │  POST /mcp?id=USER&secret=TOKEN      │
 * └──────────────┬───────────────────────┘
 *                │ HTTP
 *                ▼
 * ┌──────────────────────────────────────────────────────────────┐
 * │                                                              │
 * │  Worker  (mcp.unframer.co)                                   │
 * │                                                              │
 * │  fetch():                                                    │
 * │    1. Rate limit by IP                                       │
 * │    2. Validate auth (id+secret → KV-cached website API)      │
 * │    3. Route based on path:                                   │
 * │                                                              │
 * │    /_tunnel/*  → handleTunnelFetch() → DO.fetch(WS upgrade)  │
 * │    /mcp        → DO.fetch(HTTP request)                      │
 * │    /sse        → DO.fetch(HTTP request, rewrite to /mcp)     │
 * │                                                              │
 * └──────────┬─────────────────────────────────┬─────────────────┘
 *            │                                 │
 *            │  HTTP (tool calls)              │  WebSocket upgrade
 *            ▼                                 ▼
 * ┌──────────────────────────────────────────────────────────────┐
 * │                                                              │
 * │  McpTunnel Durable Object  (one per framerUserId)            │
 * │  extends Tunnel from cloudflare-tunnel library               │
 * │                                                              │
 * │  INHERITED from Tunnel:                                      │
 * │  • WebSocket hibernation (zero compute when idle)            │
 * │  • Auto ping/pong response (never wakes the DO)              │
 * │  • acceptWebSocket() with role tags: up:ID, down:ID          │
 * │  • Message relay: upstream ↔ downstream                      │
 * │                                                              │
 * │  ADDED by McpTunnel:                                         │
 * │  • fetch() override: WS → tunnel, HTTP → MCP handler        │
 * │  • handleMcpRequest(): MCP SDK Server + transport            │
 * │  • sendToUpstream(): RPC via ctx.getWebSockets('up:ID')      │
 * │  • webSocketMessage() override: intercept RPC responses      │
 * │                                                              │
 * │  NO SQLite. NO outbound WebSocket. NO persistent storage.    │
 * │                                                              │
 * └──────────────────────────────────┬───────────────────────────┘
 *                                    │
 *                                    │ WebSocket (hibernation-aware)
 *                                    │ wss://mcp.unframer.co/_tunnel/upstream?id=USER
 *                                    │ Pings auto-responded (never wakes DO)
 *                                    ▼
 * ┌──────────────────────────────────────┐
 * │     Framer Plugin  (browser tab)     │
 * │                                      │
 * │  Connects as "upstream" WebSocket    │
 * │  Receives RPC: {id, payload}         │
 * │  Calls framer SDK to execute tool    │
 * │  Sends response: {id, payload}       │
 * └──────────────────────────────────────┘
 *
 * Tool call flow:
 *
 * Claude              Worker            McpTunnel DO            Plugin
 *   │                   │                    │                    │
 *   │ POST /mcp         │                    │                    │
 *   │ {tools/call}      │                    │                    │
 *   ├──────────────────►│                    │                    │
 *   │                   │ validate auth      │                    │
 *   │                   │ DO.fetch(HTTP)     │                    │
 *   │                   ├───────────────────►│                    │
 *   │                   │                    │ MCP SDK Server     │
 *   │                   │                    │ sendToUpstream()   │
 *   │                   │                    │ {id:abc, payload}  │
 *   │                   │                    ├───────────────────►│
 *   │                   │                    │  (DO hibernates)   │ executes tool
 *   │                   │                    │ {id:abc, output}   │
 *   │                   │                    │◄───────────────────┤
 *   │                   │                    │ resolve promise    │
 *   │                   │ HTTP response      │                    │
 *   │                   │◄───────────────────┤                    │
 *   │ SSE: tool result  │                    │                    │
 *   │◄──────────────────┤                    │                    │
 */

import { Tunnel, handleTunnelFetch, addCors } from './lib/tunnel.js'
import type { Attachment } from './lib/tunnel.js'
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import codeComponentsResourceMarkdown from './prompts/how-to-write-framer-code-files.md'
import {
    codeComponentsResourceUri,
    mcpTools,
    type McpToolDefinition,
} from './lib/schema.js'
import type { WebsocketMessage } from './lib/mcp-websocket.js'
import { notifyError } from './lib/errors.js'
import dedent from 'string-dedent'
import { toJSONSchema } from 'zod'
import { createSpiceflowClient, type SpiceflowClient } from 'spiceflow/client'
import type { RouteType } from 'website/src/lib/spiceflow-plugins.server'

type McpEnv = Env & {
    MCP_TUNNEL: DurableObjectNamespace
    SESSION_KV: KVNamespace
    RATE_LIMITER: RateLimit
    SERVICE_SECRET: string
    WEBSITE_URL?: string
    STAGE?: 'preview' | 'production'
}

const html = dedent
const framerInstructions = `Make sure the Framer plugin is open in one of your projects. Ask user to open Framer, press cmd-k and search MCP. Open the MCP plugin and try again then.`

/* ─────────────── Session validation with KV cache ─────────────── */

function createWebsiteApiClient(env: McpEnv): SpiceflowClient.Create<RouteType> {
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
    env: McpEnv
    secret: string
    id: string
}): Promise<{ framerUserId: string; email: string | undefined } | null> {
    const cacheKey = `session-valid:${secret}`

    const cached = (await env.SESSION_KV.get(
        cacheKey,
        'json',
    )) as CachedSessionData | null
    if (cached) {
        return { framerUserId: cached.framerUserId, email: cached.email }
    }
    const apiClient = createWebsiteApiClient(env)
    const { data, error } =
        await apiClient.api.plugins.mcp.validateSession.post({
            sessionToken: secret,
        })

    if (error) {
        return null
    }

    const cacheData: CachedSessionData = {
        framerUserId: data.framerUserId || id,
        email: data.email,
        cachedAt: Date.now(),
    }
    await env.SESSION_KV.put(cacheKey, JSON.stringify(cacheData), {
        expirationTtl: SESSION_CACHE_TTL,
    })

    return { framerUserId: cacheData.framerUserId, email: cacheData.email }
}

/* ─────────────── MCP tool helpers ─────────────── */

const textResponse = (text: string) => ({
    content: [{ type: 'text' as const, text }],
})

/* ─────────────── McpTunnel Durable Object ─────────────── */

/**
 * Extends the generic Tunnel DO with MCP protocol handling.
 *
 * - Plugin connects as upstream WebSocket (hibernation-aware, zero compute when idle).
 * - MCP requests arrive as plain HTTP (POST /mcp), forwarded by the Worker.
 * - Tool calls are sent to the upstream plugin WS as RPC messages and awaited.
 * - webSocketMessage() intercepts upstream responses matching pending RPC IDs.
 */
export class McpTunnel extends Tunnel<McpEnv> {
    /**
     * Pending RPC requests waiting for a response from the upstream plugin.
     * Key is the message id, value is the resolve/reject/timeout for the promise.
     */
    private pendingRequests = new Map<
        string,
        {
            resolve: (value: unknown) => void
            reject: (error: Error) => void
            timeout: ReturnType<typeof setTimeout>
        }
    >()

    /**
     * Active legacy SSE streams keyed by sessionId.
     * GET /sse creates the stream, POST /sse/message writes responses back through it.
     */
    private sseStreams = new Map<
        string,
        {
            writer: WritableStreamDefaultWriter<Uint8Array>
            encoder: TextEncoder
        }
    >()

    override async fetch(req: Request): Promise<Response> {
        // WebSocket upgrade → delegate to Tunnel base (handles upstream/downstream/multiplexer)
        if (req.headers.get('Upgrade') === 'websocket') {
            return super.fetch(req)
        }

        const url = new URL(req.url)

        // Legacy SSE transport: GET /sse opens the stream, POST /sse/message sends messages
        if (url.pathname === '/sse' && req.method === 'GET') {
            return this.handleSseGet(req)
        }
        if (url.pathname === '/sse/message' && req.method === 'POST') {
            return this.handleSseMessage(req)
        }

        // Streamable HTTP transport (POST /mcp, GET /mcp, etc.)
        return this.handleMcpRequest(req)
    }

    /**
     * Intercept upstream (plugin) messages: if it matches a pending RPC request,
     * resolve the promise instead of relaying to downstream clients.
     */
    override async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
        if (typeof message === 'string') {
            const attachment = ws.deserializeAttachment() as Attachment | undefined
            if (attachment?.role === 'up') {
                let parsed: WebsocketMessage | undefined
                try {
                    parsed = JSON.parse(message)
                } catch {
                    // not JSON, fall through to tunnel relay
                }

                // Echo 'ready' back to upstream so the plugin sets isConnected = true.
                // Only ACK once per upstream socket to avoid an infinite ping-pong loop:
                // plugin sends ready → DO echoes ready → plugin receives ready → plugin sends ready → ...
                const isReady = parsed?.payload?.type === 'ready' || (parsed as Record<string, unknown>)?.type === 'ready'
                if (isReady) {
                    const att = attachment as Attachment & { readyAcked?: boolean }
                    if (!att.readyAcked) {
                        ws.send(JSON.stringify({ payload: { type: 'ready' } }))
                        ws.serializeAttachment({ ...att, readyAcked: true })
                    }
                    return
                }

                if (parsed?.id && this.pendingRequests.has(parsed.id)) {
                    const pending = this.pendingRequests.get(parsed.id)!
                    this.pendingRequests.delete(parsed.id)
                    clearTimeout(pending.timeout)

                    if (parsed.error) {
                        pending.reject(new Error(parsed.error))
                    } else {
                        pending.resolve(parsed.payload?.output ?? null)
                    }
                    return // consumed, don't relay to other downstream clients
                }
            }
        }

        // Not a pending RPC response → normal tunnel relay
        return super.webSocketMessage(ws, message)
    }

    /**
     * When upstream closes, reject all pending requests so callers don't hang.
     */
    override async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
        const attachment = ws.deserializeAttachment() as Attachment | undefined
        if (attachment?.role === 'up') {
            for (const [id, pending] of this.pendingRequests) {
                clearTimeout(pending.timeout)
                pending.reject(new Error(`Plugin disconnected (code ${code})`))
            }
            this.pendingRequests.clear()
        }

        return super.webSocketClose(ws, code, reason, wasClean)
    }

    /**
     * Legacy SSE transport: GET /sse
     *
     * Opens an SSE stream and sends an `event: endpoint` with the POST URL.
     * The SSEClientTransport from the MCP SDK connects here first, then
     * POSTs JSON-RPC messages to the endpoint URL. Responses flow back
     * through this SSE stream.
     *
     * Protocol (from MCP SSE transport spec):
     * 1. Client GET /sse → server responds with text/event-stream
     * 2. Server sends: event: endpoint\ndata: /sse/message?sessionId=X\n\n
     * 3. Client POST /sse/message?sessionId=X with JSON-RPC body
     * 4. Server sends: event: message\ndata: {jsonrpc response}\n\n
     */
    private handleSseGet(req: Request): Response {
        const sessionId = crypto.randomUUID()
        const { readable, writable } = new TransformStream<Uint8Array>()
        const writer = writable.getWriter()
        const encoder = new TextEncoder()

        // Store the stream so POST /sse/message can write responses to it
        this.sseStreams.set(sessionId, { writer, encoder })

        // Clean up the SSE stream when the client disconnects (request aborted).
        // Without this, entries leak indefinitely in long-lived DOs.
        req.signal.addEventListener('abort', () => {
            this.cleanupSseSession(sessionId)
        })

        // Build the endpoint URL: same origin, path = /sse/message, with sessionId + original auth params
        const url = new URL(req.url)
        url.pathname = '/sse/message'
        url.searchParams.set('sessionId', sessionId)
        const endpointPath = url.pathname + url.search

        // Send the endpoint event immediately (tells the client where to POST)
        const endpointMessage = `event: endpoint\ndata: ${endpointPath}\n\n`
        writer.write(encoder.encode(endpointMessage))

        return addCors(new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        }))
    }

    private cleanupSseSession(sessionId: string) {
        const stream = this.sseStreams.get(sessionId)
        if (!stream) {
            return
        }
        this.sseStreams.delete(sessionId)
        stream.writer.close().catch(() => {})
    }

    /**
     * Legacy SSE transport: POST /sse/message?sessionId=X
     *
     * Receives a JSON-RPC message, creates a fresh MCP Server to handle it,
     * and sends responses back through the SSE stream opened by GET /sse.
     * Returns 202 Accepted (responses go via SSE, not the POST response body).
     */
    private async handleSseMessage(req: Request): Promise<Response> {
        const url = new URL(req.url)
        const sessionId = url.searchParams.get('sessionId')
        if (!sessionId) {
            return addCors(new Response('Missing sessionId', { status: 400 }))
        }

        const sseStream = this.sseStreams.get(sessionId)
        if (!sseStream) {
            return addCors(new Response('Session not found or SSE stream closed', { status: 404 }))
        }

        const framerUserId = url.searchParams.get('id') || 'unknown'

        let rawMessage: unknown
        try {
            rawMessage = await req.json()
        } catch {
            return addCors(new Response('Invalid JSON', { status: 400 }))
        }

        // Create a fresh MCP Server + transport to handle this message.
        // We use a custom transport that writes responses to the SSE stream
        // instead of the HTTP response body.
        const server = new Server(
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

        this.registerMcpHandlers(server, framerUserId)

        const transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: false,
        })

        await server.connect(transport)

        // Override the transport's send to write SSE events to our stored stream
        const originalSend = transport.send.bind(transport)
        transport.send = async (message, options) => {
            // Write the message as an SSE event to the GET /sse stream
            const { writer, encoder } = sseStream
            const sseEvent = `event: message\ndata: ${JSON.stringify(message)}\n\n`
            try {
                await writer.write(encoder.encode(sseEvent))
            } catch {
                // SSE stream closed, clean up
                this.cleanupSseSession(sessionId)
            }
            // Also call original send (which is a no-op for the POST response since we return 202)
            return originalSend(message, options)
        }

        // Feed the message to the transport as if it were a POST request
        // Build a synthetic request with proper headers for WorkerTransport
        const syntheticReq = new Request(req.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
            },
            body: JSON.stringify(rawMessage),
        })

        // handleRequest triggers onmessage → server processes → send() writes to SSE.
        // If the transport returns an error (invalid JSON-RPC, protocol error), surface it
        // instead of always returning 202.
        const transportResponse = await transport.handleRequest(syntheticReq)
        if (!transportResponse.ok) {
            return addCors(transportResponse)
        }

        // Drain the response body (transport returns an SSE stream for POST responses,
        // but we already wrote to our own SSE stream via the overridden send())
        await transportResponse.body?.cancel()

        return addCors(new Response('Accepted', { status: 202 }))
    }

    /**
     * Handle an MCP HTTP request using the MCP SDK Server + WorkerTransport.
     * Creates a fresh Server + transport per request (stateless mode).
     *
     * WorkerTransport (from agents/mcp) handles both Streamable HTTP (POST)
     * and SSE GET streams on the same endpoint, with proper CORS.
     */
    private async handleMcpRequest(req: Request): Promise<Response> {
        const url = new URL(req.url)
        // The framerUserId is passed as the 'id' search param by the worker
        const framerUserId = url.searchParams.get('id') || 'unknown'

        const server = new Server(
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

        this.registerMcpHandlers(server, framerUserId)

        const transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: false,
        })

        await server.connect(transport)

        return transport.handleRequest(req)
    }

    /**
     * Register all MCP protocol handlers on the server instance.
     * Tool calls are forwarded to the upstream plugin WebSocket via sendToUpstream().
     */
    private registerMcpHandlers(server: Server, framerUserId: string) {
        server.setRequestHandler(ListToolsRequestSchema, async () => {
            const tools = Object.entries(mcpTools).map(([name, tool]) => {
                const schema = toJSONSchema(tool.input) as Record<string, unknown>
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

            try {
                const reply = await this.sendToUpstream({
                    framerUserId,
                    payload: {
                        type: name as keyof typeof mcpTools,
                        input: (args || {}) as never,
                    },
                    timeout: 1000 * 30,
                })

                const text =
                    typeof reply === 'string'
                        ? reply
                        : JSON.stringify(reply, null, 2)
                const prefixedText = tool.outputPrefix
                    ? `${tool.outputPrefix.trim()}\n\n${text}`
                    : text

                return textResponse(prefixedText)
            } catch (error) {
                notifyError(error, 'MCP tool')
                const errorMessage =
                    error instanceof Error ? error.message : String(error)
                return textResponse(`Encountered an error: ${errorMessage}`)
            }
        })

        server.setRequestHandler(ListPromptsRequestSchema, async () => ({
            prompts: [],
        }))

        server.setRequestHandler(GetPromptRequestSchema, async () => {
            throw new Error('No prompts available')
        })

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
    }

    /**
     * Send an RPC message to the upstream plugin WebSocket and wait for the response.
     * Uses the same WebsocketMessage protocol as plugin-websocket.ts.
     *
     * The upstream plugin is connected via ctx.getWebSockets('up:${framerUserId}').
     * When the plugin responds, webSocketMessage() intercepts it by matching the message id
     * and resolves the pending promise.
     */
    private sendToUpstream({
        framerUserId,
        payload,
        timeout = 1000 * 10,
    }: {
        framerUserId: string
        payload: WebsocketMessage['payload']
        timeout?: number
    }): Promise<unknown> {
        const upstreams = this.ctx.getWebSockets(`up:${framerUserId}`)
        if (upstreams.length === 0) {
            return Promise.reject(
                new Error(
                    `Framer plugin not connected for user ${framerUserId}. ${framerInstructions}`,
                ),
            )
        }

        const upstream = upstreams[0]
        const id = crypto.randomUUID()
        const message: WebsocketMessage = { id, payload }

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(id)
                reject(new Error(`Tool call timed out after ${timeout}ms`))
            }, timeout)

            this.pendingRequests.set(id, { resolve, reject, timeout: timeoutId })

            try {
                upstream.send(JSON.stringify(message))
            } catch (error) {
                this.pendingRequests.delete(id)
                clearTimeout(timeoutId)
                reject(new Error('Failed to send message to Framer plugin', { cause: error }))
            }
        })
    }
}

/* ─────────────── Worker fetch handler ─────────────── */

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

export default {
    async fetch(request: Request, env: McpEnv, ctx: ExecutionContext) {
        const url = new URL(request.url)

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return addCors(new Response(null, { status: 204 }))
        }

        // Rate limit by IP
        const ip = request.headers.get('cf-connecting-ip') || 'unknown'
        const { success } = await env.RATE_LIMITER.limit({ key: ip })
        if (!success) {
            return new Response('Rate limit exceeded', { status: 429 })
        }

        // Static HTML page for users without Framer plugin
        if (url.pathname === '/htmlForUserWithoutFramerUserId') {
            return htmlForUserWithoutFramerUserId()
        }

        // Tunnel WebSocket routes: plugin connects here as upstream
        // Rewrite to use our McpTunnel DO instead of a separate tunnel worker
        if (url.pathname.startsWith('/_tunnel/')) {
            const tunnelResponse = handleTunnelFetch({
                req: request,
                doNamespace: env.MCP_TUNNEL,
            })
            if (tunnelResponse) {
                return tunnelResponse
            }
        }

        // MCP Streamable HTTP transport
        if (url.pathname === '/mcp' || url.pathname.startsWith('/mcp')) {
            const id = url.searchParams.get('id')
            const secret = url.searchParams.get('secret')

            if (!id || !secret) {
                return addCors(new Response('Missing id and secret query parameters', { status: 401 }))
            }

            const sessionData = await getValidatedSession({ env, secret, id })
            if (!sessionData) {
                return addCors(new Response('Invalid session', { status: 401 }))
            }

            // Route to the McpTunnel DO for this user
            const doId = env.MCP_TUNNEL.idFromName(sessionData.framerUserId)
            const stub = env.MCP_TUNNEL.get(doId)
            // Forward the request to the DO, keeping id param so DO knows the framerUserId
            const doUrl = new URL(request.url)
            doUrl.searchParams.set('id', sessionData.framerUserId)
            const doResponse = await stub.fetch(new Request(doUrl.toString(), request))
            return addCors(doResponse)
        }

        // Legacy SSE transport: GET /sse opens SSE stream, POST /sse/message sends messages
        if (url.pathname === '/sse' || url.pathname === '/sse/message') {
            const id = url.searchParams.get('id')
            const secret = url.searchParams.get('secret')

            if (!id || !secret) {
                return addCors(new Response('Missing id and secret query parameters', { status: 401 }))
            }

            const sessionData = await getValidatedSession({ env, secret, id })
            if (!sessionData) {
                return addCors(new Response('Invalid session', { status: 401 }))
            }

            // Route to the McpTunnel DO — keep /sse or /sse/message path intact
            // so the DO can handle the legacy SSE protocol (endpoint event + message POST)
            const doId = env.MCP_TUNNEL.idFromName(sessionData.framerUserId)
            const stub = env.MCP_TUNNEL.get(doId)
            const doUrl = new URL(request.url)
            doUrl.searchParams.set('id', sessionData.framerUserId)
            const doResponse = await stub.fetch(new Request(doUrl.toString(), request))
            return addCors(doResponse)
        }

        // Direct resource URL access
        if (url.pathname === new URL(codeComponentsResourceUri).pathname) {
            return new Response(codeComponentsResourceMarkdown, {
                headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
            })
        }

        return addCors(new Response('Not Found', { status: 404 }))
    },
}
