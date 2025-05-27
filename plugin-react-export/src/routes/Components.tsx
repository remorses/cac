import { Button } from 'plugin-migrate/src/components/Button'
import {
    getComponentPropertyControls,
    getInstanceComponentId,
    replaceEnumIdsForControls,
    serializeAttributesForXml,
} from 'plugin-migrate/src/lib/framer'

import {
    isTruthy,
    LoaderReturnType,
    Paths,
    pluginApiClient,
    withMode,
} from '@/lib/utils'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useActionData,
    useLoaderData,
    useNavigation,
    useRevalidator,
} from 'react-router'

import { notifyError } from '@/lib/errors'
import { Prisma } from 'db'
import {
    ComponentInstanceNode,
    ComponentNode,
    framer,
    isFrameNode,
    isWebPageNode,
    WebPageNode,
} from 'framer-plugin'
import { useRefreshOnVisible } from 'plugin-migrate/src/lib/hooks'
import {
    collectGenerator,
    getParentNodes,
    getParentNodesWithOrdering,
} from 'plugin-migrate/src/lib/utils'
import { useEffect, useRef, useState } from 'react'
import {} from 'react-router'
import { Form, Link } from 'react-router-dom'
import { deduplicateByKey } from 'website/src/lib/utils'

async function loader({}: LoaderFunctionArgs) {
    const [components] = await Promise.all([
        framer.getNodesWithType('ComponentNode'),
    ])

    let { id: projectId } = await framer.getProjectInfo()
    let shortId = projectId.slice(0, 16)
    const [org, reactExportProject] = await Promise.all([
        pluginApiClient.api.plugins.currentOrg
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
        pluginApiClient.api.plugins.reactExportPlugin
            .project({ projectId: shortId })
            .get({})
            .then(({ data, error }) => {
                if (error) {
                    return null
                }
                return data
            })
            .catch((e) => null),
    ])

    const { email, orgId } = org
    let componentsData = components.map((component) => {
        const { name, id, insertURL, componentIdentifier } = component

        return { name, id, insertURL, componentIdentifier, node: component }
    })
    const componentIds = reactExportProject?.components?.map((x) => x.id) || []
    return { componentIds, email, orgId, componentsData }
}

async function getInstancesWithOrderAndDepth({
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
    const rawComponentInstances = await Promise.all(
        allInstances.map(async (x) => {
            const componentId = getInstanceComponentId(x)
            if (!componentId) {
                console.log('no component id found for instance', x.id)
                return
            }
            if (!componentIds.has(componentId)) {
                // console.log(
                //     'skipping instance with invalid component id',
                //     x.id,
                //     componentId,
                // )
                return
            }

            const parents = await getParentNodesWithOrdering(x)
            const parentsOrderings = parents.map((x) => x.ordering)

            const pageParent = parents.find((x) => isWebPageNode(x.node))
            if (!pageParent) {
                console.log('no page parent found for instance', x.id)
                return
            }

            const webPageId = pageParent?.node?.id
            if (!webPageIds.has(webPageId)) {
                console.log(
                    'skipping instance with invalid web page id',
                    x.id,
                    webPageId,
                )

                return
            }
            const { propertyControls } = await getComponentPropertyControls(
                components.find((x) => x.id === componentId)?.insertURL,
            )
            const instance = {
                componentId,
                controls: replaceEnumIdsForControls(
                    x.controls,
                    propertyControls,
                ),
                parentsOrderings,
                // componentName: x.name,
                // parents: parents.map(
                //     (x) => x['name'] || x['path'] || x['__class'],
                // ),
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
                const instance: Prisma.ReactExportComponentInstanceUncheckedCreateInput =
                    {
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

async function action({ request }: LoaderFunctionArgs) {
    const formData = await request.formData()

    const [
        publishInfo,
        components,
        pages,
        styles,
        projectInfo,
        locales,
        allInstances,
        { id: framerUserId },
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
    ])

    // throw redirect(withMode(Paths.readme))
    const { id: fullFramerProjectId, name: projectName } = projectInfo
    if (!fullFramerProjectId) {
        throw new Error('No project id found')
    }
    const selectedComponentIds = new Set(formData.keys())
    // console.log('selectedComponentIds', [...selectedComponentIds])
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

                        // console.log(component.name, variantId, breakpointName)
                        let rect = await breakpointNode?.getRect()
                        return {
                            variantId,
                            width: rect?.width,
                            breakpointName,
                        }
                    }),
                )
                breakpoints = breakpoints.filter(
                    (x) => x?.breakpointName && x?.width && x?.variantId,
                )
                breakpoints = deduplicateByKey(
                    breakpoints,
                    (x) => x?.variantId || '',
                )
                return { component, breakpoints }
            } catch (err) {
                notifyError(err, 'error getting component breakpoints')
                return { component }
            }
        }),
    )

    // console.log('publishInfo', publishInfo)
    let websiteUrl =
        publishInfo?.staging?.currentPageUrl ||
        publishInfo?.staging?.url ||
        publishInfo?.production?.currentPageUrl ||
        publishInfo?.production?.url

    const webPageIds = new Set(pages.map((x) => x.id))

    const indexPage = pages
        .sort((a, b) => (a.path?.length || 0) - (b.path?.length || 0))
        .find((x) => x) as WebPageNode
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
        webPageIds,
        components,
        projectId: projectInfo.id,
    }).catch((e) => {
        notifyError(e, 'error getting component instances')
        return []
    })
    // debugLog('rawComponentInstances', rawComponentInstances)

    const { error, data } =
        await pluginApiClient.api.plugins.reactExportPlugin.upsertProject.post({
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
                    darkColor: dark ?? light, // Ensure darkColor is never null
                }
            }),
            components: componentsWithBreakpoints.map(({ component }) => {
                const { name, id, insertURL, componentIdentifier } = component

                return {
                    name: name ?? '',
                    id,
                    url: insertURL ?? '',
                    projectId: fullFramerProjectId!,
                    componentIdentifier,
                }
            }),
            breakpoints: componentsWithBreakpoints.flatMap(
                ({ breakpoints, component }) => {
                    return (
                        breakpoints?.map((breakpoint) => {
                            const { variantId, width, breakpointName } =
                                breakpoint!
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
                    path: path ?? '', // Ensure path is never null
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
        })
    if (error) {
        throw error
    }
    console.log(data)
    throw redirect(withMode(Paths.readme))
}

export function Components(): RouteObject {
    return {
        path: Paths.components,
        loader,
        action,
        Component,
    }
}
function Component() {
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    useRefreshOnVisible({ enabled: !isLoading })
    const { email } = useLoaderData() as LoaderReturnType<typeof loader>
    const actionData = useActionData() as LoaderReturnType<typeof action>
    const { componentsData, componentIds = [] } =
        useLoaderData() as LoaderReturnType<typeof loader>
    const revalidate = useRevalidator()

    // Subscribe to canvas changes to detect new components
    useEffect(() => {
        let componentsCount = framer
            .getNodesWithType('ComponentNode')
            .then((x) => x.length)
        const unsubscribe = framer.subscribeToCanvasRoot(async (event) => {
            let newComponentCount = await framer
                .getNodesWithType('ComponentNode')
                .then((x) => x.length)
            if (newComponentCount !== (await componentsCount)) {
                componentsCount = Promise.resolve(newComponentCount)
                revalidate.revalidate()
            }
        })
        return () => unsubscribe()
    }, [])

    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(() => {
        if (componentIds.length) {
            return componentIds
        }
        return componentsData.slice(0, 10).map((x) => x.id)
    })

    if (!componentsData?.length) {
        return (
            <div className='flex flex-col items-center justify-center gap-4 p-8 text-center'>
                <h2 className='font-medium'>No Components Found</h2>
                <p className='text-framer-secondary'>
                    To create a component in Framer, select any layer, right
                    click and select "Create Component".
                </p>
            </div>
        )
    }

    return (
        <Form method='POST' className='flex-1 flex flex-col gap-4'>
            {/* <div className=' flex flex-col px-4 items-center justify-center'>
                <h1 className='text-balance text-center text-md '>
                    Select which components you want to export from your{' '}
                    {componentsData.length} available components
                </h1>
            </div> */}

            <div className='flex gap-3 items-center '>
                <div className='relative grow'>
                    <SearchIcon className='absolute left-2 top-1/2 -translate-y-1/2 ' />
                    <input
                        type='text'
                        autoFocus
                        placeholder='Search components...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='!pl-7 w-full bg-framer-'
                    />
                </div>
                <Button
                    variant='normal'
                    onClick={() => {
                        if (selected.length === componentsData.length) {
                            setSelected([])
                        } else {
                            setSelected(componentsData.map((x) => x.id))
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.currentTarget.click()
                        }
                    }}
                    className='!w-auto bg-transparent !text-[12px] !px-2 min-w-[11ch]'
                >
                    {selected.length === componentsData.length
                        ? 'Deselect All'
                        : 'Select All'}
                </Button>
            </div>
            <div className='grid border border-[--framer-color-bg-tertiary] divide-y rounded-lg  overflow-y-auto max-h-[360px] grid-cols-1 grow w-full items-center justify-center'>
                {componentsData.map((component, i) => {
                    const isVisible = component.name
                        ?.toLowerCase()
                        .includes(search.toLowerCase())
                    return (
                        <Item
                            style={{ display: isVisible ? 'flex' : 'none' }}
                            onChange={(e) => {
                                const checked = e.target.checked
                                setSelected((prev) => {
                                    if (checked) {
                                        return [...prev, component.id]
                                    }
                                    return prev.filter(
                                        (id) => id !== component.id,
                                    )
                                })
                            }}
                            checked={selected.includes(component.id)}
                            key={component.id}
                            {...component}
                        />
                    )
                })}
            </div>
            <div className='flex gap-3 '>
                <Link to={withMode(Paths.settings)}>
                    <Button className='w-auto grow' type='submit'>
                        Settings
                    </Button>
                </Link>
                <Button
                    isLoading={isLoading}
                    className='w-auto grow'
                    variant='primary'
                    type='submit'
                >
                    Export <span className='font-mono'>{selected.length}</span>{' '}
                    Components
                </Button>
            </div>
        </Form>
    )
}

function SearchIcon({ className }: { className?: string }) {
    return (
        <svg
            width='14'
            height='14'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={className}
        >
            <path
                d='M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M14 14L11.1 11.1'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    )
}
function EyeIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={'size-3'}
        >
            <path
                d='M8 3.33333C4.66667 3.33333 1.82 5.55333 0.666667 8.66667C1.82 11.78 4.66667 14 8 14C11.3333 14 14.18 11.78 15.3333 8.66667C14.18 5.55333 11.3333 3.33333 8 3.33333Z'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M8 10.6667C9.10457 10.6667 10 9.77124 10 8.66667C10 7.5621 9.10457 6.66667 8 6.66667C6.89543 6.66667 6 7.5621 6 8.66667C6 9.77124 6.89543 10.6667 8 10.6667Z'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    )
}

function Item({ id, name, onChange, checked, style, node }) {
    const ref = useRef<any>(null)
    return (
        <div
            style={style}
            className='flex group items-center px-3 gap-3 py-3 border-[--framer-color-bg-tertiary] h-full cursor-pointer'
            key={id}
            onClick={(e) => {
                // Only handle click if not on the checkbox itself
                if (e.target !== ref.current) {
                    ref.current?.click()
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault()
                    ref.current?.click()
                }
            }}
        >
            <div className='flex items-center justify-center'>
                <input
                    name={id}
                    // defaultChecked={defaultIsChecked}
                    checked={checked}
                    ref={ref}
                    className='!size-[14px] focus:ring-2 ring-framer-tint'
                    type='checkbox'
                    onChange={onChange}
                />
            </div>
            <div className='flex-1'>
                <h3>{name}</h3>
            </div>
            <button
                type='button'
                tabIndex={-1}
                className='group-hover:opacity-100 opacity-0 flex h-auto w-auto items-center justify-center !m-0 !p-1 bg-transparent hover:bg-framer-tertiary rounded-md'
                onClick={(e) => {
                    e.stopPropagation()
                    framer.zoomIntoView(id, { maxZoom: 0.7 })
                }}
                title='Zoom to component'
            >
                <EyeIcon />
            </button>
            {/* <div
            className={classNames(
                'flex items-center justify-center',
                isDisabled && 'opacity-50',
            )}
        >
            <IconChevron />
        </div> */}
        </div>
    )
}

function IconChevron() {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='5' height='8'>
            <path
                d='M 1 1 L 4 4 L 1 7'
                fill='transparent'
                strokeWidth='1.5'
                stroke='currentColor'
                strokeLinecap='round'
            ></path>
        </svg>
    )
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
