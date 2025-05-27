// http://localhost:8040/api/react-export-plugin/buy?email=tommy@example.com&orgId=12345678
// free with 2J5ZQHW3

import { PluginName } from 'db'
import { href, LoaderFunctionArgs, redirect } from 'react-router'
import Stripe from 'stripe'
import { env, reactExportVariants } from 'website/src/lib/env'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {})

export async function loader({ request }: LoaderFunctionArgs) {
    const u = new URL(request.url)

    const baseUrl = `${u.protocol}//${u.host}`
    const orgId = u.searchParams.get('orgId') || ''
    const params = Object.fromEntries(u.searchParams.entries())

    if (!orgId) {
        throw new Error('orgId not found')
    }
    let pluginName: PluginName = 'reactExport'

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

    const session = await stripe.checkout.sessions.create({
        line_items: [{ quantity: 1, price }],
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
            trial_period_days: 7,
            // trial_settings: {
            //     end_behavior: 'cancel',
            // },
        },
        // payment_method_collection: 'always',

        allow_promotion_codes: true, // Enable coupon/promotion code input
    })
    if (!session.url?.toString()) {
        throw new Error('No Stripe payment link found')
    }

    return redirect(String(session.url))
}
