import {
    LoaderReturnType,
    Paths,
    getReactPluginData,
    pluginApiClient,
    withMode,
} from '@/lib/utils'
import { useEffect } from 'react'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useLoaderData,
    useNavigate,
    useRevalidator,
} from 'react-router'
import { Button } from 'template-rewrite-framer/src/components/Button'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'

import {
    discountCodeUrl,
    getBuyReactExportPluginUrl,
} from 'website/src/lib/env'

async function loader({}: LoaderFunctionArgs) {
    const [pluginData, org] = await Promise.all([
        getReactPluginData(),
        pluginApiClient.api.plugins.currentOrg
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
    ])
    const { activeSub, freeComponents } =
        await pluginApiClient.api.plugins.reactExportPlugin.subscriptions
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
    return { ...pluginData, freeComponents, email, orgId }
}

export function BuyMore(): RouteObject {
    return {
        path: Paths.buy,
        loader,
        Component,
    }
}

function Component() {
    const { orgId, projectId, freeComponents, email } =
        useLoaderData() as LoaderReturnType<typeof loader>
    useRefreshOnVisible({ enabled: true })
    const revalidator = useRevalidator()
    useEffect(() => {
        const interval = setInterval(() => {
            revalidator.revalidate()
        }, 5000)
        return () => clearInterval(interval)
    }, [])
    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-4 text-center'>
            <div className='flex items-center'>
                <div className=' text-sm text-balance'>
                    Buy the plugin subscription to export more than{' '}
                    {freeComponents} components.
                </div>
            </div>

            <div className='flex items-center'>
                <div className='text-framer-secondary text-sm text-balance'>
                    <a
                        href={discountCodeUrl('React Export')}
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

            <div className='flex gap-3 items-center'>
                <Button
                    variant='normal'
                    onClick={() => navigate(-1)}
                    className='grow w-auto'
                >
                    Go Back
                </Button>

                <Button
                    variant='primary'
                    onClick={() =>
                        window.open(
                            getBuyReactExportPluginUrl({
                                orgId,
                                projectId,
                                email,
                            }),
                            '_blank',
                            'noopener,noreferrer',
                        )
                    }
                    className='font-semibold grow w-auto '
                >
                    Buy Plugin Subscription
                </Button>
            </div>
        </div>
    )
}
