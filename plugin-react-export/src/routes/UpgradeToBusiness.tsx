import { getReactPluginData, Paths, pluginApiClient } from '@/lib/utils'
import { Button } from 'plugin-migrate/src/components/Button'
import {
    Form,
    LoaderFunctionArgs,
    RouteObject,
    useLoaderData,
    useSearchParams,
} from 'react-router'
import { feedbackUrl } from 'website/src/lib/env'

async function loader({}: LoaderFunctionArgs) {
    const { projectId } = await getReactPluginData()
    const [org, { activeSub, freeComponents, manageSubUrl }] =
        await Promise.all([
            pluginApiClient.api.plugins.currentOrg
                .post({})
                .then(({ data, error }) => {
                    if (error) {
                        throw error
                    }
                    return data
                }),
            pluginApiClient.api.plugins.reactExportPlugin.subscriptions
                .get({ query: { projectId, forSubscriptionUpgrade: true } })
                .then(({ data, error }) => {
                    if (error) {
                        throw error
                    }
                    return data
                }),
        ])
    const { email, orgId } = org
    return {
        email,
        orgId,
        manageSubUrl,
        freeComponents,
        sub: activeSub,
    }
}

export function UpgradeToBusiness(): RouteObject {
    return {
        path: Paths.upgradeToBusiness,
        loader,
        Component,
    }
}

const errorIcon = (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='text-red-500'
    >
        <circle cx='12' cy='12' r='10' />
        <line x1='12' y1='8' x2='12' y2='12' />
        <line x1='12' y1='16' x2='12.01' y2='16' />
    </svg>
)

function Component() {
    const [searchParams] = useSearchParams()
    const { email, orgId, manageSubUrl, freeComponents } =
        useLoaderData<typeof loader>()
    return (
        <Form
            method='POST'
            className='flex flex-col justify-start  text-center items-center'
        >
            <div className='flex flex-col max-w-[280px] gap-3 items-center my-4'>
                <div className='flex grow w-full flex-col gap-3 items-center'>
                    {errorIcon}
                    <div className=' text-sm text-balance'>
                        This project is on the personal plan
                    </div>
                    <div className=' opacity-70 text-balance'>
                        The owner of the project is different than the current
                        user, personal plan is limited to 1 Framer user.
                    </div>
                    <a
                        href={feedbackUrl({
                            email,
                            pluginName: 'React Export',
                        })}
                        target='_blank'
                    >
                        Contact Support
                    </a>
                </div>
            </div>

            <div className='flex gap-3 items-center'>
                <a href={manageSubUrl} target='_blank'>
                    <Button
                        variant='primary'
                        className='font-semibold grow w-auto '
                    >
                        Upgrade to Business Subscription
                    </Button>
                </a>
            </div>
        </Form>
    )
}
