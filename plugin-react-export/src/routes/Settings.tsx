import { Button } from 'plugin-migrate/src/components/Button'
import { reload } from 'plugin-migrate/src/lib/utils'

import {
    LoaderReturnType,
    Paths,
    PluginDataKeys,
    getReactPluginData,
    pluginApiClient,
} from '@/lib/utils'
import { useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useActionData,
    useLoaderData,
    useNavigate,
} from 'react-router'

import classNames from 'classnames'
import { framer } from 'framer-plugin'
import { useRefreshOnVisible } from 'plugin-migrate/src/lib/hooks'
import { feedbackUrl, getBuyReactExportPluginUrl } from 'website/src/lib/env'

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
                .get({ query: { projectId } })
                .then(({ data, error }) => {
                    if (error) {
                        throw error
                    }
                    return data
                }),
        ])
    const { email, orgId } = org
    return {
        projectId,
        email,
        orgId,
        manageSubUrl,
        freeComponents,
        sub: activeSub,
    }
}

export function Settings(): RouteObject {
    return {
        handle: 'Plugin settings',
        path: Paths.settings,
        loader,
        Component,
    }
}

function Component() {
    const [isLoading, setIsLoading] = useState(false)
    useRefreshOnVisible({ enabled: !isLoading })
    const { email, sub, orgId, projectId, manageSubUrl, freeComponents } =
        useLoaderData() as LoaderReturnType<typeof loader>
    const actionData = useActionData() as any

    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-4'>
            <div className='flex items-center'>
                <div className=''>
                    Currently logged in as{' '}
                    <span className='font-semibold inline'>{email}</span>
                </div>

                <div className='grow'></div>
                <Button
                    onClick={async () => {
                        setIsLoading(true)
                        try {
                            // Check permission before setting plugin data
                            if (!framer.isAllowedTo('setPluginData')) {
                                throw new Error('Permission denied: cannot set plugin data')
                            }
                            await framer.setPluginData(
                                PluginDataKeys.sessionKey,
                                null,
                            )
                            reload()
                        } finally {
                            // setIsLoading(false)
                        }
                    }}
                    className='w-auto'
                    isLoading={isLoading}
                >
                    Sign Out
                </Button>
            </div>
            <hr className='' />

            {manageSubUrl && (
                <>
                    <div className='flex items-center'>
                        <div>Subscription active</div>
                        <div className='grow'></div>
                        <a
                            href={manageSubUrl}
                            target='_blank'
                            style={{ textDecoration: 'none', color: 'inherit' }}
                            rel='noopener noreferrer'
                        >
                            <Button className='font-semibold'>
                                Manage Subscription
                            </Button>
                        </a>
                    </div>
                    <hr className='' />
                </>
            )}

            <div className='flex gap-2 items-center'>
                <div className=''>Questions or requests?</div>
                <div className='grow'></div>
                <a target='_blank' href={feedbackUrl({ pluginName: 'React Export', email })}>
                    <Button className='w-auto'>Share Feedback</Button>
                </a>
            </div>
            <hr className='' />

            {!sub && (
                <>
                    <div className='flex items-center'>
                        <div>
                            Get unlimited component exports.
                            <br />
                            {sub ? (
                                'Unlimited exports available'
                            ) : (
                                <>Limit now is {freeComponents} components</>
                            )}
                        </div>
                        <div className='grow'></div>
                        <a
                            href={getBuyReactExportPluginUrl({
                                orgId,
                                email,
                                projectId,
                            })}
                            target='_blank'
                            style={{ textDecoration: 'none', color: 'inherit' }}
                            rel='noopener noreferrer'
                        >
                            <Button className='font-semibold'>
                                Buy Plugin Subscription
                            </Button>
                        </a>
                    </div>
                    <hr className='' />
                </>
            )}

            <Button
                onClick={() => {
                    navigate(-1)
                }}
                className=''
            >
                Go Back
            </Button>
        </div>
    )
}

function ProgressBar({ progress, className = '' }) {
    const backgroundColor = (() => {
        if (progress > 0.9) {
            return 'bg-red-400'
        }
        if (progress > 0.6) {
            return 'bg-yellow-400'
        }

        return 'bg-green-500'
    })()
    if (progress < 0.03) {
        progress = 0.03
    }
    return (
        <div
            className={classNames(
                'relative rounded-md overflow-hidden w-full bg-gray-700 flex h-[8px]',
                className,
            )}
        >
            <div
                style={{
                    width: Number(Math.min(progress, 1) * 100).toFixed(1) + '%',
                }}
                className={classNames(
                    'h-full bg-gray-200 rounded overflow-hidden',
                    backgroundColor,
                )}
            ></div>
        </div>
    )
}
