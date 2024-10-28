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
