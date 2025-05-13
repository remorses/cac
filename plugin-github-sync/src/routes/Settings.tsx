import { Button } from 'plugin-github-sync/src/components/Button'
import { reload } from 'plugin-github-sync/src/lib/utils'

import {
    LoaderReturnType,
    Paths,
    PluginDataKeys,
    getMarkdownPluginData,
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

import { useRefreshOnVisible } from 'plugin-github-sync/src/lib/hooks'
import { feedbackUrl, getBuyGithubPluginUrl } from 'website/src/lib/env'

async function loader({}: LoaderFunctionArgs) {
    const pluginData = await getMarkdownPluginData()
    const { projectId, projectName } = pluginData
    const [org, syncs, { subs, freeSyncs = 10, manageSubUrl }] =
        await Promise.all([
            pluginApiClient.api.plugins.currentOrg
                .post({})
                .then(({ data, error }) => {
                    if (error) {
                        throw error
                    }
                    return data
                }),
            pluginApiClient.api.plugins.markdownPlugin.syncsThisMonth
                .post({ projectId, projectName })
                .then(({ data, error }) => {
                    if (error) {
                        throw error
                    }
                    return data
                }),
            pluginApiClient.api.plugins.markdownPlugin.subscriptions
                .get({ query: { projectId } })
                .then(({ data, error }) => {
                    if (error) {
                        throw error
                    }
                    return data
                }),
        ])
    const { email, orgId } = org
    const sub = subs.find((x) => x)
    return {
        ...pluginData,
        manageSubUrl,
        freeSyncs,
        sub,
        syncs,
        email,
        orgId,
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
    const {
        email,
        owner,
        sub,
        repo,
        basePath,
        syncs,
        orgId,
        projectId,
        manageSubUrl,
        freeSyncs,
    } = useLoaderData() as LoaderReturnType<typeof loader>
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
                            const collection =
                                await framer.getManagedCollection()
                            await collection.setPluginData(
                                PluginDataKeys.sessionKey,
                                null,
                            )
                            const allKeys = await collection.getPluginDataKeys()
                            for (let key of allKeys) {
                                await collection.setPluginData(key, null)
                            }
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
            <div className='flex items-center'>
                <div>Repository</div>
                <div className='grow'></div>
                <a
                    href={`https://github.com/${owner}/${repo}`}
                    className='font-semibold text-right text-blue-400 underline inline'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {`${owner}/${repo}`}
                </a>
            </div>
            <hr className='' />
            <div className='flex items-center'>
                <div className=''>Base Path: </div>
                <div className='grow'></div>
                <code className='font-semibold inline'>{basePath || '/'}</code>
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
                <a target='_blank' href={feedbackUrl('Github Sync')}>
                    <Button className='w-auto'>Share Feedback</Button>
                </a>
            </div>
            <hr className='' />

            {!sub && (
                <>
                    <div className='flex items-center'>
                        <div>
                            Get unlimited GitHub syncs.
                            <br />
                            {sub ? (
                                'Unlimited syncs available'
                            ) : (
                                <>
                                    Free syncs remaining:{' '}
                                    {freeSyncs - (syncs || 0)} / {freeSyncs}
                                </>
                            )}
                        </div>
                        <div className='grow'></div>
                        <a
                            href={getBuyGithubPluginUrl({
                                orgId,
                                projectId,
                                email,
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
            {/* <hr className='' /> */}
            {!sub && (
                <>
                    <div className='flex flex-col gap-2'>
                        <div className='grow'></div>

                        <ProgressBar
                            progress={(syncs || 0) / freeSyncs}
                            className='w-full'
                        />
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
    // progress= 0.5
    return (
        <div
            // style={{ backgroundColor }}
            className={classNames(
                'relative rounded-md overflow-hidden w-full bg-gray-700 flex h-[8px]',
                className,
            )}
        >
            <div
                // layout
                // transition={{ duration: 0.4 }}
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
