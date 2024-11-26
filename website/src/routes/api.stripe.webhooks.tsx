import { ActionFunctionArgs } from '@remix-run/node'
import { prisma, Prisma } from 'db/prisma'
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
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionChange(subscription, event.type)
                break
            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice
                await handleInvoicePaymentSucceeded(invoice)
                break
            default:
                console.log(`Unhandled event type ${event.type}`)
        }
    } catch (error) {
        console.error('Error processing webhook:', error)
        return new Response('Webhook processing failed', { status: 500 })
    }

    return new Response('Received', { status: 200 })
}

async function handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
) {
    const customerEmail = session.customer_details?.email

    const orgId = session.metadata?.orgId
    const pluginName = session.metadata?.pluginName as any
    if (!orgId) {
        notifyError(
            new AppError('No orgId in Stripe metadata'),
            'Stripe webhook',
        )
        return
    }

    const item = session.line_items?.data[0] // Assuming single item checkout

    if (!item || !item.price?.id) {
        throw new AppError('No price id')
    }

    const create: Prisma.PaymentForCreditsCreateManyInput = {
        id: session.id,
        email: customerEmail || '',
        variantName: item.description || '',
        orderId: session.id,
        productId: item.price?.product.toString(),
        variantId: item.price?.id,
        provider: 'stripe',
        orgId,
        pluginName,
        metadata: session.metadata || {},
    }

    await prisma.paymentForCredits.upsert({
        where: { id: session.id },
        create,
        update: create,
    })
}

async function handleSubscriptionChange(
    subscription: Stripe.Subscription,
    eventType: string,
) {
    const orgId = subscription.metadata?.orgId

    if (!orgId) {
        notifyError(
            new AppError('No orgId in subscription metadata'),
            'Stripe webhook',
        )
        return
    }
    const pluginName = subscription.metadata?.pluginName as any

    const create: Prisma.SubscriptionCreateManyInput = {
        orgId: orgId,
        orderId: subscription.id,
        productId: subscription.items.data[0]?.price.product.toString(),
        variantId: subscription.items.data[0]?.price.id,
        subscriptionId: subscription.id,
        email: orgId || undefined,
        endsAt: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : undefined,
        status: subscription.status,
        variantName: subscription.items.data[0]?.price.nickname || undefined,
        createdAt: new Date(subscription.created * 1000),
        pluginName,
        metadata: subscription.metadata || {},
        provider: 'stripe',
        customerId: subscription.customer.toString(),
    }

    await prisma.subscription.upsert({
        where: {
            subscriptionId_variantId: {
                subscriptionId: subscription.id,
                variantId: subscription.items.data[0]?.price.id || '',
            },
        },
        create,
        update: create,
    })
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return

    const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string,
    )
    const orgId = subscription.metadata?.orgId

    if (!orgId) {
        throw new AppError('No orgId in subscription metadata')
    }

    const create: Prisma.PaymentForCreditsCreateManyInput = {
        id: invoice.id,
        productId: subscription.items.data[0]?.price.product as string,
        email: invoice.customer_email || '',
        orderId: invoice.id,
        subscriptionId: subscription.id,
        variantId: subscription.items.data[0]?.price.id,
        variantName: subscription.items.data[0]?.price.nickname || undefined,
        customerId: subscription.customer.toString(),
        orgId,
    }

    await prisma.paymentForCredits.upsert({
        where: { id: invoice.id },
        create,
        update: create,
    })
}
