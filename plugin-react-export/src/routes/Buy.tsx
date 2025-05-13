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
import { Button } from 'plugin-migrate/src/components/Button'
import { useRefreshOnVisible } from 'plugin-migrate/src/lib/hooks'

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
        throw redirect(withMode(Paths.components))
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
        }, 3000)
        return () => clearInterval(interval)
    }, [])
    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-3 text-center'>
            <div className='flex flex-col gap-3 my-4'>
                <div className='flex items-center'>
                    <div className=' text-sm text-balance'>
                        React Export requires a $250 monthly subscription.
                    </div>
                </div>

                <div className='flex items-center'>
                    <div className='text-framer-secondary text-balance'>
                        If you are a solo developer, non-profit or open source
                        project you can get a discount{' '}
                        <a
                            href={discountCodeUrl('React Export')}
                            className='font-semibold text-black dark:text-white'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            here
                        </a>
                        .
                    </div>
                </div>
            </div>
            <hr className='' />

            <div className='flex gap-3 items-center'>
                {/* <Button
                    variant='normal'
                    onClick={() => navigate(-1)}
                    className='grow w-auto'
                >
                    Go Back
                </Button> */}

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
