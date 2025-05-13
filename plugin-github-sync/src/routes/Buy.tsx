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
import { Button } from 'plugin-github-sync/src/components/Button'
import { useRefreshOnVisible } from 'plugin-github-sync/src/lib/hooks'

import { discountCodeUrl, getBuyGithubPluginUrl } from 'website/src/lib/env'

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
        throw redirect(withMode(Paths.mapFields))
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
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='flex flex-col justify-start gap-4 text-center'>
            <div className='flex items-center'>
                <div className='font-semibold text-balance'>
                    Please buy the plugin subscription to continue using GitHub
                    Sync. There is a 7 days free trial.
                </div>
            </div>
            <div className='flex items-center'>
                <div className='text-framer-secondary text-balance'>
                    <a
                        href={discountCodeUrl('GitHub Sync')}
                        className='font-semibold text-black dark:text-white'
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        Contact us
                    </a>{' '}
                    for non commercial or open source discount.
                </div>
            </div>
            <hr className='' />

            <div className='flex flex-col items-center'>
                <Button
                    variant='primary'
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
                </Button>
            </div>
        </div>
    )
}
