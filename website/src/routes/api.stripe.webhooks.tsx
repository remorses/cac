import { ActionFunctionArgs } from 'react-router'
import { prisma, Prisma } from 'db'
import Stripe from 'stripe'
import { env } from 'website/src/lib/env'
import { AppError, notifyError } from 'website/src/lib/errors'

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {})

export const loader = () => {
    return new Response('use POST', {
        status: 405,
    })
}

export const action = async ({ request }: ActionFunctionArgs) => {
    const sig = request.headers.get('stripe-signature')

    if (!sig) {
        return new Response('No signature', { status: 400 })
    }

    const body = await request.text()

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            env.STRIPE_WEBHOOK_SECRET!,
        )
    } catch (err) {
        console.error(err)
        return new Response('Webhook Error', { status: 400 })
    }



    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const checkoutSession = event.data
                    .object as Stripe.Checkout.Session
                await handleCheckoutSessionCompleted(checkoutSession)
                break
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                const subscription = event.data.object

                await handleSubscriptionChange(subscription)
                break
            // case 'invoice.payment_succeeded':
            //     const invoice = event.data.object as Stripe.Invoice
            //     await handleInvoicePaymentSucceeded(invoice)
            //     break
            default:
                console.log(`Unhandled event type ${event.type}`)
        }
    } catch (error) {
        notifyError(
            error,
            `Error processing webhook for event type ${event.type}:`,
        )
        return new Response('Webhook processing failed', { status: 500 })
    }

    return new Response('Received', { status: 200 })
}
async function handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
) {
    // Fetch latest session data
    const latestSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
    })

    const customerEmail = latestSession.customer_details?.email || undefined

    const orgId = await resolveStripeOrgId({
        metadataOrgId: latestSession.metadata?.orgId,
        customerEmail,
        context: `checkout.session.completed (${latestSession.id})`,
    })
    const pluginName = latestSession.metadata?.pluginName as any
    if (!orgId) {
        return
    }

    const item = latestSession.line_items?.data[0] // Assuming single item checkout
    console.log('item', item)
    if (!item || !item.price?.id) {
        return
        // throw new AppError('No price id')
    }

    const create: Prisma.PaymentForCreditsCreateManyInput = {
        id: latestSession.id,
        email: customerEmail || '',
        variantName: item.description || '',
        orderId: latestSession.id,
        productId: item.price?.product.toString(),
        variantId: item.price?.id,
        provider: 'stripe',
        orgId,
        pluginName,
        metadata: latestSession.metadata || {},
        // status: latestSession.payment_status,
    }

    await prisma.paymentForCredits.upsert({
        where: { id: latestSession.id },
        create,
        update: create,
    })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
    // Fetch the latest subscription data from Stripe
    const latestSubscription = await stripe.subscriptions.retrieve(
        subscription.id,
    )

    const metadataEmail = latestSubscription.metadata?.email || undefined
    const orgId = await resolveStripeOrgId({
        metadataOrgId: latestSubscription.metadata?.orgId,
        customerEmail: metadataEmail,
        context: `customer.subscription event (${latestSubscription.id})`,
    })
    if (!orgId) {
        return
    }

    const variantId = latestSubscription.items.data[0]?.price.id
    if (!variantId) {
        notifyError(
            new AppError(
                `No variantId in subscription items for subscription ${latestSubscription.id}`,
            ),
            'Stripe webhook',
        )
        return
    }

    const pluginName = latestSubscription.metadata?.pluginName as any

    const create: Prisma.SubscriptionCreateManyInput = {
        orgId: orgId,
        orderId: latestSubscription.id,
        productId: latestSubscription.items.data[0]?.price.product.toString(),
        variantId,
        subscriptionId: latestSubscription.id,
        email: metadataEmail,
        status: latestSubscription.status,
        variantName:
            latestSubscription.items.data[0]?.price.nickname || undefined,
        createdAt: new Date(latestSubscription.created * 1000),
        pluginName,

        metadata: latestSubscription.metadata || {},
        provider: 'stripe',
        customerId: latestSubscription.customer.toString(),
    }
    console.log(`updating subscription with data:`, create)

    await prisma.subscription.upsert({
        where: {
            subscriptionId_variantId: {
                subscriptionId: latestSubscription.id,
                variantId,
            },
        },
        create,
        update: create,
    })
}

async function resolveStripeOrgId({
    metadataOrgId,
    customerEmail,
    context,
}: {
    metadataOrgId: string | undefined
    customerEmail: string | undefined
    context: string
}) {
    if (metadataOrgId) {
        const org = await prisma.org.findUnique({
            where: {
                orgId: metadataOrgId,
            },
            select: {
                orgId: true,
            },
        })
        if (org?.orgId) {
            return org.orgId
        }
        notifyError(
            new AppError(
                `Stripe webhook received unknown orgId ${metadataOrgId} for ${context}`,
            ),
            'Stripe webhook',
        )
    } else {
        notifyError(
            new AppError(`No orgId in Stripe metadata for ${context}`),
            'Stripe webhook',
        )
    }

    if (!customerEmail) {
        return null
    }

    const userWithEmail = await prisma.users.findFirst({
        where: {
            email: customerEmail,
        },
        include: {
            orgs: true,
        },
    })
    const fallbackOrgId = userWithEmail?.orgs?.[0]?.orgId
    if (!fallbackOrgId) {
        return null
    }

    const fallbackOrg = await prisma.org.findUnique({
        where: {
            orgId: fallbackOrgId,
        },
        select: {
            orgId: true,
        },
    })
    if (!fallbackOrg?.orgId) {
        return null
    }

    return fallbackOrg.orgId
}
