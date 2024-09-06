import { Button } from 'template-rewrite-framer/src/components/Button'
import { reload } from 'template-rewrite-framer/src/lib/utils'

import {
    LoaderReturnType,
    Paths,
    PluginDataKeys,
    basePath,
    getReactPluginData,
    pluginApiClient,
} from '@/lib/utils'
import { Fragment, useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useActionData,
    useLoaderData,
    useNavigate,
    useNavigation,
} from 'react-router'

import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { framer } from 'framer-plugin'
import {} from 'react-router'
import { Form } from 'react-router-dom'
import { notifyError } from '@/lib/errors'

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
    const components = await framer.getNodesWithType('ComponentNode')
    const { githubAccountLogin } = await getReactPluginData()
    console.log(`pushing to github ${githubAccountLogin}`)
    const { error, data } =
        await pluginApiClient.api.plugins.reactExportPlugin.pushGithub.post({
            basePath: '/',
            components: components.map((component) => {
                const { name, id, insertURL, componentIdentifier } = component
                return {
                    name: name || '',
                    id,
                    url: insertURL || '',
                    componentIdentifier,
                }
            }),
            githubAccountLogin,
            owner: githubAccountLogin,
            repo: 'unframer-react-components-KZr',
        })
    if (error) {
        await notifyError(error, 'Error pushing to github')
    }
    console.log(data)
    return { success: true }
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
    const actionData = useActionData() as any
    const { componentsData } = useLoaderData() as LoaderReturnType<
        typeof loader
    >

    const { credits } = useLoaderData() as LoaderReturnType<typeof loader>
    // const isDocumentVisible = useIsDocumentVisibile()

    const navigate = useNavigate()
    return (
        <Form method='POST' className='flex-1 flex flex-col gap-4'>
            <div className='grid grid-cols-3 gap-3 grow w-full items-center justify-center'>
                {componentsData.map((component) => {
                    let isDisabled = false
                    return (
                        <div
                            className='flex items-center gap-2 p-3 border rounded-lg h-full'
                            key={component.id}
                        >
                            <div className='flex items-center justify-center'>
                                <input type='checkbox' />
                            </div>
                            <div className=''>
                                <h3>{component.name}</h3>
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
                })}
            </div>
            <Button type='submit'>Create Repo</Button>
        </Form>
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
