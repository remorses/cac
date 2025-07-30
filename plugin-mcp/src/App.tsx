import { framer, isTextNode, isComponentNode, TextStyle, ProtectedMethod } from 'framer-plugin'
import dedent from 'string-dedent'
import { useEffect, useLayoutEffect, useState } from 'react'
import useMeasure from 'react-use-measure'
import { websocketClientHandling } from './lib/plugin-websocket'
import {
    codeComponentsResourceUri,
    FramerLayersTree,
    McpToolNames,
} from './lib/schema'
import './lib/framer'
import { useStore } from './lib/store'
import {
    CopyIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    CircleIcon,
} from 'lucide-react'
import { framerLayersTreeToXml, extractObjectsFromXmlContent } from './lib/xml'
import { getFramerTree, applyAttributes } from './lib/framer'
import { processReactExportData } from './lib/react-export'
import {
    propControlsToTypedocComments,
    componentCamelCase,
} from 'unframer/src/typescript'
import { getComponentPropertyControls } from './lib/framer'
import {
    createBrowserRouter,
    RouterProvider,
    redirect,
    RouteObject,
    Outlet,
    LoaderFunctionArgs,
    useLoaderData,
    useNavigate,
} from 'react-router'
import { LoginPage } from './routes/Login'
import {
    Paths,
    withMode,
    LoaderReturnType,
    pluginApiClient,
    LocalStorageKeys,
} from './lib/utils'

globalThis.framer = framer

// Helper function to strip version hash from insert URLs
function stripVersionFromUrl(url: string | undefined): string | undefined {
    if (!url) return url
    // Remove @ and everything after it
    const atIndex = url.indexOf('@')
    return atIndex !== -1 ? url.substring(0, atIndex) : url
}

// Helper function to get XML for a node
async function getNodeXml(
    nodeId: string,
): Promise<{ xml: string; isReplica: boolean } | null> {
    const node = await framer.getNode(nodeId)
    if (!node) {
        return null
    }
    const tree = await getFramerTree({
        rootNodes: [node],
        recursive: false,
    })
    const xml = framerLayersTreeToXml(tree, {
        shouldAddNodeIdAlways: true,
    })
    return { xml, isReplica: node.isReplica }
}

// Initialize websocket connection (will be moved to authenticated component)
let cleanup: (() => void) | undefined

// Helper function to check permissions and return error message if not allowed
function checkPermissions(...methods: ProtectedMethod[]): string | null {
    // Cast to the expected tuple type for isAllowedTo
    const [first, ...rest] = methods
    if (!first) return null

    if (!framer.isAllowedTo(first, ...rest)) {
        const methodList = methods.length > 1
            ? `Your Framer user account lacks the following permissions for this project: ${methods.join(', ')}`
            : `Your Framer user account lacks the "${methods[0]}" permission for this project.`
        return `Permission denied. ${methodList}\n\nPlease ask the project owner to grant you the necessary permissions.`
    }
    return null
}

// Websocket handler function
async function websocketHandler({
    input,
    type,
}: {
    input: any
    type: McpToolNames
}) {
    switch (type) {
        case 'getNodeXml': {
            const { nodeId } = input

            // Check if this looks like a style path
            if (nodeId.startsWith('/')) {
                return `Cannot use getNodeXml with style paths. Style data is displayed in 'getProjectXml' under the <ColorStyles> and <TextStyles> sections. Use that tool to view all styles.`
            }
            const isCodeFile = await framer.getCodeFile(nodeId)

            if (isCodeFile) {
                return `Cannot use getNodeXml with code files. Use 'readCodeFile' tool instead to read code file with ID: ${nodeId}`
            }

            const result = await getNodeXml(nodeId)
            if (!result) {
                return `Node with ID ${nodeId} not found.`
            }
            let response = `Node xml:\n${result.xml}`
            if (result.isReplica) {
                response = `WARNING: This is a replica node (variant). It's recommended to update the original component instead to maintain consistency. Only update a few attributes on variants. These attributes will no longer inherit the primary variant values.\n\n${response}`
            }
            return response
        }
        case 'getSelectedNodesXml': {
            const selectedNodes = await framer.getSelection()
            if (!selectedNodes || selectedNodes.length === 0) {
                return 'No nodes are currently selected.'
            }

            const tree = await getFramerTree({
                rootNodes: selectedNodes,
                recursive: false,
            })
            const xml = framerLayersTreeToXml(tree, {
                shouldAddNodeIdAlways: true,
            })

            // Check if any selected nodes are replicas
            const replicaCount = selectedNodes.filter(
                (node) => node.isReplica,
            ).length
            let response = `Selected nodes XML:\n${xml}`

            if (replicaCount > 0) {
                const warning =
                    replicaCount === 1
                        ? "WARNING: One of the selected nodes is a replica (variant). It's recommended to update the original component instead."
                        : `WARNING: ${replicaCount} of the selected nodes are replicas (variants). It's recommended to update the original components instead.`
                response = `${warning}\n\n${response}`
            }

            return response
        }
        case 'getProjectXml': {
            const pages = await framer.getNodesWithType('WebPageNode')
            const components = await framer.getNodesWithType('ComponentNode')
            const codeFiles = await framer.getCodeFiles()
            const colorStyles = await framer.getColorStyles()
            const textStyles = await framer.getTextStyles()

            // Separate code files by export type
            const codeComponents = codeFiles.filter((file) =>
                file.exports.some((exp) => exp.type === 'component'),
            )
            const codeOverrides = codeFiles.filter((file) =>
                file.exports.some((exp) => exp.type === 'override'),
            )

            const tree: FramerLayersTree = [
                {
                    name: 'Project',
                    comment:
                        'Root node containing all pages, components, and code files in the project',
                    children: [
                        {
                            name: 'Pages',
                            comment:
                                'All pages in the project. Use getNodeXml with a page nodeId to see its contents',
                            children: pages.map((page) => ({
                                name: 'Page',
                                id: page.id,
                                attributes: {
                                    nodeId: page.id,
                                    path: page.path || '',
                                },
                                children: [],
                            })),
                        },
                        {
                            name: 'Components',
                            comment:
                                'Reusable components. Use getNodeXml with a component nodeId to see its structure',
                            children: components.map((component) => ({
                                name: 'Component',
                                id: component.id,
                                attributes: {
                                    nodeId: component.id,
                                    name: component.componentName || '',
                                },
                                children: [],
                            })),
                        },
                        {
                            name: 'CodeComponents',
                            comment:
                                'Code components written in React/TypeScript. Use readCodeFile to see the code',
                            children: codeComponents.map((file) => {
                                const componentExport = file.exports.find(
                                    (exp) => exp.type === 'component',
                                )
                                return {
                                    name: 'CodeComponent',
                                    id: file.id,
                                    attributes: {
                                        codeFileId: file.id,
                                        path: file.path,
                                    },
                                    children: [],
                                }
                            }),
                        },
                        {
                            name: 'CodeOverrides',
                            comment:
                                'Code override files that modify component behavior. Use readCodeFile to see the code',
                            children: codeOverrides.map((file) => ({
                                name: 'CodeOverride',
                                id: file.id,
                                attributes: {
                                    codeFileId: file.id,
                                    path: file.path,
                                },
                                children: [],
                            })),
                        },
                        {
                            name: 'ColorStyles',
                            comment:
                                'Project color styles. Reference these in XML attributes like backgroundColor="/StylePath"',
                            children: colorStyles.map((style) => ({
                                name: 'ColorStyle',
                                attributes: {
                                    path: style.path,
                                    light: style.light,
                                    dark: style.dark || '',
                                },
                                children: [],
                            })),
                        },
                        {
                            name: 'TextStyles',
                            comment:
                                'Project text styles. Reference these in XML attributes like inlineTextStyle="/StylePath"',
                            children: textStyles.map((style) => ({
                                name: 'TextStyle',
                                attributes: {
                                    path: style.path,
                                    fontSize: style.fontSize || '',
                                    lineHeight: style.lineHeight || '',
                                    letterSpacing: style.letterSpacing || '',
                                    paragraphSpacing: String(
                                        style.paragraphSpacing || 0,
                                    ),
                                    transform: style.transform || 'none',
                                    alignment: style.alignment || 'left',
                                    decoration: style.decoration || 'none',
                                    balance: String(style.balance || false),
                                    tag: style.tag || 'p',
                                },
                                children: [],
                            })),
                        },
                    ],
                },
            ]
            const xml = framerLayersTreeToXml(tree, {
                shouldAddNodeIdAlways: true,
            })

            // Get current root node (focused page or component)
            const rootNode = await framer.getCanvasRoot()
            const rootNodeInfo = rootNode
                ? `The currently focused ${rootNode.__class === 'WebPageNode' ? 'page' : 'component'} ID is: \`${rootNode.id}\`, call getNodeXml with this ID to get more specific XMl of the current focused page or component layers.`
                : 'No page or component is currently focused'

            return dedent`
            Project structure:

            ${xml}

            ${rootNodeInfo}

            When you call insertComponentInCanvas, the component will be inserted into this focused page or component.

            If you need to create or edit a Framer code file ALWAYS read the MCP resource ${codeComponentsResourceUri} first.
            `
        }
        case 'updateXmlForNode': {
            const { nodeId, xml } = input

            // Check all required permissions at once
            const permissionError = checkPermissions(
                'Node.setAttributes',
                'TextNode.setText',
                'setParent'
            )
            if (permissionError) return permissionError

            // Check if this is a code file ID
            const codeFiles = await framer.getCodeFiles()
            const isCodeFile = codeFiles.some((file) => file.id === nodeId)
            if (isCodeFile) {
                return `Cannot use updateXmlForNode with code files. Use 'updateCodeFile' tool instead to modify code file with ID: ${nodeId}`
            }

            // Check if this looks like a style path
            if (nodeId.startsWith('/')) {
                return `Node ID cannot start with a slash. It should be a valid node ID, not a color style or text path. To update styles use 'manageColorStyle' or 'manageTextStyle' tools.`
            }

            // Extract nodes from the provided XML
            const extractedNodes = extractObjectsFromXmlContent(xml)
            const results: string[] = []
            const nodesToReorder: Array<{
                nodeId: string
                parentId: string
                beforeNodeId?: string
                afterNodeId?: string
            }> = []

            // Phase 1: Update content, attributes, and move nodes to correct parents
            for (const extractedNode of extractedNodes) {
                const targetNodeId = extractedNode.nodeId || nodeId

                try {
                    const node = await framer.getNode(targetNodeId)
                    if (!node) {
                        results.push(`Node with ID ${targetNodeId} not found.`)
                        continue
                    }

                    // Update text content for text nodes
                    if (extractedNode.newContent && isTextNode(node)) {
                        await node.setText(extractedNode.newContent)
                        results.push(`Updated text for node ${targetNodeId}`)
                    }

                    // Apply attributes
                    if (
                        extractedNode.attributes &&
                        Object.keys(extractedNode.attributes).length > 0
                    ) {
                        await applyAttributes(node, extractedNode.attributes)
                        results.push(
                            `Updated attributes for node ${targetNodeId}`,
                        )
                    }

                    // Check if parent needs to change
                    if (extractedNode.parentId && node.getParent) {
                        const currentParent = await node.getParent()
                        const currentParentId = currentParent?.id

                        if (currentParentId !== extractedNode.parentId) {
                            // Move to new parent without specifying position yet
                            await framer.setParent(
                                targetNodeId,
                                extractedNode.parentId,
                            )
                            results.push(
                                `Moved node ${targetNodeId} from parent ${currentParentId || 'none'} to ${extractedNode.parentId}`,
                            )
                        }

                        // Queue for reordering if sibling info is provided
                        if (
                            extractedNode.beforeNodeId ||
                            extractedNode.afterNodeId
                        ) {
                            nodesToReorder.push({
                                nodeId: targetNodeId,
                                parentId: extractedNode.parentId,
                                beforeNodeId: extractedNode.beforeNodeId,
                                afterNodeId: extractedNode.afterNodeId,
                            })
                        }
                    }
                } catch (error) {
                    results.push(
                        `Failed to process node ${targetNodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    )
                }
            }

            // Phase 2: Reorder nodes within their parents
            // This must be done in a separate pass to ensure all nodes are in their correct parents first.
            // Otherwise, sibling references (beforeNodeId/afterNodeId) might not be found if they haven't
            // been moved yet, and index calculations would be incorrect during the moving process.
            for (const reorderInfo of nodesToReorder) {
                try {
                    const parent = await framer.getNode(reorderInfo.parentId)
                    if (!parent) continue

                    const siblings = await parent.getChildren()
                    let targetIndex: number | undefined

                    if (reorderInfo.beforeNodeId) {
                        // Place after the beforeNode
                        const beforeIndex = siblings.findIndex(
                            (s) => s.id === reorderInfo.beforeNodeId,
                        )
                        if (beforeIndex !== -1) {
                            targetIndex = beforeIndex + 1
                        }
                    } else if (reorderInfo.afterNodeId) {
                        // Place before the afterNode
                        const afterIndex = siblings.findIndex(
                            (s) => s.id === reorderInfo.afterNodeId,
                        )
                        if (afterIndex !== -1) {
                            targetIndex = afterIndex
                        }
                    }

                    if (targetIndex !== undefined) {
                        // Get current index
                        const currentIndex = siblings.findIndex(
                            (s) => s.id === reorderInfo.nodeId,
                        )

                        // Only reorder if position needs to change
                        if (
                            currentIndex !== -1 &&
                            currentIndex !== targetIndex
                        ) {
                            // When reordering within the same parent (moving a node forward), we need to adjust the target index.
                            // This is because setParent internally removes the node first, then inserts it.
                            // Example: Moving node from index 1 to index 3 in array [A, B, C, D]:
                            // - After removal: [A, C, D] (B is removed)
                            // - Original index 3 is now index 2
                            // - So we need to insert at index 2, not 3
                            // Note: This only applies when reordering within the same parent, not when moving between parents
                            if (currentIndex < targetIndex) {
                                targetIndex -= 1
                            }

                            await framer.setParent(
                                reorderInfo.nodeId,
                                reorderInfo.parentId,
                                targetIndex,
                            )
                            results.push(
                                `Reordered node ${reorderInfo.nodeId} within parent ${reorderInfo.parentId} to index ${targetIndex}`,
                            )
                        }
                    }
                } catch (error) {
                    results.push(
                        `Failed to reorder node ${reorderInfo.nodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    )
                }
            }

            // Get the updated XML for the primary node
            const updatedResult = await getNodeXml(nodeId)

            const resultMessage =
                results.length > 0
                    ? `Successfully updated:\n${results.join('\n')}`
                    : 'No updates were made.'

            return updatedResult
                ? `${resultMessage}\n\nUpdated XML:\n${updatedResult.xml}`
                : resultMessage
        }
        case 'zoomIntoView': {
            const { nodeId } = input
            const node = await framer.getNode(nodeId)
            if (!node) {
                return `Node with ID ${nodeId} not found.`
            }
            await framer.zoomIntoView(nodeId, { maxZoom: 0.9 })
            return `Zoomed into view for node ${nodeId}`
        }
        case 'manageColorStyle': {
            const { type, stylePath, properties } = input

            // Check permissions based on type
            const permissionError = checkPermissions(
                type === 'create' ? 'createColorStyle' : 'ColorStyle.setAttributes'
            )
            if (permissionError) return permissionError

            if (!stylePath.startsWith('/')) {
                return `Color style path must start with /. Got: ${stylePath}`
            }

            // Get all color styles and check if it exists
            const colorStyles = await framer.getColorStyles()
            const existingStyle = colorStyles.find(
                (style) => style.path === stylePath,
            )

            if (type === 'create') {
                if (existingStyle) {
                    return `Color style with path ${stylePath} already exists. Use type: "update" to modify it.`
                }

                // Validate required fields for create
                if (!properties.light) {
                    return `Light color is required when creating a new color style.`
                }

                // Prepare the attributes with proper types
                type ColorStyleAttributes = Parameters<
                    typeof framer.createColorStyle
                >[0]

                // Filter out name property as Framer derives it from the path
                const { name, ...propertiesWithoutName } = properties

                const attributes: ColorStyleAttributes = {
                    ...propertiesWithoutName,
                    path: stylePath,
                }

                try {
                    const result = await framer.createColorStyle(attributes)

                    if (!result) {
                        return `Failed to create color style at ${stylePath}.`
                    }

                    return {
                        message: `Successfully created color style: ${result.name}`,
                        style: {
                            path: result.path,
                            name: result.name,
                            light: result.light,
                            dark: result.dark,
                        },
                    }
                } catch (error) {
                    return `Failed to create color style: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            } else {
                // type === 'update'
                if (!existingStyle) {
                    return `Color style with path ${stylePath} not found. Use type: "create" to make a new style.`
                }

                const result = await existingStyle.setAttributes(properties)

                if (!result) {
                    return `Failed to update color style ${stylePath}.`
                }

                return {
                    message: `Successfully updated color style: ${result.name}`,
                    style: {
                        path: result.path,
                        light: result.light,
                        dark: result.dark,
                    },
                }
            }
        }
        case 'manageTextStyle': {
            const { type, stylePath, properties } = input

            // Check permissions based on type
            const permissionError = checkPermissions(
                type === 'create' ? 'createTextStyle' : 'TextStyle.setAttributes'
            )
            if (permissionError) return permissionError

            if (!stylePath.startsWith('/')) {
                return `Text style path must start with /. Got: ${stylePath}`
            }

            // Get all text styles and check if it exists
            const textStyles = await framer.getTextStyles()
            const existingStyle = textStyles.find(
                (style) => style.path === stylePath,
            )

            // Get color styles once if needed
            const needsColorStyles =
                (typeof properties.color === 'string' &&
                    properties.color.startsWith('/')) ||
                (typeof properties.decorationColor === 'string' &&
                    properties.decorationColor.startsWith('/'))

            const colorStyles = needsColorStyles
                ? await framer.getColorStyles()
                : []

            if (type === 'create') {
                if (existingStyle) {
                    return `Text style with path ${stylePath} already exists. Use type: "update" to modify it.`
                }

                // Prepare the attributes with proper types
                type TextStyleAttributes = Parameters<
                    typeof framer.createTextStyle
                >[0]

                // Filter out name property as Framer derives it from the path
                const { name, ...propertiesWithoutName } = properties

                const attributes: TextStyleAttributes = {
                    ...propertiesWithoutName,
                    path: stylePath,
                }

                // Handle color style paths for color field
                if (
                    typeof properties.color === 'string' &&
                    properties.color.startsWith('/')
                ) {
                    const colorStyle = colorStyles.find(
                        (style) => style.path === properties.color,
                    )

                    if (!colorStyle) {
                        return `Color style with path ${properties.color} not found.`
                    }

                    // Use the color style object instead of the path string
                    attributes.color = colorStyle as any
                }

                // Handle color style paths for decorationColor field
                if (
                    typeof properties.decorationColor === 'string' &&
                    properties.decorationColor.startsWith('/')
                ) {
                    const colorStyle = colorStyles.find(
                        (style) => style.path === properties.decorationColor,
                    )

                    if (!colorStyle) {
                        return `Color style with path ${properties.decorationColor} not found.`
                    }

                    // Use the color style object instead of the path string
                    attributes.decorationColor = colorStyle as any
                }

                try {
                    const result = await framer.createTextStyle(attributes)

                    if (!result) {
                        return `Failed to create text style at ${stylePath}.`
                    }

                    return {
                        message: `Successfully created text style: ${result.name}`,
                        style: {
                            path: result.path,
                            name: result.name,
                            fontSize: result.fontSize,
                            lineHeight: result.lineHeight,
                            letterSpacing: result.letterSpacing,
                            paragraphSpacing: result.paragraphSpacing,
                            transform: result.transform,
                            alignment: result.alignment,
                            decoration: result.decoration,
                            balance: result.balance,
                            tag: result.tag,
                        },
                    }
                } catch (error) {
                    return `Failed to create text style: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            } else {
                // type === 'update'
                if (!existingStyle) {
                    return `Text style with path ${stylePath} not found. Use type: "create" to make a new style.`
                }

                // Prepare the attributes with proper types
                type TextStyleAttributes = Parameters<
                    TextStyle['setAttributes']
                >[0]
                const attributes: TextStyleAttributes = { ...properties }

                // Handle color style paths for color field
                if (
                    typeof properties.color === 'string' &&
                    properties.color.startsWith('/')
                ) {
                    const colorStyle = colorStyles.find(
                        (style) => style.path === properties.color,
                    )

                    if (!colorStyle) {
                        return `Color style with path ${properties.color} not found.`
                    }

                    // Use the color style object instead of the path string
                    attributes.color = colorStyle as any
                }

                // Handle color style paths for decorationColor field
                if (
                    typeof properties.decorationColor === 'string' &&
                    properties.decorationColor.startsWith('/')
                ) {
                    const colorStyle = colorStyles.find(
                        (style) => style.path === properties.decorationColor,
                    )

                    if (!colorStyle) {
                        return `Color style with path ${properties.decorationColor} not found.`
                    }

                    // Use the color style object instead of the path string
                    attributes.decorationColor = colorStyle as any
                }

                const result = await existingStyle.setAttributes(attributes)

                if (!result) {
                    return `Failed to update text style ${stylePath}.`
                }

                return {
                    message: `Successfully updated text style: ${result.name}`,
                    style: {
                        path: result.path,
                        name: result.name,
                        fontSize: result.fontSize,
                        lineHeight: result.lineHeight,
                        letterSpacing: result.letterSpacing,
                        paragraphSpacing: result.paragraphSpacing,
                        transform: result.transform,
                        alignment: result.alignment,
                        decoration: result.decoration,
                        balance: result.balance,
                        tag: result.tag,
                    },
                }
            }
        }
        case 'searchFonts': {
            const { query } = input

            // Get all fonts from Framer
            const allFonts = await framer.getFonts()

            // Filter fonts that contain the query substring in their selector
            const matchingFonts = allFonts.filter((font) =>
                font.selector.toLowerCase().includes(query.toLowerCase()),
            )

            // Limit to 20 results
            const limitedFonts = matchingFonts.slice(0, 20)

            // Return formatted results
            const results = limitedFonts.map((font) => ({
                family: font.family,
                selector: font.selector,
                weight: font.weight,
                style: font.style,
            }))

            const baseMessage =
                matchingFonts.length > 20
                    ? `Found ${matchingFonts.length} fonts matching "${query}". Showing first 20. Use a more specific search term to narrow results.`
                    : `Found ${matchingFonts.length} fonts matching "${query}".`

            const message = `${baseMessage}\n\nTo use a font: <Text font="selector">Text</Text>\nNote: font and inlineTextStyle attributes are mutually exclusive`

            return {
                message,
                results,
                totalMatches: matchingFonts.length,
            }
        }
        case 'deleteNode': {
            const { nodeId } = input

            // Check permission
            const permissionError = checkPermissions('Node.remove')
            if (permissionError) return permissionError

            const node = await framer.getNode(nodeId)

            if (!node) {
                return `Node with ID ${nodeId} not found.`
            }

            try {
                await node.remove()
                return `Successfully deleted node ${nodeId}.`
            } catch (error) {
                return `Failed to delete node ${nodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'duplicateNode': {
            const { nodeId } = input

            // Check permissions
            const permissionError = checkPermissions('Node.clone', 'setParent')
            if (permissionError) return permissionError

            const node = await framer.getNode(nodeId)

            if (!node) {
                return `Node with ID ${nodeId} not found.`
            }

            try {
                const parent = await node.getParent()
                if (!parent) {
                    throw new Error('No parent found for node')
                }
                let cloned = await node.clone()
                if (!cloned) {
                    throw new Error('No new node cloned found')
                }
                await framer.setParent(cloned.id, parent.id)
                if (!cloned) {
                    return `Failed to duplicate node ${nodeId}: The operation returned null.`
                }
                return `Here is the new node XML:\n\n` + getNodeXml(cloned.id)
            } catch (error) {
                return `Failed to duplicate node ${nodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'exportReactComponents': {
            const { nodeIds } = input

            // Validate that all nodes exist and are components
            const componentIds = new Set<string>()
            const invalidNodes: string[] = []

            for (const nodeId of nodeIds) {
                const node = await framer.getNode(nodeId)
                if (!node) {
                    invalidNodes.push(`${nodeId} (not found)`)
                    continue
                }

                // Check if it's a component node
                if (isComponentNode(node)) {
                    componentIds.add(nodeId)
                } else {
                    invalidNodes.push(`${nodeId} (not a component)`)
                }
            }

            if (invalidNodes.length > 0) {
                return `Cannot export the following nodes: ${invalidNodes.join(', ')}. Only component nodes can be exported.`
            }

            if (componentIds.size === 0) {
                return `No valid component nodes found to export.`
            }

            try {
                // Process the export data
                const data = await processReactExportData({
                    selectedComponentIds: componentIds,
                })

                // Get the API client and submit the export

                const { error, data: responseData } =
                    await pluginApiClient.api.plugins.reactExportPlugin.upsertProject.post(
                        data,
                    )

                if (error) {
                    throw new Error(error.message || 'Export failed')
                }

                const projectId = responseData.projectId

                return dedent`
                  Components successfully exported!

                  Now you can run the following command to download the React components into your own codebase

                  \`npx unframer --outDir src/framer ${projectId}\`

                  You can also run \`npx unframer --help\` for more available options.

                  If you install unframer locally in the project you won't need to use npx. Install as a dependency and not a devDependency to use it in production builds.


                  `
            } catch (error) {
                return `Failed to export components: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'createCodeFile': {
            const { name, content } = input

            // Check permission
            const permissionError = checkPermissions('createCodeFile')
            if (permissionError) return permissionError

            // Validate file name
            if (!name.endsWith('.tsx')) {
                return `Code file name must end with .tsx extension. Got: ${name}`
            }

            try {
                const codeFile = await framer.createCodeFile(name, content)

                if (!codeFile) {
                    return `Failed to create code file ${name}.`
                }
                const componentExport = codeFile.exports.find(
                    (x) => x.type === 'component',
                )
                // if (componentExport) {
                //     await framer.addComponentInstance({
                //         url: componentExport.insertURL,
                //         attributes: {},
                //     })
                // }
                const insertUrl = stripVersionFromUrl(
                    componentExport?.insertURL,
                )

                // Run initial lint and typecheck
                const lintResult = await codeFile.lint({
                    'forbid-browser-apis': 'warning',
                })
                const typecheckResult = await codeFile.typecheck()

                return dedent`
                ## Successfully created code file: \`${codeFile.path}\`

                **Code file details:**

                - **ID:** \`${codeFile.id}\`
                - **Name:** \`${codeFile.name}\`
                - **Path:** \`${codeFile.path}\`
                - **Component Insert URL:** \`${insertUrl}\`

                ${insertUrl ? `Use insertComponentInCanvas with insertUrl: \`${insertUrl}\` to add this component to the canvas.` : 'No component export found in this code file.'}

                **Lint result:**
                \`\`\`json
                ${JSON.stringify(lintResult, null, 2)}
                \`\`\`

                **Typecheck result:**
                \`\`\`json
                ${JSON.stringify(typecheckResult, null, 2)}
                \`\`\`
                `
            } catch (error) {
                return `Failed to create code file: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'readCodeFile': {
            const { codeFileId } = input

            try {
                const codeFile = await framer.getCodeFile(codeFileId)

                if (!codeFile) {
                    return `Code file with ID ${codeFileId} not found.`
                }

                return {
                    id: codeFile.id,
                    name: codeFile.name,
                    path: codeFile.path,
                    content: codeFile.content,
                    exports: codeFile.exports,
                }
            } catch (error) {
                return `Failed to read code file: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'updateCodeFile': {
            const { codeFileId, content } = input

            // Check permission
            const permissionError = checkPermissions('CodeFile.setFileContent')
            if (permissionError) return permissionError

            try {
                const codeFile = await framer.getCodeFile(codeFileId)

                if (!codeFile) {
                    return `Code file with ID ${codeFileId} not found.`
                }

                // Update the content
                await codeFile.setFileContent(content)

                // Run lint and typecheck after update
                const lintResult = await codeFile.lint({
                    'forbid-browser-apis': 'warning',
                })
                const typecheckResult = await codeFile.typecheck()

                return {
                    message: `Successfully updated code file: ${codeFile.name}`,
                    codeFile: {
                        id: codeFile.id,
                        name: codeFile.name,
                        path: codeFile.path,
                        exports: codeFile.exports,
                    },
                    lint: lintResult,
                    typecheck: typecheckResult,
                }
            } catch (error) {
                return `Failed to update code file: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'getComponentInsertUrlAndTypes': {
            const { id } = input

            try {
                // Build array of component info objects
                const components: Array<{
                    name: string
                    insertUrl: string | undefined
                    importName: string
                    isCodeFile?: boolean
                }> = []

                // First try as component node
                const node = await framer.getNode(id)
                if (node) {
                    // Check if it's a component node
                    if (!isComponentNode(node)) {
                        return `Node ${id} is not a component node. This tool only works with component nodes.`
                    }

                    components.push({
                        name: node.name || 'Component',
                        insertUrl: stripVersionFromUrl(
                            node.insertURL || undefined,
                        ),
                        importName: componentCamelCase(
                            node.componentName || node.name || 'Component',
                        ),
                    })
                } else {
                    // Try as code file
                    const codeFile = await framer.getCodeFile(id)
                    if (codeFile) {
                        const componentExports = codeFile.exports.filter(
                            (exp) => exp.type === 'component',
                        )

                        if (componentExports.length === 0) {
                            return `Code file ${codeFile.name} does not export any components.`
                        }

                        // Add all component exports
                        for (const componentExport of componentExports) {
                            components.push({
                                name: componentExport.name,
                                insertUrl: stripVersionFromUrl(
                                    componentExport.insertURL,
                                ),
                                importName: componentExport.name,
                                isCodeFile: true,
                            })
                        }
                    } else {
                        return `ID ${id} not found. Make sure it's a valid component node ID or code file ID from getProjectXml.`
                    }
                }

                // Generate unified markdown output
                let message = ''

                // Add header based on type
                if (components[0]?.isCodeFile) {
                    const codeFile = await framer.getCodeFile(id)
                    message = `## Code File: ${codeFile!.name}\n\n`
                    message += `This code file exports ${components.length} component(s):\n\n`
                } else {
                    message = `## Component: ${components[0].name}\n\n`
                }

                // Process each component with property controls
                for (const component of components) {
                    if (components.length > 1) {
                        message += `### ${component.name}\n\n`
                    }

                    if (!component.insertUrl) {
                        message += `⚠️ No insert URL available for this component.\n\n`
                        continue
                    }

                    message += `**Insert URL:** \`${component.insertUrl}\`\n\n`

                    // Get property controls and generate TypeScript documentation
                    const { propertyControls } =
                        await getComponentPropertyControls(component.insertUrl)

                    // Create the import statement
                    const importStatement = `import ${component.importName} from "${component.insertUrl}"`
                    message += `**Import Statement:**\n\`\`\`js\n${importStatement}\n\`\`\``

                    if (propertyControls) {
                        const typedocComments = propControlsToTypedocComments({
                            propertyControls,
                            logger: console,
                            componentImportedName: component.importName,
                        })
                        if (typedocComments.headerComment) {
                            message += `\n\n**Props (can be used as XML attributes):**\n\`\`\`js\n${typedocComments.headerComment}\`\`\``
                        }
                    }

                    if (components.length > 1) {
                        message += `\n\n`
                    }
                }

                // Add footer note
                message += `\n\nThese props can be used as attributes when updating ${components.length > 1 ? 'component instances' : 'the component instance'} with \`updateXmlForNode\`.`

                return message
            } catch (error) {
                return `Failed to get component insert URL and types: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'insertComponentInCanvas': {
            const { insertUrl } = input

            // Check permission
            const permissionError = checkPermissions('addComponentInstance')
            if (permissionError) return permissionError

            try {
                // Get the current root node (page or component)
                const rootNode = await framer.getCanvasRoot()
                if (!rootNode) {
                    return `No page or component is currently focused. Please open a page or component in Framer first.`
                }

                // Insert the component
                const newNode = await framer.addComponentInstance({
                    url: insertUrl,
                    attributes: {},
                })

                if (!newNode) {
                    return `Failed to insert component with URL: ${insertUrl}`
                }

                // Get the XML for the new node
                const nodeXml = await getNodeXml(newNode.id)
                if (!nodeXml) {
                    return `Component inserted but failed to get XML for node ${newNode.id}`
                }

                return dedent`
                ## Component Successfully Inserted

                **New Node ID:** \`${newNode.id}\`

                **Current Root:** ${rootNode.__class} \`${rootNode.id}\`

                **Component XML:**
                \`\`\`xml
                ${nodeXml.xml}
                \`\`\`

                ### IMPORTANT: Component Placement Required

                The component has been inserted into the canvas but is NOT yet inside the page/component content. You MUST use \`updateXmlForNode\` to place it inside the ${rootNode.__class} structure.

                1. First, use \`getNodeXml\` on the root node ID \`${rootNode.id}\` to see the current structure

                2. Then use \`updateXmlForNode\` with the root node ID to add the component as a child with styling attributes:
                   \`\`\`xml
                   <${rootNode.__class} nodeId="${rootNode.id}">
                       <!-- existing children -->
                       <ComponentInstance
                           nodeId="${newNode.id}"
                           width="200px"
                           height="100px"
                           position="relative"
                           <!-- add component-specific props here -->
                       />
                   </${rootNode.__class}>
                   \`\`\`

                3. To customize the component instance:
                   - Use \`getComponentInsertUrlAndTypes\` with the component's nodeId to see available props/attributes
                   - Add standard attributes: width, height, position, opacity, etc.
                   - Add component-specific attributes based on its property controls
                   - Example: For a Button component, you might add \`text="Click me"\` \`variant="primary"\`

                4. The component can be placed:
                   - As a direct child of the root
                   - Inside a specific Frame or Stack
                   - At any position among siblings

                Without this placement step, the component will not be visible in the canvas.
                `
            } catch (error) {
                return `Failed to insert component: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        case 'getProjectWebsiteUrl': {
            try {
                const publishInfo = await framer.getPublishInfo()
                return publishInfo || { production: null, staging: null }
            } catch (error) {
                return `Failed to get project website URL: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
        }
        default:
            throw new Error(`Unknown tool type: ${type}`)
    }
}

function MainComponent() {
    const isConnected = useStore((state) => state.isConnected)
    const isExpanded = useStore((state) => state.isExpanded)
    const error = useStore((state) => state.error)
    const [copied, setCopied] = useState(false)
    const data = useLoaderData() as LoaderReturnType<typeof rootLoader>
    const navigate = useNavigate()

    // Get session ID from localStorage
    const [sessionId, setSessionId] = useState<string | null>(null)
    useEffect(() => {
        const storedSessionId = localStorage.getItem('framer-mcp-session-id')
        setSessionId(storedSessionId)
    }, [])

    const mcpServerUrl = sessionId
        ? `https://mcp.unframer.co/sse?id=${data.userId}&secret=${sessionId}`
        : `https://mcp.unframer.co/sse?id=${data.userId}`

    const handleCopy = async () => {
        await navigator.clipboard.writeText(mcpServerUrl)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    const toggleExpanded = () => {
        const newExpanded = !isExpanded
        useStore.setState({ isExpanded: newExpanded })
    }

    if (!isExpanded) {
        return (
            <div className='flex items-center justify-between ml-1 -mr-2 bg-framer-primary'>
                <div className='flex items-center truncate gap-2'>
                    <CircleIcon
                        className={`size-2 shrink-0 fill-current ${error ? 'text-red-500' : isConnected ? 'text-green-500' : 'text-orange-500'}`}
                    />
                    <div className='truncate'>
                        {error
                            ? 'Error'
                            : isConnected
                              ? 'Connected'
                              : 'Not Connected'}
                    </div>
                </div>
                <button
                    onClick={toggleExpanded}
                    className='w-auto p-1 shrink-0 bg-transparent hover:bg-framer-tertiary rounded transition-colors'
                >
                    <ChevronDownIcon className='size-4  text-framer-secondary' />
                </button>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-3 bg-framer-primary'>
            <p className='text-xs text-framer-secondary'>
                Copy the MCP server URL below and add it to your MCP client
                (Claude Desktop, Cursor, etc.)
            </p>

            <div className='flex items-center justify-start gap-2'>
                <p className='text-xs text-framer-secondary'>
                    Keep this plugin open while using MCP
                </p>
                <CircleIcon
                    className={`size-2 fill-current ${error ? 'text-red-500' : isConnected ? 'text-green-500' : 'text-orange-500'}`}
                />
            </div>

            <div className='flex flex-col gap-2'>
                <div className='flex gap-2'>
                    <input
                        type='text'
                        value={mcpServerUrl}
                        readOnly
                        className='flex-1 px-3 py-2 text-xs rounded bg-framer-tertiary text-framer-primary border border-framer-divider'
                    />
                    <button
                        onClick={handleCopy}
                        className='w-auto px-3 py-2 hover:bg-framer-secondary rounded border border-framer-divider transition-colors'
                    >
                        {copied ? (
                            <CheckIcon className='size-3.5 text-green-500' />
                        ) : (
                            <CopyIcon className='size-3.5 text-framer-secondary' />
                        )}
                    </button>
                </div>
            </div>
            {error && (
                <div className='p-2 bg-framer-tertiary rounded border border-framer-divider'>
                    <p className='text-xs text-red-500'>{error}</p>
                </div>
            )}
            {!error && sessionId && (
                <div className='p-2 bg-orange-500/2 rounded border border-yellow-500/30'>
                    <p className='text-xs text-yellow-500'>
                        Never share this URL with anyone, it contains your
                        personal session key
                    </p>
                </div>
            )}
            <div className='flex items-center -mt-px justify-between border-framer-divider'>
                <span className='text-xs grow text-framer-tertiary truncate'>
                    {data?.email}
                </span>
                <button
                    onClick={() => {
                        localStorage.removeItem(LocalStorageKeys.sessionId)
                        navigate(Paths.login)
                    }}
                    className='!text-xs text-framer-tertiary  transition-colors w-auto bg-transparent'
                >
                    sign out
                </button>
                <button
                    onClick={toggleExpanded}
                    className='w-auto p-1 bg-transparent hover:bg-framer-secondary rounded transition-colors'
                >
                    <ChevronUpIcon className='size-4 text-framer-secondary' />
                </button>
            </div>
        </div>
    )
}

// Root loader to check authentication
async function rootLoader({}: LoaderFunctionArgs) {
    const sessionKey = localStorage.getItem(LocalStorageKeys.sessionId)
    if (!sessionKey) {
        throw redirect(withMode(Paths.login))
    }

    // Get current user info

    const { data, error } = await pluginApiClient.api.plugins.currentOrg.post()

    if (error) {
        console.error('Failed to get current org:', error)
        // Clear session on error
        localStorage.removeItem(LocalStorageKeys.sessionId)
        throw redirect(withMode(Paths.login))
    }

    // Get Framer user ID
    const user = await framer.getCurrentUser()
    const userId = user.id

    // Initialize websocket with user ID
    if (!cleanup) {
        cleanup = await websocketClientHandling({
            websocketId: userId,
            handle: websocketHandler,
        })
    }

    return { email: data.email || 'Unknown', userId }
}

function RootLayout() {
    const [ref, { height }] = useMeasure()
    const isExpanded = useStore((state) => state.isExpanded)

    // Update framer UI size when height changes or expansion state changes
    useLayoutEffect(() => {
        void framer.showUI({
            position: 'top left',
            width: isExpanded ? 300 : 160,
            height: height || 400,
        })
    }, [height, isExpanded])

    return (
        <div ref={ref} className='flex flex-col p-3 pb-2 pt-0'>
            <Outlet />
        </div>
    )
}

function MainPage(): RouteObject {
    return {
        path: Paths.main,
        loader: rootLoader,
        Component: MainComponent,
    }
}

const routes: RouteObject[] = [
    {
        path: '/',
        Component: RootLayout,
        children: [MainPage(), LoginPage()],
    },
]

const router = createBrowserRouter(routes)

export default function App() {
    return <RouterProvider router={router} />
}

import.meta.hot?.accept(() => {
    import.meta.hot?.invalidate()
})
import.meta.hot?.dispose(() => {
    cleanup?.()
})
