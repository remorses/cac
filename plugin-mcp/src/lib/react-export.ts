import {
    ComponentInstanceNode,
    ComponentNode,
    WebPageNode,
    framer,
    isComponentNode,
    isFrameNode,
    isWebPageNode,
} from 'framer-plugin'
import {
    getComponentPropertyControls,
    getInstanceComponentId,
    replaceEnumIdsForControls,
} from './framer.js'
import { isTruthy } from './utils.js'

// Type definitions
export interface ReactExportComponentInstance {
    componentId: string
    controls: Record<string, any>
    webPageId: string
    projectId: string
    nodeDepth: number
    pageOrdering: number
}

interface ComponentWithBreakpoints {
    component: ComponentNode
    breakpoints?: Array<{
        variantId: string
        width: number
        breakpointName: string
    }>
}

interface InstanceWithOrderAndDepth {
    componentId: string
    controls: Record<string, any>
    parentsOrderings: number[]
    webPageId: string
    projectId: string
    nodeDepth: number
}

// Helper functions that need to be imported from other packages
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

async function* getParentNodes(node: any) {
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
        const newParent = await parent.getParent()
        if (!newParent) {
            console.log('no parent found, last one was', parent)
            yield parent
            return
        }
        parent = newParent
    }
}

async function getParentNodesWithOrdering(node: any) {
    if (typeof node === 'string') {
        node = await framer.getNode(node)
    }
    if (!node) {
        return []
    }

    const result = [] as {
        node: any
        ordering: number
    }[]
    let parent = await node.getParent()
    if (!parent) {
        console.log('no parent found', node.id)
        return []
    }

    let currentChild = node
    while (parent) {
        const siblings = await parent.getChildren()
        const ordering = siblings.findIndex((x) => x.id === currentChild.id)
        if (ordering === -1) {
            console.log('no ordering found for node', currentChild.id)
        }
        result.push({ node: parent, ordering })

        currentChild = parent
        // if (isComponentNode(parent) || isComponentNode(parent)) {
        //   break
        // }
        const newParent = await parent.getParent()
        if (!newParent) {
            console.log('no parent found, last one was', parent)
            return result
        }
        parent = newParent
    }

    return result
}

function deduplicateByKey<T>(
    items: T[],
    getKey: (item: T) => string | number,
): T[] {
    const seen = new Map<string | number, T>()
    for (const item of items) {
        const key = getKey(item)
        if (!seen.has(key)) {
            seen.set(key, item)
        }
    }
    return Array.from(seen.values())
}

function groupBy<T, K>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>()

    for (const item of items) {
        const key = keyFn(item)
        const collection = map.get(key) || []
        collection.push(item)
        map.set(key, collection)
    }

    return map
}

// Main export functions
export async function getInstancesWithOrderAndDepth({
    allInstances,
    webPageIds,
    components,
    projectId,
}: {
    allInstances: ComponentInstanceNode[]
    webPageIds: Set<string>
    components: ComponentNode[]
    projectId: string
}) {
    const componentIds = new Set(components.map((x) => x?.id))
    const componentsAlredyProcessed = new Set<string>()
    const rawComponentInstances = await Promise.all(
        allInstances.map(async (x) => {
            const componentId = getInstanceComponentId(x)
            if (!componentId) {
                console.log(
                    'no component id found for instance',
                    x.id,
                    x.componentIdentifier,
                )
                return
            }
            if (
                !componentIds.has(componentId) ||
                componentsAlredyProcessed.has(componentId)
            ) {
                return
            }

            const parents = await getParentNodesWithOrdering(x)
            const parentsOrderings = parents.map((x) => x.ordering)

            const pageParent = parents.find((x) => isWebPageNode(x.node))

            const webPageId = pageParent?.node?.id || ''

            const { propertyControls } = await getComponentPropertyControls(
                components.find((x) => x.id === componentId)?.insertURL,
            )
            componentsAlredyProcessed.add(componentId)
            const instance: InstanceWithOrderAndDepth = {
                componentId,
                controls: replaceEnumIdsForControls(
                    x.controls,
                    propertyControls,
                ),
                parentsOrderings,
                webPageId,
                projectId,
                nodeDepth: parents.length - 1,
            }
            return instance
        }),
    )
    const instancesGroups = Array.from(
        groupBy(
            rawComponentInstances.filter(isTruthy),
            (x) => x.webPageId,
        ).values(),
    )
    let componentInstances = instancesGroups.flatMap((group) => {
        return group
            .sort((a, b) => {
                const minParentLength = Math.min(
                    a.parentsOrderings?.length,
                    b.parentsOrderings?.length,
                )

                for (let i = 0; i < minParentLength; i++) {
                    if (a.parentsOrderings[i] < b.parentsOrderings[i]) {
                        return -1
                    }
                    if (a.parentsOrderings[i] > b.parentsOrderings[i]) {
                        return 1
                    }
                }

                // If all parent orderings are the same up to the minimum length,
                // the shorter array should come first
                return a.parentsOrderings.length - b.parentsOrderings.length
            })
            .map((x, pageOrdering) => {
                const { parentsOrderings, ...rest } = x
                const instance: ReactExportComponentInstance = {
                    ...rest,
                    controls:
                        JSON.parse(JSON.stringify(x.controls || {})) || {},
                    pageOrdering,
                }
                return instance
            })
    })
    componentInstances = deduplicateByKey(
        componentInstances,
        (x) => x.webPageId + x.componentId,
    )
    return componentInstances
}

export async function getComponentsWithBreakpoints({
    selectedComponentIds,
    components,
    allInstances,
}: {
    selectedComponentIds: Set<string>
    components: ComponentNode[]
    allInstances: ComponentInstanceNode[]
}): Promise<ComponentWithBreakpoints[]> {
    const filteredComponents = components.filter(
        (component) =>
            component.id &&
            component.insertURL &&
            selectedComponentIds.has(component.id),
    )

    const componentsWithBreakpoints = await Promise.all(
        filteredComponents.map(async (component) => {
            try {
                const instances = allInstances.filter((instance) => {
                    const id = getInstanceComponentId(instance)
                    return id === component.id
                })
                let breakpoints = await Promise.all(
                    instances.map(async (instance) => {
                        const variantId = String(
                            instance.controls?.variant || '',
                        )
                        if (!variantId) {
                            return
                        }
                        const parents = await collectGenerator(
                            getParentNodes(instance),
                        )
                        const [root, breakpointNode] = parents.reverse()
                        if (!isFrameNode(breakpointNode)) {
                            console.log(
                                'breakpoint is not a frame node for',
                                breakpointNode,
                            )
                            return
                        }
                        const breakpointName = breakpointNode?.name

                        let rect = await breakpointNode?.getRect()
                        return {
                            variantId,
                            width: rect?.width || 0,
                            breakpointName: breakpointName || '',
                        }
                    }),
                )
                const filteredBreakpoints = breakpoints.filter(
                    (x): x is NonNullable<typeof x> =>
                        Boolean(x?.breakpointName && x?.width && x?.variantId),
                )
                const deduplicatedBreakpoints = deduplicateByKey(
                    filteredBreakpoints,
                    (x) => x.variantId,
                )
                return { component, breakpoints: deduplicatedBreakpoints }
            } catch (err) {
                console.error('error getting component breakpoints', err)
                return { component }
            }
        }),
    )

    return componentsWithBreakpoints
}

export async function processReactExportData({
    selectedComponentIds,
}: {
    selectedComponentIds: Set<string>
}) {
    let [
        publishInfo,
        components,
        pages,
        styles,
        projectInfo,
        locales,
        allInstances,
        { id: framerUserId },
        codeFiles,
    ] = await Promise.all([
        framer.getPublishInfo().catch((e) => null),
        framer.getNodesWithType('ComponentNode'),
        framer.getNodesWithType('WebPageNode'),
        framer.getColorStyles(),
        framer.getProjectInfo(),
        framer.getLocales?.()?.catch((err) => {
            console.error('Error getting locales', err)
            return []
        }),
        framer.getNodesWithType('ComponentInstanceNode'),
        framer.getCurrentUser(),
        framer.getCodeFiles(),
    ])

    const { id: fullFramerProjectId, name: projectName } = projectInfo
    if (!fullFramerProjectId) {
        throw new Error('No project id found')
    }

    // Separate code file IDs from component node IDs
    const codeFileIds = new Set<string>()
    const componentNodeIds = new Set<string>()

    for (const id of selectedComponentIds) {
        // Check if it's a code file
        const isCodeFile = codeFiles.some((file) => file.id === id)
        if (isCodeFile) {
            codeFileIds.add(id)
        } else {
            componentNodeIds.add(id)
        }
    }

    const componentsWithBreakpoints = await getComponentsWithBreakpoints({
        selectedComponentIds: componentNodeIds,
        components,
        allInstances,
    })

    let websiteUrl =
        publishInfo?.staging?.currentPageUrl ||
        publishInfo?.staging?.url ||
        publishInfo?.production?.currentPageUrl ||
        publishInfo?.production?.url

    pages = pages.sort((a, b) => (a.path?.length || 0) - (b.path?.length || 0))

    const indexPage = pages.find((x) => x) as WebPageNode
    console.log('backgroundColor', indexPage['backgroundColor'])
    const [pageContainer] = (await indexPage.getChildren()) || []
    let pageBackgroundColor = ''
    if (isFrameNode(pageContainer) && pageContainer.backgroundColor) {
        if (typeof pageContainer.backgroundColor === 'string') {
            pageBackgroundColor = pageContainer.backgroundColor
        } else {
            pageBackgroundColor = pageContainer.backgroundColor?.light
        }
    }

    const componentInstances = await getInstancesWithOrderAndDepth({
        allInstances,
        webPageIds: new Set(pages.slice(1).map((x) => x.id)),
        components,
        projectId: projectInfo.id,
    }).catch((e) => {
        console.error('error getting component instances', e)
        return []
    })

    console.log(
        `found ${componentInstances?.length} componentInstances`,
        componentInstances,
    )

    return {
        projectId: fullFramerProjectId,
        projectName,
        fullFramerProjectId,
        framerUserId,
        websiteUrl,
        pageBackgroundColor,
        colorStyles: styles.map((x) => {
            const { dark, light, name, id } = x
            return {
                name,
                id,
                projectId: fullFramerProjectId!,
                lightColor: light,
                darkColor: dark ?? light,
            }
        }),
        components: [
            // Regular component nodes
            ...componentsWithBreakpoints.map(({ component }) => {
                const {
                    name,
                    id,
                    insertURL,
                    componentName,
                    componentIdentifier,
                } = component

                return {
                    name: name ?? '',
                    id,
                    url: insertURL ?? '',
                    projectId: fullFramerProjectId!,
                    componentIdentifier,
                    componentType: 'component' as const,
                }
            }),
            // Code file components (only default exports)
            ...codeFiles
                .filter((file) => codeFileIds.has(file.id))
                .filter((file) =>
                    file.exports.some((exp) => exp.type === 'component' && exp.isDefaultExport),
                )
                .map((file) => {
                    const componentExport = file.exports.find(
                        (exp) => exp.type === 'component' && exp.isDefaultExport,
                    )
                    const name = file.name.replace(/\.(jsx?|tsx?)$/, '')

                    return {
                        name,
                        id: file.id,
                        url: componentExport && 'insertURL' in componentExport ? componentExport.insertURL : '',
                        projectId: fullFramerProjectId!,
                        componentIdentifier: '',
                        componentType: 'codeFile' as const,
                    }
                }),
        ],
        breakpoints: componentsWithBreakpoints.flatMap(
            ({ breakpoints, component }) => {
                return (
                    breakpoints?.map((breakpoint) => {
                        const { variantId, width, breakpointName } = breakpoint!
                        return {
                            variantId: variantId!,
                            width: width || 0,
                            breakpointName: breakpointName || '',
                            componentId: component.id!,
                            projectId: fullFramerProjectId!,
                        }
                    }) || []
                )
            },
        ),
        pages: pages.map((page) => {
            const { id, collectionId, path } = page
            return {
                path: path ?? '',
                webPageId: id,
                projectId: fullFramerProjectId!,
            }
        }),
        locales: locales?.map((locale) => {
            const { id, name, slug, code } = locale
            return {
                id,
                name,
                slug,
                code,
                projectId: fullFramerProjectId!,
            }
        }),
        componentInstances,
    }
}
