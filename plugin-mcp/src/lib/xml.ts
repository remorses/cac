import { DomHandler, Parser, ElementType } from 'htmlparser2'
import domSerializer from 'dom-serializer'
import camelCase from 'camelcase'
import type { FramerLayersTree } from './schema'

export function rewriteXmlContentForTests({
    xml: xml,
    newContent,
}: {
    xml: string
    newContent: { nodeId: string; newContent?: string }[]
}): string {
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
    const lines = str.split('\n').filter(Boolean)
    if (lines.length === 0) {
        return str
    }

    const minIndent = Math.min(
        ...lines.map((line) => {
            const match = line.match(/^\s*/)
            return match ? match[0].length : 0
        }),
    )

    return lines.map((line) => line.slice(minIndent)).join('\n')
}

export type NewExtractedNode = {
    nodeId: string
    newContent: string
    attributes: Record<string, string>
    parentId?: string
    beforeNodeId?: string
    afterNodeId?: string
}

export function extractObjectsFromXmlContent(xml: string) {
    const results: NewExtractedNode[] = []

    const handler = new DomHandler((error, dom) => {
        if (error) {
            console.error('error', error)
        } else {
            const dfs = (node: any, lastParentWithId?: string) => {
                let currentParentId = lastParentWithId
                
                if (
                    node.type === ElementType.Tag &&
                    node.attribs &&
                    node.attribs.nodeId
                ) {
                    const nodeId = node.attribs.nodeId
                    let text = ''

                    // Only get direct text children, not all descendants
                    if (node.children) {
                        node.children.forEach((child: any) => {
                            if (child.type === 'text') {
                                text += child.data
                            }
                        })
                    }

                    const attributes = { ...node.attribs }
                    delete attributes.nodeId

                    const extractedNode: NewExtractedNode = {
                        nodeId,
                        newContent: deIndent(text).trim(),
                        attributes,
                    }

                    // Add parent information if available
                    if (lastParentWithId) {
                        extractedNode.parentId = lastParentWithId
                    }
                    
                    // This node becomes the parent for its children
                    currentParentId = nodeId

                    results.push(extractedNode)
                }

                if (node.children) {
                    // Pass the current parent ID (either this node's ID or the last parent with ID)
                    node.children.forEach((child: any) => dfs(child, currentParentId))
                }
            }

            dom.forEach((node: any) => dfs(node))

            // Group nodes by their parent
            const nodesByParent = new Map<string | undefined, NewExtractedNode[]>()
            results.forEach(node => {
                const parentId = node.parentId
                if (!nodesByParent.has(parentId)) {
                    nodesByParent.set(parentId, [])
                }
                nodesByParent.get(parentId)!.push(node)
            })

            // Calculate siblings for each group
            nodesByParent.forEach((siblings) => {
                siblings.forEach((node, index) => {
                    // Set beforeNodeId if there's a previous sibling
                    if (index > 0) {
                        node.beforeNodeId = siblings[index - 1].nodeId
                    }

                    // Set afterNodeId if there's a next sibling
                    if (index < siblings.length - 1) {
                        node.afterNodeId = siblings[index + 1].nodeId
                    }
                })
            })
        }
    })

    const parser = new Parser(handler, { xmlMode: true })
    parser.write(xml)
    parser.end()

    return results
}

export function xmlToFramerLayersTree(xml: string): FramerLayersTree {
    const handler = new DomHandler()
    const parser = new Parser(handler, { xmlMode: true })
    parser.write(xml)
    parser.end()

    function processNode(node: any): FramerLayersTree[number] | null {
        if (node.type !== 'tag') {
            return null
        }

        const result: FramerLayersTree[number] = {
            name: node.name,
        }

        if (node.attribs) {
            const { nodeId, ...attrs } = node.attribs
            if (nodeId) {
                result.nodeId = nodeId
            }
            if (Object.keys(attrs).length > 0) {
                result.attributes = attrs
            }
        }

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

        return result
    }

    const rootNodes = handler.dom
        .filter((node: any) => node.type === 'tag')
        .map(processNode)
        .filter((n): n is FramerLayersTree[number] => n !== null)
    return addNodeCount(rootNodes)
}

export function framerLayersTreeToXml(
    tree: FramerLayersTree,
    options: {
        shouldAddNodeIdAlways?: boolean
        indent?: string
        showReplicaChildren?: boolean
    } = {},
): string {
    const { shouldAddNodeIdAlways = false, indent = '' } = options
    let xml = ''

    for (const node of tree) {
        if (!node) {
            continue
        }

        if (node.name === '') {
            if (node.content) {
                xml += `${indent}${escapeXml(node.content)}\n`
            }
            if (node.children && node.children.length > 0) {
                xml += framerLayersTreeToXml(node.children, {
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
                    if (comment != null && comment) {
                        hasComments = true
                        attributes.push(
                            `<!-- ${comment} -->\n${indent}    ${key}="${value}"`,
                        )
                    } else {
                        attributes.push(`${key}="${value}"`)
                    }
                }
            }
        }

        const attributesString =
            attributes.length > 0
                ? hasComments || attributes.length >= 3
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
            xml += framerLayersTreeToXml(node.children, {
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

    if (tree?.length === 0) return result

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

    for (const rootNode of tree) {
        countNodes(rootNode)
    }
    return tree
}
