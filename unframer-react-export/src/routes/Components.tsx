import { Button } from 'template-rewrite-framer/src/components/Button'

import {
    LoaderReturnType,
    Paths,
    getReactPluginData,
    pluginApiClient,
    withMode,
} from '@/lib/utils'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useActionData,
    useLoaderData,
    useNavigate,
    useNavigation,
    useRevalidator,
} from 'react-router'

import { notifyError } from '@/lib/errors'
import { framer } from 'framer-plugin'
import {} from 'react-router'
import { Form, Link } from 'react-router-dom'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import { useEffect, useRef, useState } from 'react'

async function loader({}: LoaderFunctionArgs) {
    const components = await framer.getNodesWithType('ComponentNode')
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
            .catch((x) => null),
    ])

    const { email, orgId } = org
    let componentsData = components.map((component) => {
        const { name, id, insertURL, componentIdentifier } = component

        return { name, id, insertURL, componentIdentifier, node: component }
    })
    const componentIds = reactExportProject?.components?.map((x) => x.id) || []
    return { componentIds, email, orgId, componentsData }
}

async function action({ request }: LoaderFunctionArgs) {
    const formData = await request.formData()

    const [publishInfo, components, pages, styles, projectInfo, locales] =
        await Promise.all([
            framer.getPublishInfo().catch((e) => null),
            framer.getNodesWithType('ComponentNode'),
            framer.getNodesWithType('WebPageNode'),
            framer.getColorStyles(),
            framer.getProjectInfo(),
            framer.unstable_getLocales?.()?.catch((err) => {
                console.error('Error getting locales', err)
                return []
            }),
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

    console.log('publishInfo', publishInfo)
    let websiteUrl =
        publishInfo?.staging?.currentPageUrl ||
        publishInfo?.staging?.url ||
        publishInfo?.production?.currentPageUrl ||
        publishInfo?.production?.url
    // console.log('styles', styles)
    const { error, data } =
        await pluginApiClient.api.plugins.reactExportPlugin.upsertProject.post({
            projectId: fullFramerProjectId,
            projectName,
            fullFramerProjectId,
            websiteUrl,
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
            components: filteredComponents.map((component) => {
                const { name, id, insertURL, componentIdentifier } = component
                return {
                    name: name ?? '',
                    id,
                    url: insertURL ?? '',
                    projectId: fullFramerProjectId!,
                    componentIdentifier,
                }
            }),
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
                    className='!w-auto bg-transparent !text-[12px] !px-2  '
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
function Item({ id, name, onChange, checked, style }) {
    const ref = useRef<any>()
    return (
        <div
            style={style}
            className='flex items-center px-3 gap-3 py-3 border-[--framer-color-bg-tertiary] h-full cursor-pointer'
            key={id}
            onClick={(e) => {
                // Only handle click if not on the checkbox itself
                if (e.target !== ref.current) {
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
                    className='!size-[14px]'
                    type='checkbox'
                    onChange={onChange}
                />
            </div>
            <div className=''>
                <h3>{name}</h3>
            </div>
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
