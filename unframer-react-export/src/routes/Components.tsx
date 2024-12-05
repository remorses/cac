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
} from 'react-router'

import { notifyError } from '@/lib/errors'
import { framer } from 'framer-plugin'
import {} from 'react-router'
import { Form } from 'react-router-dom'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import { useRef } from 'react'

async function loader({}: LoaderFunctionArgs) {
    const components = await framer.getNodesWithType('ComponentNode')

    const [org, credits] = await Promise.all([
        pluginApiClient.api.plugins.currentOrg
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
        null,
    ])
    const { email, orgId } = org
    let componentsData = components.map((component) => {
        const { name, id, insertURL, componentIdentifier } = component
        return { name, id, insertURL, componentIdentifier, node: component }
    })
    return { credits, email, orgId, componentsData }
}

async function action({ request }: LoaderFunctionArgs) {
    const formData = await request.formData()

    const [components, styles, sessionKey, projectInfo] = await Promise.all([
        framer.getNodesWithType('ComponentNode'),
        framer.getColorStyles(),
        getReactPluginData(),
        framer.getProjectInfo(),
    ])

    // throw redirect(withMode(Paths.readme))
    const { id: projectId, name: projectName } = projectInfo
    if (!projectId) {
        throw new Error('No project id found')
    }
    const selectedComponentIds = new Set(formData.keys())
    console.log('selectedComponentIds', [...selectedComponentIds])
    const filteredComponents = components.filter(
        (component) =>
            component.id &&
            component.insertURL &&
            selectedComponentIds.has(component.id),
    )

    const { error, data } =
        await pluginApiClient.api.plugins.reactExportPlugin.upsertProject.post({
            projectId,
            projectName,
            colorStyles: styles.map((x) => {
                const { dark, light, name, id } = x
                return {
                    name,
                    id,
                    projectId: projectId!,
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
                    projectId: projectId!,
                    componentIdentifier,
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
    const { componentsData } = useLoaderData() as LoaderReturnType<
        typeof loader
    >

    const { credits } = useLoaderData() as LoaderReturnType<typeof loader>
    // const isDocumentVisible = useIsDocumentVisibile()

    const navigate = useNavigate()
    return (
        <Form method='POST' className='flex-1 flex flex-col gap-4'>
            <div className=' flex flex-col px-4 items-center justify-center'>
                <h1 className='text-balance text-center text-md '>
                    Choose among the {componentsData.length} components which
                    one you want to export
                </h1>
            </div>
            <div className='grid border border-[--framer-color-bg-tertiary] divide-y rounded-lg  overflow-y-auto max-h-[300px] grid-cols-1 grow w-full items-center justify-center'>
                {componentsData.map((component) => {
                    return <Item key={component.id} {...component} />
                })}
            </div>
            <Button type='submit'>Use Selected Components</Button>
        </Form>
    )
}

function Item({ id, name }) {
    const ref = useRef<any>()
    return (
        <div
            className='flex items-center px-3 gap-3 py-3 border-[--framer-color-bg-tertiary] h-full'
            key={id}
        >
            <div className='flex items-center justify-center'>
                <input
                    name={id}
                    defaultChecked
                    ref={ref}
                    className='!size-[14px]'
                    type='checkbox'
                />
            </div>
            <div
                onClick={() => {
                    ref.current?.click()
                }}
                className=''
            >
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
