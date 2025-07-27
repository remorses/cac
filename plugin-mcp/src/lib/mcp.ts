// framer‑mcp.ts
// import { createWebsocketHandling } from './lib/websocket'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { createWebsocketHandling } from './websocket'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
    CallToolRequest,
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

/* ──────────────────────────── 1. Enum ────────────────────────────── */
export enum McpToolNames {
    GetPublishedURL = 'getPublishedURL',
    FetchHTML = 'fetchHTML',
    GetSelectedNodeIds = 'getSelectedNodeIds',
    SetNodeAttributes = 'setNodeAttributes',
    ApplyColorStyle = 'applyColorStyle',
    InsertComponentInstance = 'insertComponentInstance',
    ExportReactComponents = 'exportReactComponents',
}

/* ──────────────────────────── 2. Schemas ─────────────────────────── */
const NodeId = z.string().min(1)
const Role = z.enum(['background', 'text', 'border'])

/* inputs */
export const GetPublishedURLInput = z.object({})
export const FetchHTMLInput = z.object({ url: z.string().url() })
export const GetSelectedNodeIdsInput = z.object({})
export const SetNodeAttributesInput = z.object({
    nodeId: NodeId,
    attributes: z.record(z.any()),
})
export const ApplyColorStyleInput = z
    .object({
        nodeId: NodeId,
        role: Role,
        styleId: z.string().optional(),
        color: z.string().optional(),
    })
    .refine((d) => (d.styleId ? !d.color : !!d.color), {
        message: 'use styleId OR color',
    })
export const InsertComponentInstanceInput = z.object({
    url: z.string().url(),
    attributes: z.record(z.any()).optional(),
    controls: z.record(z.any()).optional(),
})
export const ExportReactComponentsInput = z.object({
    outDir: z.string().optional(),
})

/* outputs (payload only) */
const TextOut = z.object({ text: z.string() })
const JsonOut = z.object({ json: z.any() })

export const GetPublishedURLOutput = JsonOut
export const FetchHTMLOutput = TextOut
export const GetSelectedNodeIdsOutput = JsonOut
export const SetNodeAttributesOutput = TextOut
export const ApplyColorStyleOutput = TextOut
export const InsertComponentInstanceOutput = JsonOut
export const ExportReactComponentsOutput = TextOut

/* ───────────────────────── 3. Message types ──────────────────────── */
type McpToolMsg<
    T extends McpToolNames,
    InputSchema extends z.ZodTypeAny,
    OutputSchema extends z.ZodTypeAny,
> = {
    type: T
    input: z.infer<InputSchema>
    output?: z.infer<OutputSchema>
}

/* explicit union */
export type McpToolWebsocketPayload =
    | McpToolMsg<
          McpToolNames.GetPublishedURL,
          typeof GetPublishedURLInput,
          typeof GetPublishedURLOutput
      >
    | McpToolMsg<
          McpToolNames.FetchHTML,
          typeof FetchHTMLInput,
          typeof FetchHTMLOutput
      >
    | McpToolMsg<
          McpToolNames.GetSelectedNodeIds,
          typeof GetSelectedNodeIdsInput,
          typeof GetSelectedNodeIdsOutput
      >
    | McpToolMsg<
          McpToolNames.SetNodeAttributes,
          typeof SetNodeAttributesInput,
          typeof SetNodeAttributesOutput
      >
    | McpToolMsg<
          McpToolNames.ApplyColorStyle,
          typeof ApplyColorStyleInput,
          typeof ApplyColorStyleOutput
      >
    | McpToolMsg<
          McpToolNames.InsertComponentInstance,
          typeof InsertComponentInstanceInput,
          typeof InsertComponentInstanceOutput
      >
    | McpToolMsg<
          McpToolNames.ExportReactComponents,
          typeof ExportReactComponentsInput,
          typeof ExportReactComponentsOutput
      >

export async function implementMcpTools({
    server,
    websocketId,
}: {
    server: Server
    websocketId?: string
}) {
    // Generate a new websocketId using Web Crypto if not provided

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
        })
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
        tools: [
            {
                name: McpToolNames.GetPublishedURL,
                description: 'Return staging & production publish info.',
                inputSchema: { type: 'object', properties: {}, required: [] },
            },
            {
                name: McpToolNames.FetchHTML,
                description: 'Download raw HTML from a public URL.',
                inputSchema: {
                    type: 'object',
                    properties: { url: { type: 'string', format: 'uri' } },
                    required: ['url'],
                },
            },
            {
                name: McpToolNames.GetSelectedNodeIds,
                description: 'Get IDs of currently selected nodes.',
                inputSchema: { type: 'object', properties: {}, required: [] },
            },
            {
                name: McpToolNames.SetNodeAttributes,
                description: 'Bulk‑set style/layout attributes on one node.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeId: { type: 'string' },
                        attributes: { type: 'object' },
                    },
                    required: ['nodeId', 'attributes'],
                },
            },
            {
                name: McpToolNames.ApplyColorStyle,
                description: 'Apply a colour (style link or inline).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeId: { type: 'string' },
                        role: {
                            type: 'string',
                            enum: ['background', 'text', 'border'],
                        },
                        styleId: { type: 'string' },
                        color: { type: 'string' },
                    },
                    required: ['nodeId', 'role'],
                },
            },
            {
                name: McpToolNames.InsertComponentInstance,
                description: 'Insert a code‑component via its URL.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        url: { type: 'string', format: 'uri' },
                        attributes: { type: 'object' },
                        controls: { type: 'object' },
                    },
                    required: ['url'],
                },
            },
            {
                name: McpToolNames.ExportReactComponents,
                description:
                    'Return CLI command to export components as React.',
                inputSchema: {
                    type: 'object',
                    properties: { outDir: { type: 'string' } },
                    required: [],
                },
            },
        ],
    }))

    const { send, cleanup } = createWebsocketHandling({ ws })
    server.setRequestHandler(
        CallToolRequestSchema,
        async (request: CallToolRequest) => {
            const { name, arguments: args = {} } = request.params
            const reply = await send({
                payload: { type: name as any, input: args },
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

    // Keep-alive ping (for browser, send empty message or ping equivalent)
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping')
        }
    }, 20000)

    ws.addEventListener('close', () => {
        clearInterval(pingInterval)
    })

    // Use your handler
}
