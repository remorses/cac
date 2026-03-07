/**
 * Integration tests for the MCP v2 worker deployed to preview.
 *
 * Tests the tunnel WebSocket relay (upstream = plugin, client = downstream)
 * and the MCP RPC protocol over the tunnel.
 *
 * Run after deploying to preview: pnpm test -t "tunnel integration"
 *
 * The e2e test runs for both transport modes (streamable-http on /mcp and legacy SSE on /sse)
 * in a single test run via a root-level for loop.
 *
 * Tests 1-4 validate the tunnel layer independently (WS relay, error codes, RPC protocol).
 * Test 5 validates HTTP routing (auth enforcement, 404s, static pages).
 * Tests 6+ (e2e) validate the full pipeline end-to-end using the MCP SDK client,
 * once per transport mode.
 */
import { describe, test, expect } from 'vitest'
import WebSocket from 'ws'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import type { WebsocketMessage } from './mcp-websocket.js'

const WS_URL = 'wss://mcp.preview.unframer.co/_tunnel'
const HTTP_URL = 'https://mcp.preview.unframer.co'
// Real session credentials for preview (validated by getValidatedSession → website API → KV cache)
const MCP_ID = '598f176d590e612e9b6bcaebb54abb0a8763c6f54ba5b9c136690ff9ad2400cc'
const MCP_SECRET = 'FpGeQQcnvd9CpFvZwEdONuAjEX7c6AwJ'

const getTunnelId = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}`

function connectWs(url: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(url)
        ws.on('open', () => {
            resolve(ws)
        })
        ws.on('error', reject)
    })
}

function waitForMessage(ws: WebSocket): Promise<string> {
    return new Promise((resolve) => {
        ws.on('message', (data) => {
            resolve(data.toString())
        })
    })
}

describe('tunnel integration', () => {
    test('upstream and client can exchange messages', async () => {
        const tunnelId = getTunnelId()

        // Plugin connects as upstream
        const upstream = await connectWs(`${WS_URL}/upstream?id=${tunnelId}`)

        // MCP DO (or test) connects as client/downstream
        const client = await connectWs(`${WS_URL}/downstream?id=${tunnelId}`)

        // upstream -> client
        const clientMsg = waitForMessage(client)
        upstream.send('hello from plugin')
        expect(await clientMsg).toBe('hello from plugin')

        // client -> upstream
        const upstreamMsg = waitForMessage(upstream)
        client.send('hello from mcp')
        expect(await upstreamMsg).toBe('hello from mcp')

        upstream.close()
        client.close()
    }, 15000)

    test('client gets 4008 when no upstream is connected', async () => {
        const tunnelId = getTunnelId()

        const client = new WebSocket(`${WS_URL}/downstream?id=${tunnelId}`)

        const closeEvent = await new Promise<{ code: number; reason: string }>((resolve, reject) => {
            client.on('open', () => {
                // wait for close
            })
            client.on('close', (code, reason) => {
                resolve({ code, reason: reason.toString() })
            })
            client.on('error', reject)
        })

        expect(closeEvent.code).toBe(4008)
        expect(closeEvent.reason).toBe('No upstream available')
    }, 15000)

    test('connecting upstream twice replaces the first with 4009', async () => {
        const tunnelId = getTunnelId()

        const upstream1 = await connectWs(`${WS_URL}/upstream?id=${tunnelId}`)

        const upstream1ClosePromise = new Promise<{ code: number; reason: string }>((resolve) => {
            upstream1.on('close', (code, reason) => {
                resolve({ code, reason: reason.toString() })
            })
        })

        const upstream2 = await connectWs(`${WS_URL}/upstream?id=${tunnelId}`)

        const closeEvent = await upstream1ClosePromise
        expect(closeEvent.code).toBe(4009)
        expect(closeEvent.reason).toBe('Upstream already connected')

        expect(upstream2.readyState).toBe(WebSocket.OPEN)

        upstream2.close()
    }, 15000)

    test('RPC-style tool call: send request to upstream and get response', async () => {
        const tunnelId = getTunnelId()

        // Plugin connects as upstream
        const upstream = await connectWs(`${WS_URL}/upstream?id=${tunnelId}`)

        // Simulate MCP DO behavior: connect as client
        const client = await connectWs(`${WS_URL}/downstream?id=${tunnelId}`)

        // Plugin handles incoming tool call requests and responds
        upstream.on('message', (data) => {
            const msg = JSON.parse(data.toString())
            if (msg.payload?.type === 'getPage') {
                // Plugin responds with the same id and output
                upstream.send(JSON.stringify({
                    id: msg.id,
                    payload: {
                        type: msg.payload.type,
                        input: msg.payload.input,
                        output: '<html>page content</html>',
                    },
                }))
            }
        })

        // Client sends a tool call (like the MCP DO would)
        const requestId = crypto.randomUUID()
        const request = {
            id: requestId,
            payload: {
                type: 'getPage',
                input: { nodeId: 'page-123' },
            },
        }

        const responsePromise = new Promise<Record<string, unknown>>((resolve) => {
            client.on('message', (data) => {
                const msg = JSON.parse(data.toString())
                if (msg.id === requestId) {
                    resolve(msg)
                }
            })
        })

        client.send(JSON.stringify(request))

        const response = await responsePromise
        expect(response.id).toBe(requestId)
        expect((response.payload as Record<string, unknown>).output).toBe('<html>page content</html>')

        upstream.close()
        client.close()
    }, 15000)

    test('HTTP endpoints return expected responses', async () => {
        // 404 for unknown paths
        const res404 = await fetch(`${HTTP_URL}/unknown`)
        expect(res404.status).toBe(404)

        // 401 for /mcp without auth
        const resMcp = await fetch(`${HTTP_URL}/mcp`, { method: 'POST' })
        expect(resMcp.status).toBe(401)

        // 401 for /sse without auth
        const resSse = await fetch(`${HTTP_URL}/sse`)
        expect(resSse.status).toBe(401)

        // 428 for htmlForUserWithoutFramerUserId
        const resHtml = await fetch(`${HTTP_URL}/htmlForUserWithoutFramerUserId`)
        expect(resHtml.status).toBe(428)
        const htmlContent = await resHtml.text()
        expect(htmlContent).toContain('Framer MCP Plugin Not Open')
    }, 15000)
})

/**
 * E2e tests run for each transport mode. Both exercise the same pipeline:
 * MCP client → Worker → McpTunnel DO → upstream plugin WS → response
 *
 * The only difference is the client transport:
 * - streamable-http: POST /mcp (StreamableHTTPClientTransport)
 * - sse: GET /sse + POST /sse/message (SSEClientTransport, legacy protocol)
 */
const transportModes = ['streamable-http', 'sse'] as const

for (const mode of transportModes) {
    describe(`e2e [${mode}]`, () => {
        test('MCP SDK client → worker → DO → upstream plugin WS → response', async () => {
            // 1. Connect a fake plugin as upstream WebSocket (mimics plugin-websocket.ts)
            const upstream = await connectWs(`wss://preview.unframer.co/_tunnel/upstream?id=${MCP_ID}`)

            // Send initial ready message (like plugin-websocket.ts does on open)
            upstream.send(JSON.stringify({ type: 'ready' }))

            // Set up the fake plugin handler
            const receivedToolCalls: string[] = []

            upstream.on('message', (data) => {
                const raw = data.toString()
                let msg: WebsocketMessage
                try {
                    msg = JSON.parse(raw)
                } catch {
                    return
                }
                if (!msg.payload?.type) {
                    return
                }
                if (msg.payload.type === 'ready' || msg.payload.type === 'close') {
                    if (msg.payload.type === 'ready') {
                        upstream.send(JSON.stringify({ type: 'ready' }))
                    }
                    return
                }

                receivedToolCalls.push(msg.payload.type)

                const response: WebsocketMessage = {
                    id: msg.id,
                    payload: {
                        ...msg.payload,
                        output: `mock output for ${msg.payload.type}`,
                    } as WebsocketMessage['payload'],
                }
                upstream.send(JSON.stringify(response))
            })

            // Small delay to ensure upstream WebSocket is fully accepted by the DO
            await new Promise((r) => { setTimeout(r, 1000) })

            // 2. Create MCP SDK client with the appropriate transport
            const transport = (() => {
                if (mode === 'sse') {
                    const sseUrl = new URL(`${HTTP_URL}/sse?id=${MCP_ID}&secret=${MCP_SECRET}`)
                    return new SSEClientTransport(sseUrl)
                }
                const mcpUrl = new URL(`${HTTP_URL}/mcp?id=${MCP_ID}&secret=${MCP_SECRET}`)
                return new StreamableHTTPClientTransport(mcpUrl)
            })()

            const client = new Client({ name: 'integration-test', version: '1.0.0' })
            await client.connect(transport)

            // 3. List tools — handled entirely inside the DO (no upstream roundtrip needed)
            const { tools } = await client.listTools()
            expect(tools.length).toBeGreaterThan(0)
            const toolNames = tools.map((t) => { return t.name })
            expect(toolNames).toContain('getProjectXml')
            expect(toolNames).toContain('getNodeXml')

            // 4. Call a tool — full pipeline through the DO to upstream plugin WS
            const result = await client.callTool({ name: 'getProjectXml', arguments: {} })
            const textContent = result.content as Array<{ type: string; text: string }>
            expect(textContent[0].text).toContain('mock output for getProjectXml')
            expect(receivedToolCalls).toContain('getProjectXml')

            // 5. Call another tool to verify the pipeline works repeatedly
            const result2 = await client.callTool({ name: 'getNodeXml', arguments: { nodeId: 'test-node-123' } })
            const textContent2 = result2.content as Array<{ type: string; text: string }>
            expect(textContent2[0].text).toContain('mock output for getNodeXml')
            expect(receivedToolCalls).toContain('getNodeXml')

            // Cleanup
            await client.close()
            upstream.close()
        }, 30000)
    })
}
