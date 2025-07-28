import { z } from 'zod'
import dedent from 'string-dedent'

/* ──────────────────────────── Schemas ─────────────────────────── */
const NodeId = z.string().min(1)
const Role = z.enum(['background', 'text', 'border'])

const colorStylePropertiesSchema = z.object({
    name: z
        .string()
        .optional()
        .describe('The display name of the color style'),
    light: z
        .string()
        .optional()
        .describe(
            'Light theme color in any CSS color format (e.g., "rgb(255, 0, 0)", "#FF0000", "red")',
        ),
    dark: z
        .string()
        .nullable()
        .optional()
        .describe(
            'Dark theme color in any CSS color format, or null to remove dark variant',
        ),
})

const textStylePropertiesSchema = z.object({
    name: z
        .string()
        .optional()
        .describe('The display name of the text style'),
    tag: z
        .enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'])
        .optional()
        .describe('HTML tag associated with the text style'),
    fontSize: z
        .string()
        .optional()
        .describe(
            'Font size with units (e.g., "16px", "1.5rem")',
        ),
    lineHeight: z
        .string()
        .optional()
        .describe(
            'Line height with units (e.g., "24px", "1.5em", "150%")',
        ),
    letterSpacing: z
        .string()
        .optional()
        .describe(
            'Letter spacing with units (e.g., "0px", "0.05em")',
        ),
    paragraphSpacing: z
        .number()
        .optional()
        .describe('Space between paragraphs in pixels'),
    transform: z
        .enum(['none', 'uppercase', 'lowercase', 'capitalize'])
        .optional()
        .describe('Text transformation'),
    alignment: z
        .enum(['left', 'center', 'right', 'justify'])
        .optional()
        .describe('Text alignment'),
    decoration: z
        .enum(['none', 'underline', 'line-through'])
        .optional()
        .describe('Text decoration'),
    balance: z
        .boolean()
        .optional()
        .describe(
            'Enable balanced text wrapping for better legibility',
        ),
    color: z
        .string()
        .optional()
        .describe(
            'Color as hex, rgba, or color style path (e.g., "#FF0000", "rgb(255, 0, 0)", "/Primary")',
        ),
    font: z
        .string()
        .optional()
        .describe(
            'Font selector (e.g., "GF;Inter-600")',
        ),
    boldFont: z
        .string()
        .nullable()
        .optional()
        .describe(
            'Bold variant font selector or null to remove',
        ),
    italicFont: z
        .string()
        .nullable()
        .optional()
        .describe(
            'Italic variant font selector or null to remove',
        ),
    boldItalicFont: z
        .string()
        .nullable()
        .optional()
        .describe(
            'Bold italic variant font selector or null to remove',
        ),
    decorationColor: z
        .string()
        .optional()
        .describe(
            'Decoration color as hex, rgba, or color style path',
        ),
    decorationThickness: z
        .string()
        .optional()
        .describe(
            'Decoration thickness (e.g., "auto", "2px", "0.1em")',
        ),
    decorationStyle: z
        .enum(['solid', 'double', 'dotted', 'dashed', 'wavy'])
        .optional()
        .describe('Text decoration style'),
    decorationSkipInk: z
        .enum(['auto', 'none', 'all'])
        .optional()
        .describe('Text decoration skip ink behavior'),
    decorationOffset: z
        .string()
        .optional()
        .describe(
            'Decoration offset (e.g., "auto", "2px", "0.1em")',
        ),
})

/* ──────────────────────────── Tool Definitions ─────────────────────────── */
export const mcpTools = {
    getProjectXml: {
        description: dedent`
        Gets the project pages and components XML, with information of the currently focused page or component.

        The referenced nodeIds can be used with getNodeXml to get the XML of a specific page or component.

        Each element in the XML is usually referred as a "node" but the user could also refer to it as a "layer" or "element". The XML structure is similar to Framer's XML layers tree, names are extracted from the layers names given by the user.



        `,
        input: z.object({}),
        output: z.any(),
    },
    getSelectedNodesXml: {
        description: 'Gets the currently selected nodes as xml',
        input: z.object({}),
        output: z.any(),
    },
    zoomIntoView: {
        description:
            'Zooms the canvas to center on the given node ID. It will navigate to the right page or component first.',
        input: z.object({
            nodeId: NodeId.describe('The ID of the node to zoom into view'),
        }),
        output: z.any(),
    },
    getNodeXml: {
        description:
            'Get a specific Framer node as XML. You first need to get a node id via getProjectXml or call getSelectedNodesXml instead',
        input: z.object({
            nodeId: NodeId.describe('The ID of the node to get as XML'),
        }),
        output: z.any(),
    },
    getProjectColorStyles: {
        description: dedent`
          Gets all project-level color styles.
          XML nodes can use these color styles by setting attributes like backgroundColor to their path, e.g. color="/Primary".
          You can also use color styles when setting the color attribute of a text style with updateTextStyle.
      `,
        input: z.object({}),
    },
    getProjectTextStyles: {
        description:
            'Gets all project-level text styles. XML nodes can use these text styles by setting the inlineTextStyle attribute to their path, e.g. inlineTextStyle="/Heading xl".',
        input: z.object({}),
        output: z.any(),
    },
    updateXmlForNode: {
        description: dedent`
              Update the XML for a specific node using its nodeId and passing a new XML string. It can be used to update nodes text or attributes.

              You can pass a partial a XML string, there is no need to include the full XML structure, missing nodes will not be updated. You can also omit attributes, omitted attributes will not be updated and will be ignored.

              You can use this tool to
              - Update text for one or multiple text nodes
              - Update attributes of existing nodes

              This tool cannot duplicate or delete nodes.

              `,
        input: z.object({
            nodeId: NodeId.describe('The ID of the node to update'),
            xml: z
                .string()
                .min(1)
                .describe(
                    'XML string containing the updates. Can include multiple nodes with their nodeId attributes',
                ),
        }),
        output: z.any(),
    },
    updateColorStyle: {
        description:
            'Updates a color style by its path. Can modify the name, light color, and dark color.',
        input: z.object({
            stylePath: z
                .string()
                .describe(
                    'The path of the color style to update. Must start with /',
                ),
            updates: colorStylePropertiesSchema
                .describe('Properties to update on the color style'),
        }),
        output: z.any(),
    },
    createColorStyle: {
        description: dedent`
            Creates a new color style in the project with the specified properties.

            The style path must start with "/" and can include folder structure (e.g., "/Brand/Primary").
            If a style already exists at the given path, this operation will fail.

            After creating, you can reference this style in XML nodes using color="/path/to/style".
        `,
        input: z.object({
            stylePath: z
                .string()
                .describe(
                    'The path for the new color style. Must start with / and be unique',
                ),
            properties: colorStylePropertiesSchema
                .required({ name: true, light: true })
                .describe('Properties for the new color style. Name and light color are required.'),
        }),
        output: z.any(),
    },
    updateTextStyle: {
      description: dedent`
          Updates a text style by its path. Can modify various typography properties.

          Updating a text style will update all the nodes that use it in the project.

          If you only want to update a single node instead, create a new text style and update the XML to reference its new path instead.
      `,
        input: z.object({
            stylePath: z
                .string()
                .describe(
                    'The path of the text style to update. Must start with /',
                ),
            updates: textStylePropertiesSchema
                .describe('Properties to update on the text style'),
        }),
        output: z.any(),
    },
    createTextStyle: {
        description: dedent`
            Creates a new text style in the project with the specified properties.

            The style path must start with "/" and can include folder structure (e.g., "/Typography/Headings/H1").
            If a style already exists at the given path, this operation will fail.

            After creating, you can reference this style in XML nodes using inlineTextStyle="/path/to/style".
        `,
        input: z.object({
            stylePath: z
                .string()
                .describe(
                    'The path for the new text style. Must start with / and be unique',
                ),
            properties: textStylePropertiesSchema
                .required({ name: true })
                .describe('Properties for the new text style. Name is required.'),
        }),
        output: z.any(),
    },
    searchFonts: {
        description: dedent`
            Search for fonts by selector substring. Returns max 20 results. Use specific search terms for better results.

            IMPORTANT: The returned 'selector' field is what you use in XML font attributes:
            <Text font="GF;Inter-600">Bold text</Text>

            NOTE: You can only apply a font attribute to text nodes that do NOT have an inlineTextStyle.
            If a text node has inlineTextStyle="/Heading xl", you must remove it before applying a custom font.
            Text nodes can use EITHER inlineTextStyle (project text style) OR font (custom font), not both.
        `,
        input: z.object({
            query: z
                .string()
                .min(1)
                .describe(
                    'Search query to match against font selector (e.g., "Inter", "bold", "italic")',
                ),
        }),
        output: z.any(),
    },
    deleteNode: {
        description: dedent`
            Deletes a Framer node, removing it from the page or component. This permanently removes the node and all its children.

        `,
        input: z.object({
            nodeId: NodeId.describe('The ID of the node to delete'),
        }),
        output: z.any(),
    },
    duplicateNode: {
        description: dedent`
            Duplicate a node in the Framer project. Creates an exact copy of the node and all its children.

            The duplicated node will be placed as a sibling of the original node.

            Returns the ID of the newly created duplicate node. It will have same attributes, content and children.
        `,
        input: z.object({
            nodeId: NodeId.describe('The ID of the node to duplicate'),
        }),
        output: z.any(),
    },
    exportReactComponents: {
        description: dedent`
            Export selected Framer components as React code. This creates a React project with the components and their dependencies.

            Only component nodes can be exported. The tool will validate that all provided node IDs are components.
            Returns a URL where the exported React code can be accessed.
        `,
        input: z.object({
            nodeIds: z
                .array(NodeId)
                .min(1)
                .describe(
                    'Array of component node IDs to export as React code',
                ),
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
    isReplica?: boolean
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
