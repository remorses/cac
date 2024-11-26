import {
    LoaderReturnType,
    Paths,
    getMarkdownPluginData,
    pluginApiClient,
} from '@/lib/utils'
import { LoaderFunctionArgs, RouteObject, useLoaderData } from 'react-router'

import {
    FREE_GITHUB_SYNCS_PER_MONTH,
    getBuyGithubPluginUrl,
} from 'website/src/lib/env'

async function loader({}: LoaderFunctionArgs) {
    const [pluginData, org, credits] = await Promise.all([
        getMarkdownPluginData(),
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
    return { ...pluginData, credits, email, orgId }
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
    const { orgId, projectId, email } = useLoaderData() as LoaderReturnType<
        typeof loader
    >

    return (
        <div className='flex flex-col justify-start gap-4 text-center'>
            <div className='flex items-center'>
                <div className='font-bold text-balance'>
                    You have synced from GitHub more than the free limit of {FREE_GITHUB_SYNCS_PER_MONTH} times this month.
                </div>
            </div>
            <div className='flex items-center'>
                <div className='opacity-60 text-balance'>
                    The sync count resets on the 1st of the month.
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
