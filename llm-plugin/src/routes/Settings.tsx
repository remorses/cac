import { Button } from 'template-rewrite-framer/src/components/Button'

import {
    LoaderReturnType,
    Paths,
    PluginDataKeys,
    basePath,
    createBuyLink,
    formatLargeNumber,
    pluginApiClient,
    reload,
    withMode,
} from 'template-rewrite-framer/src/lib/utils'
import { useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useActionData,
    useLoaderData,
    useNavigate,
} from 'react-router'
import { Link } from 'react-router-dom'

import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import {} from 'react-router'
import { framer } from 'framer-plugin'
import { feedbackUrl, getBuyLLMPluginUrl } from 'website/src/lib/env'

async function loader({}: LoaderFunctionArgs) {
    const [{ email, orgId }, credits, info] = await Promise.all([
        pluginApiClient.api.plugins.currentOrg
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
        pluginApiClient.api.plugins.llm.getCredits
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
        framer.getProjectInfo(),
    ])
    const { id: projectId } = info
    let buyMoreCreditsUrl = getBuyLLMPluginUrl({
        email,
        projectId,
        orgId,
    })
    return { credits, email, buyMoreCreditsUrl }
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
    const { buyMoreCreditsUrl } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    const actionData = useActionData() as any

    const { credits, email } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    // const isDocumentVisible = useIsDocumentVisibile()

    const navigate = useNavigate()
    return (
        <div className='flex flex-col grow justify-between pt-1 gap-4'>
            <div className='flex gap-1 items-center '>
                <div className='truncate'>
                    Currently logged in as{' '}
                    <span className='font-semibold truncate max-w-full block'>
                        {email}
                    </span>
                </div>
                <div className='grow'></div>
                <Button
                    onClick={async () => {
                        // if (isLoading) {
                        //     return
                        // }
                        setIsLoading(true)
                        try {
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
            <div className='flex gap-2 items-center'>
                <div className=''>
                    <span className='font-semibold inline'>
                        {credits.remaining}
                        {credits.free ? ' free' : ''}
                    </span>{' '}
                    credits available
                </div>
                <div className='grow'></div>
                <a target='_blank' href={buyMoreCreditsUrl}>
                    <Button className='w-auto'>Buy More Credits</Button>
                </a>
            </div>
            <hr className='' />
            {/* <div className='flex gap-2 items-center'>
                <div className=''>Redeem third party credits</div>
                <div className='grow'></div>
                <Link to={withMode(Paths.licenseKey)}>
                    <Button className='w-auto'>Redeem License</Button>
                </Link>
            </div>
            <hr className='' /> */}
            <div className='flex gap-2 items-center'>
                <div className=''>Questions or requests?</div>
                <div className='grow'></div>
                <a target='_blank' href={feedbackUrl('Migrate')}>
                    <Button className='w-auto'>Share Feedback</Button>
                </a>
            </div>
            <hr className='' />
            <div className='flex group self-stretch gap-4 flex-row-reverse items-center'>
                <ProgressBar
                    className='grow'
                    progress={credits.used / credits.total || 0}
                />
                <div className='whitespace-pre'>
                    {credits.used} / {formatLargeNumber(credits.total)}
                </div>
            </div>
            {/* <div className='grow'></div> */}
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
