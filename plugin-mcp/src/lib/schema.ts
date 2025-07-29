import { z } from 'zod'
import dedent from 'string-dedent'

export const codeComponentsResourceUri = 'mcp://mcp.unframer.co/prompts/how-to-write-framer-code-files.md'

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

        This tool also returns the ID of the currently focused page or component node. When you call insertComponentInCanvas, the component will be inserted into this focused page or component.

        The referenced nodeIds can be used with getNodeXml to get the XML of a specific page or component.

        Each element in the XML is usually referred as a "node" but the user could also refer to it as a "layer" or "element". The XML structure is similar to Framer's XML layers tree, names are extracted from the layers names given by the user.

        To get insert URLs for components, use the getComponentInsertUrlAndTypes tool.
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
            'Zooms the canvas to center on the given node ID. Code file nodes are not supported.',
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

              If a node id changes its parent, it will be moved in the layers tree.

              This tool is generally called using a component or page nodeId and passing a portion of the XML tree. To delete nodes you should use deleteNode instead. If a node is omitted it will not be deleted.

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
            The display name will be automatically derived from the last segment of the path.
            For example, "/Brand/Primary" will create a style named "Primary" in the "Brand" folder.
            
            If a style already exists at the given path, this operation will fail.

            After creating, you can reference this style in XML nodes using color="/path/to/style".
        `,
        input: z.object({
            stylePath: z
                .string()
                .describe(
                    'The path for the new color style. Must start with / and be unique. The name is derived from the last path segment.',
                ),
            properties: colorStylePropertiesSchema
                .required({ light: true })
                .omit({ name: true })
                .describe('Properties for the new color style. Light color is required. Name is derived from the path.'),
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
            The display name will be automatically derived from the last segment of the path.
            For example, "/Typography/Headings/H1" will create a style named "H1" in the "Typography/Headings" folder.
            
            If a style already exists at the given path, this operation will fail.

            After creating, you can reference this style in XML nodes using inlineTextStyle="/path/to/style".
        `,
        input: z.object({
            stylePath: z
                .string()
                .describe(
                    'The path for the new text style. Must start with / and be unique. The name is derived from the last path segment.',
                ),
            properties: textStylePropertiesSchema
                .omit({ name: true })
                .describe('Properties for the new text style. Name is derived from the path.'),
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

        NEVER use this tool to change the parent of a node! Instead use updateXmlForNode to move an element to another parent, reference both the element id and the new parent id and updateXmlForNode will do the reparenting for you.

        `,
        input: z.object({
            nodeId: NodeId.describe('The ID of the node to delete'),
        }),
        output: z.any(),
    },
    duplicateNode: {
        description: dedent`
            Duplicate a node in the Framer project. Creates an exact copy of the node and all its children.

            The duplicated node will be placed at the end of the original node parent.

            Returns the ID of the newly created duplicate node. It will have same attributes, content and children.

            DO NOT USE this tool to move a node to a different place or ordering. Instead use updateXmlForNode to change the parent of a node or its position in the layers tree.
        `,
        input: z.object({
            nodeId: NodeId.describe('The ID of the node to duplicate'),
        }),
        output: z.any(),
    },
    exportReactComponents: {
        description: dedent`
            Export selected Framer components as React code. This tool will return a cli command you can run to download your Framer components as React code.

            This tool uses the same logic implemented in the Framer React Export plugin: https://www.framer.com/marketplace/plugins/react-export/

            You should login with the same Google account you used in Framer React Export plugin if you want to reuse your existing subscription.

            Only component nodes can be exported. Use getProjectXml to find available component node IDs.

            The React code will be composed of .jsx files and .css styles. it is machine generated so it is recommended to use Framer variables to customize the components. Framer variables will be available as React component props.

            You can read more documentation on how to use React Export (and the unframer cli, which downloads the components on your codebase) in the open source GitHub repository: https://github.com/remorses/unframer

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
    createCodeFile: {
        description: dedent`
            Create a new code file in the Framer project. Code files can export either code components or overrides.

            ALWAYS read the MCP resource file ${codeComponentsResourceUri} to see how to create code components and overrides.

            You can use typescript and React. You can also import components in the project by using getComponentInsertUrlAndTypes to get their import url.

            When creating a code component you should also define its property controls via Framer addPropertyControls.

            Returns the ID, path, and insertUrl of the created code file. Use insertComponentInCanvas with the insertUrl to add the component to the canvas.
        `,
        input: z.object({
            name: z.string().describe('The name of the code file (e.g., "MyComponent.tsx")'),
            content: z.string().describe('The TypeScript/React code content for the file'),
        }),
        output: z.any(),
    },
    readCodeFile: {
        description: dedent`
            Read the content of a code file by its ID. Available code files are listed in getProjectXml.

            Returns the current content, name, path, and available exports of the code file.
        `,
        input: z.object({
            codeFileId: z.string().describe('The ID of the code file to read'),
        }),
        output: z.any(),
    },
    updateCodeFile: {
        description: dedent`
            Update the content of an existing code file.

            This will replace the entire content of the file.
            The file will be automatically linted and type-checked after update.
        `,
        input: z.object({
            codeFileId: z.string().describe('The ID of the code file to update'),
            content: z.string().describe('The new TypeScript/React code content'),
        }),
        output: z.any(),
    },
    getComponentInsertUrlAndTypes: {
        description: dedent`
            Get the insert URL, import statement and prop types documentation for components. This must be called before using insertComponentInCanvas.

            The id parameter can be either:
            - A component node ID (from getProjectXml Components section)
            - A code file ID (from getProjectXml CodeComponents section)

            Use this tool when you want to:
            - Insert a component into the canvas (get the insertUrl for insertComponentInCanvas)
            - Use an existing component in a code file (get the import statement)
            - See what props/attributes are available for a component, to use them in XML
        `,
        input: z.object({
            id: z.string().describe('The ID of the component node or code file to get information for'),
        }),
        output: z.string(),
    },
    insertComponentInCanvas: {
        description: dedent`
            Creates a component instance and inserts it into the canvas using its insertUrl. The component will be inserted into the currently focused page or component.

            This tool can be used with both regular components and code file components.

            Before using this tool, call getComponentInsertUrlAndTypes to get the insertUrl for the component you want to insert.

            Returns markdown with:
            - The ID of the newly created node
            - XML of the new node
            - The current root node ID (page or component)
            - Instructions for positioning the node using updateXmlForNode
        `,
        input: z.object({
            insertUrl: z.string().describe('The insert URL of the component to insert, it can be obtained from getComponentInsertUrlAndTypes'),
        }),
        output: z.string(),
    },
    getProjectWebsiteUrl: {
        description: dedent`
            Get the published website URLs for the current Framer project.

            This tool retrieves both staging and production URLs if the project has been published.
            
            Use this tool when you need to:
            - Check if the project is published
            - Get the live website URL
            - Get the staging/preview URL
            - Share the project's public URL
        `,
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
