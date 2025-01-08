import { DomHandler, Parser, ElementType } from 'htmlparser2'
import domSerializer from 'dom-serializer'

interface RewriteOldTextContentParams {
    xml: string
    newContent: { nodeId: string; newContent?: string }[]
}

export function rewriteXmlContent({
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
            console.error(error)
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
