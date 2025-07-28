import { z } from 'zod'

/* ──────────────────────────── Schemas ─────────────────────────── */
const NodeId = z.string().min(1)
const Role = z.enum(['background', 'text', 'border'])

/* ──────────────────────────── Tool Definitions ─────────────────────────── */
export const mcpTools = {
    getPublishedURL: {
        description: 'Return staging & production publish info.',
        input: z.object({}),
        output: z.any(),
    },
    getXmlSelection: {
        description: '',
        input: z.object({}),
        output: z.any(),
    },
    getPages: {
        description: '',
        input: z.object({}),
        output: z.any(),
    },
    getComponents: {
        description: '',
        input: z.object({}),
        output: z.any(),
    },
} as const

/* ──────────────────────────── Types ─────────────────────────── */
export type McpToolNames = keyof typeof mcpTools

type McpToolMsg<T extends McpToolNames> = {
    type: T
    input: z.infer<(typeof mcpTools)[T]['input']>
    output?: any
}

/* explicit union */
export type McpToolWebsocketPayload = {
    [K in McpToolNames]: McpToolMsg<K>
}[McpToolNames]

export type FramerLayersTree = Array<{
    /**
     * The text of the node, if this is a text node.
     */
    content?: string
    nodeId?: string
    name?: string
    children?: FramerLayersTree
    attributes?: Record<string, string>
    attrControlsComments?: Record<string, string>
    count?: number
}>
