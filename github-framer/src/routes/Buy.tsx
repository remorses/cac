import {
    LoaderReturnType,
    Paths,
    getMarkdownPluginData,
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
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'

import { getBuyGithubPluginUrl } from 'website/src/lib/env'

async function loader({}: LoaderFunctionArgs) {
    const [pluginData, org] = await Promise.all([
        getMarkdownPluginData(),
        pluginApiClient.api.plugins.currentOrg
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
    ])
    const { activeSub, freeSyncs } =
        await pluginApiClient.api.plugins.markdownPlugin.subscriptions
            .get({ query: { projectId: pluginData.projectId } })
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            })
    if (activeSub) {
        throw redirect(withMode(Paths.settings))
    }
    const { email, orgId } = org
    return { ...pluginData, email, freeSyncs, orgId }
}

export function BuyMoreSyncs(): RouteObject {
    return {
        handle: 'Buy More Syncs',
        path: Paths.buy,
        loader,
        Component,
    }
}

function Component() {
    const { orgId, projectId, freeSyncs, email } =
        useLoaderData() as LoaderReturnType<typeof loader>
    useRefreshOnVisible({ enabled: true })
    const revalidator = useRevalidator()
    useEffect(() => {
        const interval = setInterval(() => {
            revalidator.revalidate()
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='flex flex-col justify-start gap-4 text-center'>
            <div className='flex items-center'>
                <div className='font-bold text-balance'>
                    You have synced from GitHub more than the free limit of{' '}
                    {freeSyncs} times this month.
                </div>
            </div>
            <div className='flex items-center'>
                <div className='opacity-60 text-balance'>
                    Please buy the plugin subscription to continue using the
                    plugin.
                </div>
            </div>
            <hr className='' />

            <div className='flex flex-col items-center'>
                <button
                    onClick={() =>
                        window.open(
                            getBuyGithubPluginUrl({
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
                </button>
            </div>
        </div>
    )
}
