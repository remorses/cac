// http://localhost:8040/api/markdown-plugin/buy?email=tommy@example.com&orgId=12345678
// free with 2J5ZQHW3

import { PluginName, prisma } from 'db'
import { LoaderFunctionArgs, redirect } from 'react-router'
import Stripe from 'stripe'
import { env } from 'website/src/lib/env'
import { managedSubscriptionStatuses, getOrCreateStripeCustomer } from 'website/src/lib/stripe-customers'

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {})

export async function loader({ request }: LoaderFunctionArgs) {
    const u = new URL(request.url)

    const baseUrl = `${u.protocol}//${u.host}`
    const orgId = u.searchParams.get('orgId') || ''
    const params = Object.fromEntries(u.searchParams.entries())

    if (!orgId) {
        throw new Error('orgId not found')
    }

    const pluginName: PluginName = 'githubSync'

    // Prevent duplicate subscriptions: if org already has an active sub,
    // redirect to the billing portal instead of creating a new checkout
    const activeSub = await prisma.subscription.findFirst({
        where: {
            orgId,
            provider: 'stripe',
            pluginName: 'githubSync',
            status: { in: [...managedSubscriptionStatuses] },
            customerId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
    })
    if (activeSub?.customerId) {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: activeSub.customerId,
            return_url: new URL(
                '/after-framer-payment',
                env.PUBLIC_URL,
            ).toString(),
        })
        return redirect(portalSession.url)
    }

    // Prevent duplicate customers: always reuse Org.stripeCustomerId or
    // create one Stripe customer per org. Never pass customer_email alone.
    const customerId = await getOrCreateStripeCustomer({
        orgId,
        email: params.email,
    })

    const session = await stripe.checkout.sessions.create({
        line_items: [{ quantity: 1, price: env.STRIPE_PRICE_ID }],
        mode: 'subscription',
        customer: customerId,
        client_reference_id: orgId,
        success_url: new URL('/after-framer-payment', baseUrl).toString(),
        cancel_url: new URL('/after-framer-payment', baseUrl).toString(),
        metadata: {
            ...params,
            orgId,
        },
        subscription_data: {
            metadata: {
                ...params,
                pluginName,
                orgId,
            },
        },
        allow_promotion_codes: true,
    })
    if (!session.url?.toString()) {
        throw new Error('No Stripe payment link found')
    }

    return redirect(String(session.url))
}
