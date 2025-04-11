import { DomHandler, Parser, ElementType } from 'htmlparser2'
import domSerializer from 'dom-serializer'
import camelCase from 'camelcase'
import type { FramerLayersTree } from 'website/src/lib/rewrite'

interface RewriteOldTextContentParams {
    xml: string
    newContent: { nodeId: string; newContent?: string }[]
}

export function rewriteXmlContentForTests({
    xml: xml,
    newContent,
}: RewriteOldTextContentParams): string {
    const handler = new DomHandler((error, dom) => {
        if (error) {
            console.error(error)
        } else {
            const dfs = (node) => {
                if (
                    node.type === ElementType.Tag &&
                    node.attribs &&
                    node.attribs.nodeId
                ) {
                    const nodeId = node.attribs.nodeId
                    const matchingContent = newContent.find(
                        (item) => item.nodeId === nodeId,
                    )
                    if (matchingContent?.newContent) {
                        node.children.forEach((child) => {
                            if (child.type === 'text') {
                                const initialSpace =
                                    child.data.match(/^\s+/)?.toString() || ''
                                const endSpace =
                                    child.data.match(/\s+$/)?.toString() || ''
                                const text = matchingContent.newContent || ''
                                child.data = initialSpace + text + endSpace
                            }
                        })
                    }
                }
                if (node.children) {
                    node.children.forEach(dfs)
                }
            }

            dom.forEach(dfs)
        }
    })

    const parser = new Parser(handler, { xmlMode: true })
    parser.write(xml)
    parser.end()

    const serialized = domSerializer(handler.dom, {
        xmlMode: true,
        encodeEntities: false,
        decodeEntities: false,
    })
    return serialized
}

function deIndent(str: string) {
    if (!str) {
        return str
    }
    // Split into lines and filter out empty lines
    const lines = str.split('\n').filter(Boolean)
    if (lines.length === 0) {
        return str
    }

    // Find the minimum indentation level
    const minIndent = Math.min(
        ...lines.map((line) => {
            const match = line.match(/^\s*/)
            return match ? match[0].length : 0
        }),
    )

    // Remove the common indent from each line
    return lines.map((line) => line.slice(minIndent)).join('\n')
}

export type NewExtractedNode = {
    nodeId: string
    newContent: string
    attributes: Record<string, string>
}
export function extractObjectsFromXmlContent(xml: string) {
    const results: NewExtractedNode[] = []

    const handler = new DomHandler((error, dom) => {
        if (error) {
            console.error('error', error)
        } else {
            const dfs = (node) => {
                if (
                    node.type === ElementType.Tag &&
                    node.attribs &&
                    node.attribs.nodeId
                ) {
                    const nodeId = node.attribs.nodeId
                    let text = ''

                    // Extract text content
                    const getTextContent = (n) => {
                        if (n.type === 'text') {
                            text += n.data
                        }
                        if (n.children) {
                            n.children.forEach(getTextContent)
                        }
                    }
                    getTextContent(node)

                    // Get all attributes except nodeId
                    const attributes = { ...node.attribs }
                    delete attributes.nodeId

                    results.push({
                        nodeId,
                        newContent: deIndent(text).trim(),
                        attributes,
                    })
                }

                if (node.children) {
                    node.children.forEach(dfs)
                }
            }

            dom.forEach(dfs)
        }
    })

    const parser = new Parser(handler, { xmlMode: true })
    parser.write(xml)
    parser.end()

    return results
}

export function xmlToOldTextTree(xml: string): FramerLayersTree {
    const handler = new DomHandler()
    const parser = new Parser(handler, { xmlMode: true }) // Add xmlMode: true
    parser.write(xml)
    parser.end()

    function processNode(node: any): FramerLayersTree[number] | null {
        // Skip text nodes and comments
        if (node.type !== 'tag') {
            return null
        }

        const result: FramerLayersTree[number] = {
            name: node.name,
        }

        // Get attributes
        if (node.attribs) {
            const { nodeId, ...attrs } = node.attribs
            if (nodeId) {
                result.nodeId = nodeId
            }
            if (Object.keys(attrs).length > 0) {
                result.attributes = attrs
            }
        }

        // Get text content
        if (node.children) {
            const textNodes = node.children.filter(
                (child: any) => child.type === 'text',
            )
            if (textNodes.length > 0) {
                result.content = textNodes
                    .map((node: any) => node.data.trim())
                    .join('\n')
                    .trim()
            }

            // Process child elements
            const childElements = node.children.filter(
                (child: any) => child.type === 'tag',
            )
            if (childElements.length > 0) {
                const children = childElements
                    .map(processNode)
                    .filter((n: any) => n !== null)
                if (children.length > 0) {
                    result.children = children
                }
            }
        }

        // Return all nodes, not just ones with nodeId

        return result
    }

    const rootNodes = handler.dom
        .filter((node: any) => node.type === 'tag') // Only process tag nodes
        .map(processNode)
        .filter((n): n is FramerLayersTree[number] => n !== null)
    return addNodeCount(rootNodes)
}
export function oldTextTreeToXml(
    tree: FramerLayersTree,
    options: {
        shouldAddNodeIdAlways?: boolean

        indent?: string
    } = {},
): string {
    const {
        shouldAddNodeIdAlways = false,

        indent = '',
    } = options
    let xml = ''

    for (const node of tree) {
        if (!node) {
            continue
        }

        // Skip nodes with empty name
        if (node.name === '') {
            if (node.content) {
                xml += `${indent}${escapeXml(node.content)}\n`
            }
            if (node.children && node.children.length > 0) {
                xml += oldTextTreeToXml(node.children, {
                    shouldAddNodeIdAlways,

                    indent,
                })
            }
            continue
        }

        let name = node.name || 'Container'
        let nodeName =
            camelCase(name?.replace(/[^a-zA-Z0-9\s_-]+/g, ' ') || 'None', {
                pascalCase: true,
            }) || 'Node'

        // Truncate nodeName if it's too long (e.g., more than 50 characters)
        let max = 60
        if (nodeName.length > max) {
            const lastUnderscoreIndex = nodeName.indexOf('_', max)
            if (lastUnderscoreIndex > 0) {
                nodeName = nodeName.substring(0, lastUnderscoreIndex)
            } else {
                nodeName = nodeName.substring(0, max)
            }
        }
        const attributes = [] as string[]

        let shouldAddNodeId = shouldAddNodeIdAlways || !node?.children?.length
        if (shouldAddNodeId && node.nodeId) {
            attributes.push(`nodeId="${node.nodeId}"`)
        }

        let hasComments = false
        if (node.attributes) {
            for (const [key, value] of Object.entries(node.attributes)) {
                if (value !== undefined && value !== null) {
                    const comment = node.attrControlsComments?.[key]
                    if (comment != null) {
                        if (!comment) {
                            continue
                        }
                        hasComments = true
                        attributes.push(
                            `<!-- ${key} is of type ${comment} -->\n${indent}    ${key}="${value}"`,
                        )
                    } else {
                        attributes.push(`${key}="${value}"`)
                    }
                }
            }
        }

        const attributesString =
            attributes.length > 0
                ? hasComments
                    ? '\n' +
                      indent +
                      '    ' +
                      attributes.join('\n' + indent + '    ') +
                      '\n' +
                      indent
                    : ' ' + attributes.join(' ')
                : ''

        xml += `${indent}<${nodeName}${attributesString}>\n`

        if (node.content) {
            xml += `${indent}  ${escapeXml(node.content)}\n`
        }

        if (node.children && node.children.length > 0) {
            xml += oldTextTreeToXml(node.children, {
                shouldAddNodeIdAlways,

                indent: indent + '  ',
            })
        }

        xml += `${indent}</${nodeName}>\n`
    }

    return xml
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<':
                return '&lt;'
            case '>':
                return '&gt;'
            case '&':
                return '&amp;'
            case "'":
                return '&apos;'
            case '"':
                return '&quot;'
            default:
                return c
        }
    })
}

export function addNodeCount(tree: FramerLayersTree) {
    const result: FramerLayersTree = []

    // If the tree is empty, return empty result
    if (tree?.length === 0) return result

    // First pass - count all nodes and store in count field
    function countNodes(node: FramerLayersTree[number]): number {
        let count = 1
        if (node.children) {
            for (const child of node.children) {
                count += countNodes(child)
            }
        }
        node.count = count
        return count
    }

    // Count nodes for all trees in the input
    for (const rootNode of tree) {
        countNodes(rootNode)
    }
    return tree
}
