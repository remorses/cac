import {
    getLLMPluginData,
    LoaderReturnType,
    Paths,
    pluginApiClient,
    withMode,
} from '@/lib/utils'
import { useEffect } from 'react'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useLoaderData,
    useRevalidator,
} from 'react-router'
import { Button } from 'template-rewrite-framer/src/components/Button'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'

import { getBuyLLMPluginUrl } from 'website/src/lib/env'

async function loader({}: LoaderFunctionArgs) {
    const [pluginData, org] = await Promise.all([
        getLLMPluginData(),
        pluginApiClient.api.plugins.currentOrg
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
    ])
    const { activeSub } = await pluginApiClient.api.plugins.llm.subscriptions
        .get({ query: { projectId: pluginData.projectId } })
        .then(({ data, error }) => {
            if (error) {
                throw error
            }
            return data
        })
    if (activeSub) {
        throw redirect(withMode(Paths.prompt))
    }
    const { email, orgId } = org
    return { ...pluginData, email, orgId }
}

export function BuyMoreSyncs(): RouteObject {
    return {
        handle: 'Buy More',
        path: Paths.buy,
        loader,
        Component,
    }
}

function Component() {
    const { orgId, projectId, email } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    useRefreshOnVisible({ enabled: true })
    const revalidator = useRevalidator()
    useEffect(() => {
        const interval = setInterval(() => {
            revalidator.revalidate()
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='flex flex-col justify-start gap-4 text-center'>
            <div className='flex items-center'>
                <div className='font-semibold text-balance'>
                    Please buy the plugin subscription to continue using AI
                    Rewrite
                </div>
            </div>

            <hr className='' />

            <div className='flex flex-col items-center'>
                <Button
                    variant='primary'
                    onClick={() =>
                        window.open(
                            getBuyLLMPluginUrl({
                                orgId,
                                projectId,
                                email,
                            }),
                            '_blank',
                            'noopener,noreferrer',
                        )
                    }
                    className='font-semibold '
                >
                    Buy Plugin Subscription
                </Button>
            </div>
        </div>
    )
}
