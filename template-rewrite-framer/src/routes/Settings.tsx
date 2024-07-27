import { Button } from '@/components/Button'
import { supabase } from '@/lib/supabase-framer'
import {
    LoaderReturnType,
    Paths,
    PluginLoaderData,
    RouteIds,
    basePath,
    createBuyLink,
    formatLargeNumber,
    pluginApiClient,
    withMode,
} from '@/lib/utils'
import { framer } from 'framer-plugin'
import { useEffect, useState } from 'react'
import {
    LoaderFunctionArgs,
    Route,
    RouteObject,
    useActionData,
    useLoaderData,
    useNavigate,
    useRouteLoaderData,
} from 'react-router'
import { Form, Link, useFetcher } from 'react-router-dom'
import {
    framerLoginUrl,
    generateSecurePassword,
    sleep,
} from 'website/src/lib/utils'

import {} from 'react-router'
import { useRefreshOnVisible } from '@/lib/hooks'
import classNames from 'classnames'
import { motion } from 'framer-motion'

async function loader({}: LoaderFunctionArgs) {
    const [session, credits] = await Promise.all([
        supabase.auth.getSession().then(({ data }) => data.session),
        pluginApiClient.api.v1.getCredits.post({}).then(({ data, error }) => {
            if (error) {
                throw error
            }
            return data
        }),
    ])
    let buyMoreCreditsUrl = createBuyLink({
        email: session?.user?.email,
        orgId: session?.user?.id,
    })
    return { credits, session, buyMoreCreditsUrl }
}

export function Settings(): RouteObject {
    return {
        handle: 'Plugin settings',
        path: Paths.settings,
        loader,
        Component,
        async action({ request }) {
            const formData = await request.formData()
            const licenseKey = formData.get('licenseKey')?.toString()
            console.log(`validating license key ${licenseKey}`)
            if (!licenseKey) {
                return {
                    error: 'No license key provided',
                }
            }
            const { data, error } =
                await pluginApiClient.api.v1.activateLicense.post({
                    licenseKey,
                })
            if (error) {
                return {
                    error: error.value,
                }
            }
            const { credits, valid } = data
            return {
                credits,
                valid,
                message: `License key activated, ${credits} credits added`,
            }
        },
    }
}

function Component() {
    const [isLoading, setIsLoading] = useState(false)
    useRefreshOnVisible({ enabled: !isLoading })
    const { session, buyMoreCreditsUrl } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    const actionData = useActionData() as any

    const { credits } = useLoaderData() as LoaderReturnType<typeof loader>
    // const isDocumentVisible = useIsDocumentVisibile()

    const licenseKeyFetcher = useFetcher({})
    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-4'>
            <div className='flex items-center'>
                <div className=''>
                    Currently logged in as{' '}
                    <span className='font-semibold inline'>
                        {session?.user?.email}
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
                            const { error } = await supabase.auth.signOut()
                            if (error) {
                                throw error
                            }
                            window.location.pathname = basePath
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
            <Form
                method='POST'
                className='flex items-start flex-col justify-between gap-2'
            >
                <div className=''>Redeem credits</div>
                <div className='opacity-60'>
                    Some Framer templates comes with a plugin license key, you can
                    redeem them here
                </div>
                
                <input
                    name='formKey'
                    value={'licenseKey'}
                    type='hidden'
                    hidden
                />

                <div className='flex grow items-stretch w-full flex-col gap-2'>
                    <input
                        required
                        placeholder='38b1460a-5104-4067-a91d-77b872934d51'
                        type='text'
                        name='licenseKey'
                        className='rounded-md p-2 w-full bg-framer-tertiary'
                    />
                    <Button type='submit' className='w-auto'>
                        Activate License Key
                    </Button>
                    {actionData?.error && (
                        <div className='text-red-400'>{actionData.error}</div>
                    )}
                    {actionData?.message && (
                        <div className=''>{actionData.message}</div>
                    )}
                </div>
            </Form>
            <div className='flex group self-stretch gap-4 flex-row-reverse py-2 items-center'>
                <ProgressBar
                    className='grow'
                    progress={credits.used / credits.total || 0}
                />
                <div className='whitespace-pre'>
                    {credits.used} / {formatLargeNumber(credits.total)}
                </div>
            </div>

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
