import { DomHandler, Parser, ElementType } from 'htmlparser2'
import domSerializer from 'dom-serializer'
import camelCase from 'camelCase'
import type { OldTextTree } from 'website/src/lib/rewrite'

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

export function extractObjectsFromXmlContent(xml: string) {
    const results: {
        nodeId: string
        newContent: string
        attributes: Record<string, string>
    }[] = []

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

export function xmlToOldTextTree(xml: string): OldTextTree {
    const handler = new DomHandler()
    const parser = new Parser(handler, { xmlMode: true }) // Add xmlMode: true
    parser.write(xml)
    parser.end()

    function processNode(node: any): OldTextTree[number] | null {
        // Skip text nodes and comments
        if (node.type !== 'tag') {
            return null
        }

        const result: OldTextTree[number] = {
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
        .filter((n): n is OldTextTree[number] => n !== null)
    return addNodeCount(rootNodes)
}

export function oldTextTreeToXml(
    tree: OldTextTree,
    shouldAddNodeIdAlways = false,
    indent: string = '',
): string {
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
                xml += oldTextTreeToXml(
                    node.children,
                    shouldAddNodeIdAlways,
                    indent,
                )
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
        if (node.attributes) {
            for (const [key, value] of Object.entries(node.attributes)) {
                if (value !== undefined && value !== null) {
                    attributes.push(`${key}="${value}"`)
                }
            }
        }

        const attributesString =
            attributes.length > 0 ? ' ' + attributes.join(' ') : ''

        xml += `${indent}<${nodeName}${attributesString}>\n`

        if (node.content) {
            xml += `${indent}  ${escapeXml(node.content)}\n`
        }

        if (node.children && node.children.length > 0) {
            xml += oldTextTreeToXml(
                node.children,
                shouldAddNodeIdAlways,
                indent + '  ',
            )
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

export function addNodeCount(tree: OldTextTree) {
    const result: OldTextTree = []

    // If the tree is empty, return empty result
    if (tree?.length === 0) return result

    // First pass - count all nodes and store in count field
    function countNodes(node: OldTextTree[number]): number {
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

function encodeAttributeValue(value) {
    if (value === undefined) {
        return 'null'
    }
    if (typeof value === 'string') {
        return value
    }
    return JSON.stringify(value)
}

function decodeAttributeValue(value: string) {
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

export function encodeControlAttributes(
    attributes?: Record<string, any>,
): Record<string, string> {
    if (!attributes) {
        return {}
    }
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(attributes)) {
        // skip image attributes, too complex
        if (value?.url) {
            continue
        }
        result[key] = encodeAttributeValue(value)
    }
    return result
}

export function decodeControlAttributes(
    attributes?: Record<string, any>,
): Record<string, any> {
    if (!attributes) {
        return {}
    }
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(attributes)) {
        result[key] = decodeAttributeValue(value)
    }
    return result
}
