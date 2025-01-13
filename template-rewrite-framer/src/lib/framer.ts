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
import {
    collectGenerator,
    getParentNodes,
} from 'template-rewrite-framer/src/lib/utils'
import { OldTextTree } from 'website/src/lib/rewrite'
import { cleanupOldTextTree, bfsOldTextTree } from 'website/src/lib/utils'

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

function nineCharsRandomString() {
    return Math.random().toString(36).substring(2, 11)
}

async function push({
    node,
    tree,
    text,
    nodeId,
    controlKey,
    addControlsAsAttrs: addControls = false,
}: {
    tree: OldTextTree
    node: AnyNode
    text?: string
    nodeId: string
    controlKey?: string
    addControlsAsAttrs: boolean
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
        controlKey,
    }
    if (addControls && isComponentInstanceNode(node)) {
        attributes = {
            ...attributes,
            ...node.controls,
        }
    }

    // Add the actual node
    currentLevel.push({
        content: text,
        nodeId,
        name: 'name' in node ? node.name : '',
        attributes,
        children: [],
    })
    return tree
}

export type NodeWithControl = { node: AnyNode; controlKey: string }

export async function getFramerTree({
    rootNodes,
    instanceNodes,
    recursive = true,
    addControlsAsAttrs = false,
}: {
    rootNodes: AnyNode[]
    recursive?: boolean
    instanceNodes: Map<string, NodeWithControl>
    addControlsAsAttrs?: boolean
}) {
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
                    addControlsAsAttrs,
                })
            }
        }
        if (isComponentInstanceNode(node)) {
            const isVisible = await isNodeVisible(node)
            if (!isVisible) {
                console.log('node not visible', node.id)
                return
            }

            if (addControlsAsAttrs) {
                const _component = await getInstanceComponent(node)
                if (!_component) {
                    return
                }
                oldText = await push({
                    node,
                    tree: oldText,
                    nodeId: node.id,
                    addControlsAsAttrs,
                })
            } else {
                const controls = Object.entries(node.controls)

                for (let [key, value] of controls) {
                    if (
                        typeof value === 'string' &&
                        // TODO check type when framer supports it
                        possibleInstanceTextFields.includes(
                            key.toLocaleLowerCase(),
                        )
                    ) {
                        let nodeId = nineCharsRandomString()
                        instanceNodes.set(nodeId, {
                            node,
                            controlKey: key,
                        })

                        oldText = await push({
                            // parent: node,
                            controlKey: key,
                            node,
                            nodeId,
                            tree: oldText,
                            text: value,
                            addControlsAsAttrs,
                        })
                    }
                }
            }
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
    return oldText
}

export async function discardFramerChanges({
    previousOldText,
    instanceNodes,
}: {
    previousOldText: OldTextTree
    instanceNodes: Map<string, NodeWithControl>
}) {
    const allNodes = bfsOldTextTree(previousOldText).filter((x) => x?.nodeId)
    const promises = allNodes.map(async (oldNodeObj) => {
        const { nodeId, content: oldContent } = oldNodeObj
        if (!oldContent || !nodeId) {
            console.log('no old content or node id found')
            return Promise.resolve()
        }

        let node =
            instanceNodes.get(nodeId)?.node || (await framer.getNode(nodeId))

        if (isTextNode(node)) {
            // console.log('setting text', oldContent)
            return await node.setText(oldContent)
        }
        let instance = instanceNodes.get(nodeId)
        if (instance && isComponentInstanceNode(instance.node)) {
            const { node, controlKey } = instance
            let controls = { ...node.controls }
            controls[controlKey] = oldContent
            return await node.setAttributes({
                controls,
            })
        }
    })
    return await Promise.all(promises)
}
