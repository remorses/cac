// https://localhost:8040/api/react-export-plugin/buy?email=tommy@example.com&orgId=12345678&priceId=price_1RREb6Lpvqzrp4t94ypySNug
// free with 2J5ZQHW3

import { PluginName, prisma } from 'db'
import { href, LoaderFunctionArgs, redirect } from 'react-router'
import Stripe from 'stripe'
import {
    env,
    isReactExportFreePlanEnabled,
    reactExportVariants,
} from 'website/src/lib/env'
import { getReactSub } from 'website/src/lib/spiceflow-react-export-plugin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {})

export async function loader({ request }: LoaderFunctionArgs) {
    const u = new URL(request.url)

    const baseUrl = `${u.protocol}//${u.host}`
    const orgId = u.searchParams.get('orgId') || ''
    const projectId = u.searchParams.get('projectId') || ''
    const params = Object.fromEntries(u.searchParams.entries())

    if (!orgId) {
        throw new Error('orgId not found')
    }
    let pluginName: PluginName = 'reactExport'

    // Check if user already has an active subscription
    const activeSub = await getReactSub({ orgId })

    // If user already has active subscription, redirect to manage it
    if (activeSub) {
        // If no active subscription, try to find any subscription (including inactive ones)
        const anySubscription = await prisma.subscription.findFirst({
            where: {
                orgId: orgId,
                pluginName: 'reactExport',
            },
            orderBy: {
                createdAt: 'desc', // Get the most recent subscription
            },
        })

        if (anySubscription?.customerId) {
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: anySubscription.customerId,
                return_url: new URL(
                    '/after-framer-payment',
                    env.PUBLIC_URL,
                ).toString(),
            })
            return redirect(portalSession.url)
        }
    }

    const price = u.searchParams.get('priceId')
    if (!price) {
        console.log(`no priceId param in buy url, redirecting to pricing page`)
        const redirectUrl = new URL(
            href('/react-export-pricing'),
            env.PUBLIC_URL,
        )
        redirectUrl.search = u.search
        throw redirect(redirectUrl.toString())
    }

    const ONE_TIME_DOLLAR_PRICE_ID = 'price_1RlotoLpvqzrp4t9SDXijkte'
    const session = await stripe.checkout.sessions.create({
        line_items: [
            // order of items is important
            { quantity: 1, price },
            // this line item should NEVER be first
            ...(isReactExportFreePlanEnabled
                ? [{ quantity: 1, price: ONE_TIME_DOLLAR_PRICE_ID }]
                : []),
        ],
        mode: 'subscription',
        customer_email: params.email || undefined,
        client_reference_id: orgId,
        success_url: new URL('/after-framer-payment', baseUrl).toString(),
        cancel_url: new URL('/after-framer-payment', baseUrl).toString(),
        metadata: {
            ...params,
            orgId: orgId,
        },
        subscription_data: {
            metadata: {
                ...params,
                pluginName,
                orgId: orgId,
            },
            ...(isReactExportFreePlanEnabled ? { trial_period_days: 7 } : {}),
        },

        allow_promotion_codes: true,
    })
    if (!session.url?.toString()) {
        throw new Error('No Stripe payment link found')
    }

    return redirect(String(session.url))
}
