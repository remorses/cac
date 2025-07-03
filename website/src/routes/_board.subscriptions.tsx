import type { LoaderFunctionArgs } from 'react-router'

import { Link } from '@heroui/react'
import { prisma } from 'db'
import { data as json, useLoaderData } from 'react-router'
import Stripe from 'stripe'
import { env } from '../lib/env'
import { getSupabaseSession } from '../lib/supabase.server'

import {
    getSubscription,
    lemonSqueezySetup,
} from '@lemonsqueezy/lemonsqueezy.js'
import { isTruthy } from '../lib/utils'


export let loader = async ({ request }: LoaderFunctionArgs) => {
    lemonSqueezySetup({
        apiKey: env.LEMON_SQUEEZY_API_KEY,
        onError: (error) => console.error('Error!', error),
    })
    const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {})
    const { headers, user, redirectTo } = await getSupabaseSession({
        request,
    })
    if (redirectTo) {
        console.log('redirecting to login')
        return redirectTo
    }
    if (!user || !user.email) {
        throw new Error('user has no email or not found')
    }
    const [authUser, subs] = await Promise.all([
        prisma.users.findFirst({
            where: {
                id: user.id,
            },
        }),
        prisma.subscription.findMany({
            where: {
                orgId: user.id,
            },
        }),
    ])
    if (!authUser) {
        throw new Error('No operator found for user')
    }

    const subsWithManageUrl = await Promise.all(
        subs.map(async (sub) => {
            if (sub?.customerId) {
                const portalSession =
                    await stripe.billingPortal.sessions.create({
                        customer: sub.customerId,

                        return_url: new URL(
                            '/after-framer-payment',
                            env.PUBLIC_URL,
                        ).toString(),
                    })

                let manageUrl = portalSession.url
                return {
                    sub,
                    manageUrl,
                }
            }

            if (sub.provider === 'lemonsqueezy') {
                const s = await getSubscription(sub.subscriptionId, {
                    include: ['subscription-items', 'customer'],
                })

                const manageUrl =
                    s.data?.data?.attributes?.urls?.customer_portal
                if (!manageUrl) {
                    console.log(
                        `no manageUrl for lemon squeezy sub`,
                        s.data?.data?.attributes,
                    )
                    return
                }
                return { sub, manageUrl }
            }
            console.log(
                `could not get manage url for sub ${JSON.stringify(sub)}`,
            )
            // return { sub }
        }),
    )

    return json(
        {
            subs,
            subsWithManageUrl: subsWithManageUrl.filter(isTruthy),
            authUser,
        },
        { headers },
    )
}
export default function Page() {
    const { subsWithManageUrl } = useLoaderData<typeof loader>()

    return (
        <div className='w-full max-w-4xl mx-auto px-4 py-8'>
            <h1 className='text-3xl font-bold text-center mb-8 text-neutral-900 dark:text-white'>
                Your Subscriptions
            </h1>
            {subsWithManageUrl.length === 0 ? (
                <div className='w-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-12 text-center'>
                    <div className='text-neutral-500 dark:text-neutral-400 text-lg'>
                        No active subscriptions found.
                    </div>
                </div>
            ) : (
                <div className='w-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700'>
                    {subsWithManageUrl.map(({ sub, manageUrl }, index) => (
                        <div
                            key={`${sub.subscriptionId}-${sub.variantId}`}
                            className={`p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 ${
                                index !== subsWithManageUrl.length - 1
                                    ? 'border-b border-neutral-200 dark:border-neutral-700'
                                    : ''
                            }`}
                        >
                            <div className='flex-1 space-y-1'>
                                <div className='font-semibold text-lg text-neutral-900 dark:text-white'>
                                    Subscription for {sub.pluginName}{' '}
                                    {sub.variantName || ''}
                                </div>
                                <div className='flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400'>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            sub.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
                                        }`}
                                    >
                                        {sub.status}
                                    </span>
                                    <span className='capitalize'>
                                        {sub.provider}
                                    </span>
                                    {/* {sub.endsAt && (
                                        <span>
                                            Ends:{' '}
                                            {new Date(
                                                sub.endsAt,
                                            ).toLocaleDateString()}
                                        </span>
                                    )} */}
                                </div>
                            </div>
                            <Link
                                href={manageUrl}
                                target='_blank'
                                className='ml-4 inline-flex items-center bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200'
                            >
                                Manage Subscription
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
