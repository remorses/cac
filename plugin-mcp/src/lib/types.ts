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
            nodeId: NodeId.describe('The ID of the node to zoom into view'),
        }),
        output: z.any(),
    },
    getNodeXml: {
        description:
            'Get a specific Framer node as XML. You first need to get a node id via getProjectXml or getSelectedNode.',
        input: z.object({
            nodeId: NodeId.describe('The ID of the node to get as XML'),
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
            nodeId: NodeId.describe('The ID of the node to update'),
            xml: z.string().min(1).describe('XML string containing the updates. Can include multiple nodes with their nodeId attributes'),
        }),
        output: z.any(),
    },
    updateColorStyle: {
        description:
            'Updates a color style by its ID. Can modify the name, light color, and dark color.',
        input: z.object({
            styleId: NodeId.describe('The ID of the color style to update'),
            updates: z.object({
                name: z.string().optional().describe('New name for the color style'),
                light: z.string().optional().describe('Light theme color in any CSS color format (e.g., "rgb(255, 0, 0)", "#FF0000", "red")'),
                dark: z.string().nullable().optional().describe('Dark theme color in any CSS color format, or null to remove dark variant'),
            }).describe('Properties to update on the color style'),
        }),
        output: z.any(),
    },
    updateTextStyle: {
        description:
            'Updates a text style by its ID. Can modify various typography properties.',
        input: z.object({
            styleId: NodeId.describe('The ID of the text style to update'),
            updates: z.object({
                name: z.string().optional().describe('New name for the text style'),
                fontSize: z.string().optional().describe('Font size with units (e.g., "16px", "1.5rem")'),
                lineHeight: z.string().optional().describe('Line height with units (e.g., "24px", "1.5em", "150%")'),
                letterSpacing: z.string().optional().describe('Letter spacing with units (e.g., "0px", "0.05em")'),
                paragraphSpacing: z.number().optional().describe('Space between paragraphs in pixels'),
                transform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional().describe('Text transformation'),
                alignment: z.enum(['left', 'center', 'right', 'justify']).optional().describe('Text alignment'),
                decoration: z.enum(['none', 'underline', 'line-through']).optional().describe('Text decoration'),
                balance: z.boolean().optional().describe('Enable balanced text wrapping for better legibility'),
            }).describe('Properties to update on the text style'),
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
