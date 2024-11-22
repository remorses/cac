import { Button } from 'template-rewrite-framer/src/components/Button'
import { reload } from 'template-rewrite-framer/src/lib/utils'

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
import { motion } from 'framer-motion'
import { framer } from 'framer-plugin'
import {} from 'react-router'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'

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
    const { email, owner, repo, basePath } =
        useLoaderData() as LoaderReturnType<typeof loader>
    const actionData = useActionData() as any

    const { credits } = useLoaderData() as LoaderReturnType<typeof loader>
    // const isDocumentVisible = useIsDocumentVisibile()

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
                        // if (isLoading) {
                        //     return
                        // }
                        setIsLoading(true)
                        try {
                            const collection =
                                await framer.getManagedCollection()
                            await collection.setPluginData(
                                PluginDataKeys.sessionKey,
                                null,
                            )
                            // await framer.closePlugin()
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
            <div className='flex items-center'>
                <div>Repository</div>
                <div className='grow'></div>
                <a
                    href={`https://github.com/${owner}/${repo}`}
                    className='font-semibold text-blue-500 underline inline'
                    target='_blank'
                    rel='noopener noreferrer'
                >
                    {`${owner}/${repo}`}
                </a>
            </div>
            <div className='flex items-center'>
                <div className=''>Base Path: </div>
                <div className='grow'></div>
                <code className='font-semibold inline'>{basePath || '/'}</code>
            </div>
            <hr className='' />

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
            <motion.div
                // layout
                transition={{ duration: 0.4 }}
                animate={{
                    width: Number(Math.min(progress, 1) * 100).toFixed(1) + '%',
                }}
                className={classNames(
                    'h-full bg-gray-200 rounded overflow-hidden',
                    backgroundColor,
                )}
            ></motion.div>
        </div>
    )
}
