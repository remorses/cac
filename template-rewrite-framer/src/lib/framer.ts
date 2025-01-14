import {
    AnyNode,
    isComponentInstanceNode,
    framer,
    isComponentNode,
    isFrameNode,
    supportsVisible,
    supportsName,
    supportsLink,
    isTextNode,
    WithControlAttributesTrait,
} from 'framer-plugin'
import type { PropertyControls, ControlDescription } from 'unframer'
import {
    collectGenerator,
    getParentNodes,
} from 'template-rewrite-framer/src/lib/utils'
import { OldTextTree } from 'website/src/lib/rewrite'
import { cleanupOldTextTree, bfsOldTextTree } from 'website/src/lib/utils'
import {
    decodeControlAttributes,
    encodeControlAttributes,
} from 'website/src/lib/xml'

export async function getComponentAttributesComments(url?: string) {
    if (!url) return
    try {
        const res = await import(url)
        return getAttributeComments(res.default?.propertyControls)
    } catch (e) {
        console.log('failed to import component schema', e)
        return
    }
}

export enum ControlType {
    Boolean = 'boolean',
    Number = 'number',
    String = 'string',
    RichText = 'richtext',
    FusedNumber = 'fusednumber',
    Enum = 'enum',
    SegmentedEnum = 'segmentedenum',
    Color = 'color',
    Image = 'image',
    ResponsiveImage = 'responsiveimage',
    File = 'file',
    ComponentInstance = 'componentinstance',
    Array = 'array',
    EventHandler = 'eventhandler',
    Transition = 'transition',
    BoxShadow = 'boxshadow',
    Link = 'link',
    Date = 'date',
    Object = 'object',
    Font = 'font',
    PageScope = 'pagescope',
    ScrollSectionRef = 'scrollsectionref',
    CustomCursor = 'customcursor',
    Border = 'border',
    Cursor = 'cursor',
    Padding = 'padding',
    BorderRadius = 'borderradius',
    CollectionReference = 'collectionreference',
    MultiCollectionReference = 'multicollectionreference',
}

export function getAttributeComments(controls?: PropertyControls) {
    if (!controls) {
        return {}
    }

    const result: Record<string, string> = {}
    Object.entries(controls || ({} as PropertyControls)).forEach(
        ([key, value]) => {
            if (!value) {
                return
            }

            const typescriptType = (value: ControlDescription<any>): string => {
                switch (value.type) {
                    case ControlType.Color:
                        return 'string'
                    case ControlType.Boolean:
                        return 'boolean'
                    case ControlType.Number:
                        return 'number'
                    case ControlType.String:
                        return 'string'
                    case ControlType.Enum: {
                        // @ts-expect-error
                        const options = value.optionTitles || value.options
                        return options.map((x) => `'${x}'`).join(' | ')
                    }
                    case ControlType.File:
                        return 'string'
                    case ControlType.Image:
                        return 'string'
                    case ControlType.ComponentInstance:
                        return ''
                        return 'React.ReactNode'
                    case ControlType.Array:
                        // @ts-expect-error
                        return `${typescriptType(value.control)}[]`
                    case ControlType.Object:
                        // @ts-expect-error
                        return `{${Object.entries(value.controls)
                            .map(([k, v]) => {
                                // @ts-expect-error
                                return `${k}: ${typescriptType(v)}`
                            })
                            .join(', ')}}`
                    case ControlType.Date:
                        return 'DateString'
                    case ControlType.Link:
                        return 'LinkString'
                    case ControlType.ResponsiveImage:
                        return ''
                        return `{src: string, srcSet?: string, alt?: string}`
                    case ControlType.FusedNumber:
                        return 'number'
                    case ControlType.Transition:
                        return ''
                        return 'any'
                    case ControlType.EventHandler:
                        return ''
                        return 'Function'
                    default:
                        return 'any'
                }
            }

            result[key] = typescriptType(value)
        },
    )
    return result
}

Object.assign(globalThis, {
    getComponentSchema: getComponentAttributesComments,
})
async function getInstanceComponent(componentInstance: AnyNode) {
    if (!isComponentInstanceNode(componentInstance)) {
        return
    }
    // console.log('controls', componentInstance.controls)
    if (!componentInstance.componentIdentifier.startsWith('local-module:')) {
        console.log(`component ${componentInstance.name} is not a local module`)
        return
    }
    const regex = /local-module:.*\/(.*):.*/
    const match = componentInstance.componentIdentifier.match(regex)
    if (!match) {
        console.log(
            `component ${componentInstance.name} does not match regex to get component id`,
        )
        return
    }

    const componentId = match[1]
    const componentNode = await framer.getNode(componentId)
    if (!componentNode || !isComponentNode(componentNode)) {
        console.log(`could not find component node for ${componentId}`)
        return
    }

    return componentNode
}

async function getComponentCodeUrl(componentNode?: AnyNode) {
    // example is https://framer.com/m/FAQ-Row-Copy-FR9A9RBHB.js
    // https://framer.com/m/AccordionOne-V8Wz.js@FR9A9RBHB
    if (isComponentInstanceNode(componentNode)) {
        return await getComponentCodeUrl(
            await getInstanceComponent(componentNode),
        )
    }
    if (isComponentNode(componentNode)) {
        let nameEncoding = componentNode.name || ''
        if (!nameEncoding) {
            return
        }

        // turn FAQ Row Copy into FAQ-Row-Copy, replace space with -
        nameEncoding = nameEncoding.replace(/ +/g, '-')
        nameEncoding = encodeURIComponent(nameEncoding)
        let id = componentNode.id
        return `https://framer.com/m/${nameEncoding}-${id}.js`
    }
    // console.log('not a component node', componentNode?.constructor?.name)
}
Object.assign(globalThis, { getComponentCodeUrl })

async function* recurseIntoComponent(
    componentInstance: AnyNode,
    encounteredIds: Set<string>,
) {
    const componentNode = await getInstanceComponent(componentInstance)
    if (!componentNode) {
        return
    }
    const primary = (await componentNode.getChildren()).find(
        (x) => isFrameNode(x) && !x.isReplica,
    )
    if (!primary) {
        console.log('no primary child for component found')
        return
    }

    for await (let child of primary.walk()) {
        if (!encounteredIds.has(child.id)) {
            encounteredIds.add(child.id)
            yield child
            yield* recurseIntoComponent(child, encounteredIds)
        }
    }
    // TODO get modified text nodes in replicas, so there is nothing left that is stale because text is overridden in breakpoint
}

async function isNodeVisible(node: AnyNode) {
    const parents = await collectGenerator(getParentNodes(node))
    const isVisible = parents.every((parent) => {
        if (supportsVisible(parent)) {
            return parent.visible
        }
        return true
    })
    return isVisible && (!supportsVisible(node) || node.visible)
}
export async function isNodeZoomable(node: AnyNode) {
    if (!(await isNodeVisible(node))) {
        return false
    }
    return true
    // const parents = await collectGenerator(getParentNodes(node))
    // const componentChild = parents.some((parent) => {
    //     if (isComponentNode(parent)) {
    //         return true
    //     }
    //     return false
    // })
    // return !componentChild
}

const possibleInstanceTextFields = [
    'text',
    'placeholder',
    'label',
    'title',
    'description',
    'hint',
    'question',
    'answer',
    'buttontext',
    'content',
]



async function push({
    node,
    tree,
    text,
    nodeId,
}: {
    tree: OldTextTree
    node: AnyNode
    text?: string
    nodeId: string
}) {
    // console.trace('push')
    // console.log(`adding node ${node?.['name']}`)
    const parents = (await collectGenerator(getParentNodes(node))).reverse()
    let currentLevel = tree

    // Traverse or create the hierarchy
    for (let i = 0; i < parents.length; i++) {
        const parent = parents[i]

        let existingNode = currentLevel.find(
            (item) => item.nodeId === parent.id,
        )

        if (!existingNode) {
            existingNode = {
                // content: ,
                nodeId: parent.id,
                name: supportsName(parent) ? parent.name : '',
                children: [],
            }
            currentLevel.push(existingNode)
        }

        if (!existingNode.children) {
            existingNode.children = []
        }

        currentLevel = existingNode.children
    }

    let href = undefined as string | undefined
    if (supportsLink(node)) {
        href = node.link || undefined
    }
    let fontSize
    if (isTextNode(node)) {
        fontSize = node.inlineTextStyle?.fontSize || undefined
    }
    let attributes = {
        href,
        fontSize,
    }
    let attrControlsComments
    if (isComponentInstanceNode(node)) {
        attrControlsComments = await getComponentAttributesComments(
            node.insertURL || undefined,
        )
        attributes = {
            ...attributes,
            ...encodeControlAttributes(node.controls),
        }
    }

    // Add the actual node
    currentLevel.push({
        content: text,
        nodeId,
        name: 'name' in node ? node.name : '',
        attributes,
        attrControlsComments,
        children: [],
    })
    return tree
}
export async function getFramerTree({
    rootNodes,

    recursive = true,
}: {
    rootNodes: AnyNode[]
    recursive?: boolean
}) {
    const timeId = `getFramerTree-${Date.now()}-${Math.random().toString(36).slice(2)}`
    console.time(timeId)
    let oldText = [] as OldTextTree

    let componentInstanceChildrenSeen = new Set<string>()
    async function handleNode(node: AnyNode) {
        // console.log('node', node.constructor.name)

        if (isTextNode(node)) {
            const isVisible = await isNodeVisible(node)
            if (!isVisible) {
                console.log('node not visible', node.id)
                return
            }
            const text = await node.getText()

            if (!text) {
                console.log('no text found for node', node.id, node.name)
                return
            }
            if (text) {
                oldText = await push({
                    node,
                    tree: oldText,
                    text,
                    nodeId: node.id,
                })
            }
        }
        if (isComponentInstanceNode(node)) {
            const isVisible = await isNodeVisible(node)
            if (!isVisible) {
                console.log('node not visible', node.id)
                return
            }

            // TODO what is this?
            // const _component = await getInstanceComponent(node)
            // if (!_component) {
            //     return
            // }
            oldText = await push({
                node,
                tree: oldText,
                nodeId: node.id,
            })
        }
    }

    for (let rootNode of rootNodes) {
        if (!rootNode) {
            continue
        }

        for await (let node of rootNode.walk()) {
            await handleNode(node)
            if (recursive) {
                for await (let child of recurseIntoComponent(
                    node,
                    componentInstanceChildrenSeen,
                )) {
                    await handleNode(child)
                }
            }
        }
    }

    oldText = cleanupOldTextTree(oldText)
    console.timeEnd(timeId)
    return oldText
}

export async function discardFramerChanges({
    previousOldText,
}: {
    previousOldText: OldTextTree
}) {
    const allNodes = bfsOldTextTree(previousOldText).filter((x) => x?.nodeId)
    const promises = allNodes.map(async (oldNodeObj) => {
        const { nodeId, content: oldContent, attributes } = oldNodeObj
        if (!oldContent || !nodeId) {
            console.log('no old content or node id found')
            return Promise.resolve()
        }

        let node = await framer.getNode(nodeId)

        if (isTextNode(node)) {
            // console.log('setting text', oldContent)
            return await node.setText(oldContent)
        }

        if (isComponentInstanceNode(node)) {
            node.controls
            await node.setAttributes({
                controls: { ...decodeControlAttributes(attributes) },
            })
        }
    })
    return await Promise.all(promises)
}
