/**
 * Vendored upstream-only tunnel DO for Cloudflare Workers with WebSocket hibernation.
 *
 * Extracted from cloudflare-tunnel library — keeps only what McpTunnel uses:
 * - Upstream WebSocket acceptance with hibernation tags
 * - Upstream replacement (close old with 4009)
 * - Ping auto-response (avoids waking DO)
 * - handleTunnelFetch router
 * - addCors helper
 *
 * Dropped: downstream relay, multiplexer, wildcard subscribers, standalone worker export.
 */

export type Attachment = {
    role: 'up'
    ids: string[]
    connectionId?: string
    connectionOrdinal?: number
    connectedAt?: number
    readyAcked?: boolean
}

/**
 * Route /_tunnel/* requests to a Tunnel Durable Object.
 * Use in the worker's fetch handler to add tunnel support.
 */
export function handleTunnelFetch({
    req,
    doNamespace,
}: {
    req: Request
    doNamespace: DurableObjectNamespace
}): Promise<Response> | null {
    const url = new URL(req.url)

    if (!url.pathname.startsWith('/_tunnel/')) {
        return null
    }

    url.pathname = url.pathname.replace('/_tunnel', '')
    const ids = url.searchParams.getAll('id')
    const doName = ids[0] ?? 'default'
    const doId = doNamespace.idFromName(doName)
    return doNamespace
        .get(doId)
        .fetch(new Request(url.toString(), req as RequestInit))
        .then(addCors)
}

/**
 * Upstream-only Tunnel Durable Object.
 *
 * Accepts upstream WebSocket connections with hibernation. Each upstream is
 * tagged as `up:${id}` so it can be looked up by id. Only one upstream per id
 * is allowed — connecting a second closes the first with code 4009.
 *
 * Ping messages are auto-responded without waking the DO:
 * - 'ping' → 'pong'
 * - '{"type":"ping"}' → '{"type":"pong"}'
 */
export class Tunnel<E = unknown> {
    ctx: DurableObjectState
    env: E

    constructor(state: DurableObjectState, env: E) {
        this.ctx = state
        this.env = env

        this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'))
        this.ctx.setWebSocketAutoResponse(
            new WebSocketRequestResponsePair('{"type":"ping"}', '{"type":"pong"}'),
        )
    }

    async fetch(req: Request) {
        if (req.headers.get('Upgrade') !== 'websocket') {
            return addCors(new Response('Upgrade required', { status: 400 }))
        }

        const url = new URL(req.url)
        const ids = url.searchParams.getAll('id')
        const id = ids[0]

        if (!url.pathname.startsWith('/upstream') || !id) {
            return addCors(new Response('Only upstream connections with id are supported', { status: 400 }))
        }

        this.closeUpstreamsForId(id, { code: 4009, reason: 'Upstream already connected' })

        const connectionOrdinal = this.ctx
            .getWebSockets(`up:${id}`)
            .map((socket) => {
                const attachment = socket.deserializeAttachment() as Attachment | undefined
                return attachment?.connectionOrdinal || 0
            })
            .reduce((maxOrdinal, ordinal) => {
                return Math.max(maxOrdinal, ordinal)
            }, 0) + 1

        const pair = new WebSocketPair()
        const [client, server] = Object.values(pair)
        this.ctx.acceptWebSocket(server, [`up:${id}`])
        server.serializeAttachment({
            role: 'up',
            ids: [id],
            connectionId: crypto.randomUUID(),
            connectionOrdinal,
            connectedAt: Date.now(),
            readyAcked: false,
        } satisfies Attachment)

        return addCors(new Response(null, { status: 101, webSocket: client }))
    }

    async webSocketMessage(_ws: WebSocket, _message: string | ArrayBuffer) {
        // No relay — McpTunnel overrides this entirely
    }

    async webSocketClose(_ws: WebSocket, _code: number, _reason: string, _wasClean: boolean) {
        // No downstream notification — McpTunnel overrides this
    }

    async webSocketError(_ws: WebSocket, _error: unknown) {
        // No downstream notification — McpTunnel overrides this
    }

    protected closeUpstreamsForId(id: string, { code, reason }: { code: number; reason: string }) {
        const ups = this.ctx.getWebSockets(`up:${id}`)
        for (const up of ups) {
            try {
                up.close(code, reason)
            } catch {}
        }
    }
}

export const addCors = (r: Response) => {
    const newHeaders = new Headers(r.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    newHeaders.set('Access-Control-Allow-Headers', '*')
    newHeaders.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return new Response(r.body, {
        status: r.status,
        statusText: r.statusText,
        headers: newHeaders,
        webSocket: (r as Response & { webSocket?: WebSocket }).webSocket,
    })
}
