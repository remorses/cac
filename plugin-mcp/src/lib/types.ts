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
    fetchHTML: {
        description: 'Download raw HTML from a public URL.',
        input: z.object({ url: z.string().url() }),
        output: z.any(),
    },
    getSelectedNodeIds: {
        description: 'Get IDs of currently selected nodes.',
        input: z.object({}),
        output: z.any(),
    },
    setNodeAttributes: {
        description: 'Bulk‑set style/layout attributes on one node.',
        input: z.object({
            nodeId: NodeId,
            attributes: z.record(z.string(), z.any()),
        }),
        output: z.any(),
    },
    applyColorStyle: {
        description: 'Apply a colour (style link or inline).',
        input: z
            .object({
                nodeId: NodeId,
                role: Role,
                styleId: z.string().optional(),
                color: z.string().optional(),
            })
            .refine((d) => (d.styleId ? !d.color : !!d.color), {
                message: 'use styleId OR color',
            }),
        output: z.any(),
    },
    insertComponentInstance: {
        description: 'Insert a code‑component via its URL.',
        input: z.object({
            url: z.string().url(),
            attributes: z.record(z.string(), z.any()).optional(),
            controls: z.record(z.string(), z.any()).optional(),
        }),
        output: z.any(),
    },
    exportReactComponents: {
        description: 'Return CLI command to export components as React.',
        input: z.object({
            outDir: z.string().optional(),
        }),
        output: z.any(),
    },
} as const

/* ──────────────────────────── Types ─────────────────────────── */
export type McpToolNames = keyof typeof mcpTools

type McpToolMsg<T extends McpToolNames> = {
    type: T
    input: z.infer<typeof mcpTools[T]['input']>
    output?: any
}

/* explicit union */
export type McpToolWebsocketPayload = {
    [K in McpToolNames]: McpToolMsg<K>
}[McpToolNames]

export type FramerLayersTree = Array<{
    content?: string
    nodeId?: string
    name?: string
    children?: FramerLayersTree
    attributes?: Record<string, string>
    attrControlsComments?: Record<string, string>
    count?: number
}>
