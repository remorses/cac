import {
    AnyNode,
    framer,
    isComponentInstanceNode,
    isComponentNode,
    isFrameNode,
    isTextNode,
    supportsLink,
    supportsName,
    supportsVisible,
} from 'framer-plugin'
import type { ControlDescription, PropertyControls } from 'unframer/src/index'
import { propCamelCaseJustLikeFramer } from 'unframer/src/compat'
import { FramerLayersTree } from './types'
import { bfsFramerLayersTree, cleanupTreeFromEmptyNodes } from './tree-utils'

let cachedPagePaths: string[] = []

async function getPagePaths() {
    if (cachedPagePaths?.length) return cachedPagePaths
    const pages = await framer.getNodesWithType('WebPageNode')
    cachedPagePaths = pages
        .map((x) => x.path)
        .filter((val) => val != null)
        .filter((val) => !val?.includes(':'))
    return cachedPagePaths
}

export function replaceEnumIdsForControls(
    controls: any,
    propControls?: PropertyControls,
) {
    try {
        if (!controls || !propControls) return controls
        controls = { ...controls }
        for (let [k, value] of Object.entries(
            propControls || ({} as PropertyControls),
        )) {
            if (!value) continue
            const propName = propCamelCaseJustLikeFramer(value.title) || k
            switch (value.type) {
                case ControlType.Enum: {
                    if (!('optionTitles' in value)) {
                        return ''
                    }
                    const optionTitles = value.optionTitles || value.options
                    let v = controls[propName] || controls[k]

                    const optionIndex = value.options.indexOf(v)
                    const enumTitle = optionTitles[optionIndex]
                    if (optionIndex !== -1 && enumTitle) {
                        controls[propName] = enumTitle
                    }
                }
            }
        }
        return controls
    } catch (e) {
        console.error('replaceEnumIdsForControls error:', e)
        return controls
    }
}

export async function getComponentPropertyControls(url?: string | null) {
    if (!url) return { comments: undefined, propertyControls: undefined }
    try {
        // @vite-ignore
        const [res, paths] = await Promise.all([import(url), getPagePaths()])
        const propertyControls: PropertyControls = res.default?.propertyControls
        const comments = getAttributeComments(propertyControls, paths)
        return {
            comments,
            propertyControls,
        }
    } catch (e) {
        console.log('failed to import component schema', e)
        return { comments: undefined, propertyControls: undefined }
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

export function getAttributeComments(
    controls?: PropertyControls,
    availablePagePaths: string[] = ['/'],
) {
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
                        return 'color value'
                    case ControlType.Boolean:
                        return 'boolean'
                    case ControlType.Number:
                        return 'number'
                    case ControlType.String:
                        return ''
                    case ControlType.Enum: {
                        if (!('optionTitles' in value)) {
                            return ''
                        }
                        const options = value.optionTitles || value.options
                        return options
                            .map((x, i) => `'${x}' is ${value.options[i]}`)
                            .join(', ')
                    }
                    case ControlType.File:
                        return 'file'
                    case ControlType.Image:
                        return 'image'
                    case ControlType.ComponentInstance:
                        return 'component instance'
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
                        return `url or a path amongst ${JSON.stringify(availablePagePaths)}`
                    case ControlType.ResponsiveImage:
                        return 'responsive image'
                        return `{src: string, srcSet?: string, alt?: string}`
                    case ControlType.FusedNumber:
                        return 'number'
                    case ControlType.Transition:
                        return 'transition'
                        return 'any'
                    case ControlType.EventHandler:
                        return 'event handler'
                        return 'Function'
                    case ControlType.RichText:
                        return 'rich text'
                    case ControlType.Font:
                        return 'font'
                    case ControlType.BoxShadow:
                        return 'box shadow'
                    case ControlType.Padding:
                        return 'padding'
                    case ControlType.Border:
                        return 'border'
                    case ControlType.BorderRadius:
                        return 'border radius, four px values delimited by space'

                    default:
                        return 'any'
                }
            }

            result[key] = typescriptType(value)
            const propName = propCamelCaseJustLikeFramer(value.title)
            if (propName) result[propName] = typescriptType(value)
        },
    )
    return result
}

Object.assign(globalThis, {
    getComponentSchema: getComponentPropertyControls,
})

export function getInstanceComponentId(componentInstance: AnyNode) {
    if (!isComponentInstanceNode(componentInstance)) {
        return
    }
    if (!componentInstance.componentIdentifier.startsWith('local-module:')) {
        console.log(
            `component ${componentInstance.name} is not a local module: ${componentInstance.componentIdentifier} `,
        )
        return
    }
    const regex = /local-module:.*\/(.*):.*/
    const match = componentInstance.componentIdentifier.match(regex)
    if (!match) {
        console.log(
            `component ${componentInstance.name} does not match regex to get component id: ${componentInstance.componentIdentifier} `,
        )
        return
    }
    return match[1]
}

async function getInstanceComponent(componentInstance: AnyNode) {
    const componentId = getInstanceComponentId(componentInstance)
    if (!componentId) {
        return
    }
    const componentNode = await framer.getNode(componentId)
    if (!componentNode || !isComponentNode(componentNode)) {
        console.log(`could not find component node for ${componentId}`)
        return
    }

    return componentNode
}

async function getComponentCodeUrl(componentNode?: AnyNode) {
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

        nameEncoding = nameEncoding.replace(/ +/g, '-')
        nameEncoding = encodeURIComponent(nameEncoding)
        let id = componentNode.id
        return `https://framer.com/m/${nameEncoding}-${id}.js`
    }
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
}

async function push({
    node,
    tree,
    text,
    nodeId,
}: {
    tree: FramerLayersTree
    node: AnyNode
    text?: string
    nodeId: string
}) {
    const parents = (await collectGenerator(getParentNodes(node))).reverse()
    let currentLevel = tree

    for (let i = 0; i < parents.length; i++) {
        const parent = parents[i]

        let existingNode = currentLevel.find(
            (item) => item.nodeId === parent.id,
        )

        if (!existingNode) {
            existingNode = {
                nodeId: parent.id,
                name: supportsName(parent) ? parent.name || '' : '',
                children: [],
            }
            currentLevel.push(existingNode)
        }

        if (!existingNode.children) {
            existingNode.children = []
        }

        currentLevel = existingNode.children
    }

    const { attributes, attrControlsComments } =
        await getNodeAttributesForXml(node)

    currentLevel.push({
        content: text,
        nodeId,
        name: 'name' in node ? node.name || '' : '',
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
    let tree = [] as FramerLayersTree

    let componentInstanceChildrenSeen = new Set<string>()
    async function handleNode(node: AnyNode) {
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
                tree = await push({
                    node,
                    tree: tree,
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

            tree = await push({
                node,
                tree: tree,
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

    tree = cleanupTreeFromEmptyNodes(tree)
    console.timeEnd(timeId)
    return tree
}

export async function discardFramerChanges({
    previousTree: previousTree,
}: {
    previousTree: FramerLayersTree
}) {
    const allNodes = bfsFramerLayersTree(previousTree).filter((x) => x?.nodeId)
    const promises = allNodes.map(async (oldNodeObj) => {
        const { nodeId, content: oldContent, attributes } = oldNodeObj
        if (!oldContent || !nodeId) {
            console.log('no old content or node id found')
            return Promise.resolve()
        }

        let node = await framer.getNode(nodeId)

        if (isTextNode(node)) {
            return await node.setText(oldContent)
        }

        await applyAttributes(node, attributes)
    })
    return await Promise.all(promises)
}

export const inlineTextStyleAttributes = [
    'fontSize',
    'color',
    'alignment',
    'letterSpacing',
    'lineHeight',
] as const

async function getNodeAttributesForXml(node: AnyNode) {
    let attributes = {} as Record<string, any>

    if (supportsLink(node) && node.link) {
        attributes.href = node.link || undefined
    }
    if (isTextNode(node)) {
        node.inlineTextStyle?.color
        node.inlineTextStyle?.font
        node.inlineTextStyle?.fontSize
        node.inlineTextStyle?.letterSpacing
        node.inlineTextStyle?.paragraphSpacing
        node.inlineTextStyle?.lineHeight
        node.inlineTextStyle?.alignment
        node.inlineTextStyle?.decoration
        node.inlineTextStyle?.boldFont
        for (const attr of inlineTextStyleAttributes) {
            const value = node.inlineTextStyle?.[attr] ?? undefined
            if (value) attributes[attr] = value
        }
        if (node.opacity !== 1) {
            attributes.opacity = node.opacity ?? undefined
        }
    }
    if (isFrameNode(node)) {
        if (typeof node.backgroundColor === 'string') {
            attributes.backgroundColor = node.backgroundColor
        }
        if (node.borderRadius) {
            attributes.borderRadius = node.borderRadius ?? undefined
        }
    }

    let attrControlsComments
    if (isComponentInstanceNode(node)) {
        if (!node.insertURL) {
            console.log(`no node.insertURL for compnoent instance ${node.name}`)
        }
        const { comments, propertyControls } =
            await getComponentPropertyControls(node.insertURL || undefined)
        if (comments) {
            attrControlsComments = comments
        }

        const controls = node.controls
        attributes = {
            ...attributes,
            ...controls,
        }
    }
    attributes = serializeAttributesForXml(attributes)

    return {
        attributes,
        attrControlsComments,
    }
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

export function serializeAttributesForXml(
    attributes?: Record<string, any>,
): Record<string, string> {
    if (!attributes) {
        return {}
    }
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(attributes)) {
        if (typeof value === 'object') {
            console.log('skipping object value for attribute', key, value)
            continue
        }
        result[key] = encodeAttributeValue(value)
    }
    return result
}

function decodeAttributeValueAsJson(value: string) {
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

function onlyChangedKeys(
    oldObj: Record<string, any>,
    newObj: Record<string, any>,
): Record<string, any> {
    const changes: Record<string, any> = {}
    for (const [key, newValue] of Object.entries(newObj)) {
        const oldValue = oldObj[key]
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes[key] = newValue
        }
    }
    return changes
}

export async function applyAttributes(
    node?: AnyNode | null,
    _attributes?: Record<string, any>,
): Promise<void> {
    if (!node || !_attributes || !Object.keys(_attributes).length) {
        return
    }

    const decodedAttrs: Record<string, any> = {}
    for (const [key, value] of Object.entries(_attributes)) {
        decodedAttrs[key] = decodeAttributeValueAsJson(value)
    }

    if (supportsLink(node) && decodedAttrs.href) {
        await node.setAttributes({ link: decodedAttrs.href })
    }

    if (isTextNode(node)) {
        await node.setAttributes(onlyChangedKeys(node, decodedAttrs))

        const inlineTextStyleObj: Record<string, any> = {}
        for (let attrName of inlineTextStyleAttributes) {
            if (decodedAttrs[attrName] !== undefined) {
                inlineTextStyleObj[attrName] = decodedAttrs[attrName]
            }
        }

        await node.inlineTextStyle?.setAttributes(
            onlyChangedKeys(node.inlineTextStyle || {}, inlineTextStyleObj),
        )
    } else if (isComponentInstanceNode(node)) {
        await node.setAttributes(onlyChangedKeys(node || {}, decodedAttrs))
        await node.setAttributes({
            controls: onlyChangedKeys(node.controls || {}, decodedAttrs),
        })
    } else {
        await node.setAttributes(onlyChangedKeys(node, decodedAttrs))
    }
}

// Helper functions that need to be in this package
async function collectGenerator<T>(
    gen: AsyncGenerator<T | null, void, unknown>,
) {
    const result = [] as T[]
    for await (const item of gen) {
        if (!item) {
            continue
        }
        result.push(item)
    }
    return result
}

async function* getParentNodes(node: AnyNode | string | null) {
    if (typeof node === 'string') {
        node = await framer.getNode(node)
    }
    if (!node) {
        return
    }
    let parent = await node.getParent()
    if (!parent) {
        console.log('no parent found', node.id)
        return
    }
    while (parent) {
        yield parent
        if (isComponentNode(parent) || isComponentNode(parent)) {
            return
        }
        let newParent = await parent.getParent()
        if (!newParent) {
            console.log('no parent found, last one was', parent)
            yield parent
            return
        }
        parent = newParent
    }
}
