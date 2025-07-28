import { z } from 'zod'

/* ──────────────────────────── Schemas ─────────────────────────── */
const NodeId = z.string().min(1)
const Role = z.enum(['background', 'text', 'border'])

/* ──────────────────────────── Tool Definitions ─────────────────────────── */
export const mcpTools = {
    getProjectXml: {
        description:
            'Gets the project pages and components XML, with information of the currently focused page or component. These referenced nodeIds can be used with getNodeXml to get the XML of a specific page or component.',
        input: z.object({}),
        output: z.any(),
    },
    getSelectedNodesXml: {
        description: 'Gets the currently selected nodes as xml',
        input: z.object({}),
        output: z.any(),
    },
    zoomIntoView: {
        description: 'Zooms the canvas to center on the given node ID.',
        input: z.object({
            nodeId: NodeId,
        }),
        output: z.any(),
    },
    getNodeXml: {
        description:
            'Get a specific Framer node as XML. You first need to get a node id via getProjectXml or getSelectedNode.',
        input: z.object({
            nodeId: NodeId,
        }),
        output: z.any(),
    },
    getProjectColorStyles: {
        description:
            'Gets all project-level color styles, grouped by their style role, if available.',
        input: z.object({}),
    },
    getProjectTextStyles: {
        description: 'Gets all project-level text styles, if available.',
        input: z.object({}),
        output: z.any(),
    },
    updateXmlForNode: {
        description:
            'Updates the XML for a specific node using its nodeId and the provided new XML string. It can be used to update nodes text or attributes.',
        input: z.object({
            nodeId: NodeId,
            xml: z.string().min(1),
        }),
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

export type McpCallParam = {
    [K in McpToolNames]: {
        name: K
        args: z.infer<(typeof mcpTools)[K]['input']> | undefined
    }
}[McpToolNames]
