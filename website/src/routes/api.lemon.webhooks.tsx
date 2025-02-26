import {
    DiscriminatedWebhookPayload,
    whatwgWebhooksHandler,
} from 'lemonsqueezy-webhooks'
import { PluginName, prisma, Prisma } from 'db/prisma'
import { env, plansConfig } from 'website/src/lib/env'
import { AppError, notifyError } from 'website/src/lib/errors'
import { ActionFunctionArgs } from '@remix-run/node'

const secret = process.env.SECRET

if (!secret) {
    throw new Error('SECRET is not set')
}

export const loader = () => {
    return new Response('use POST', {
        status: 405,
    })
}

function getUserEmail(payload: DiscriminatedWebhookPayload) {
    switch (payload.event_name) {
        case 'order_created':
            return payload.data.attributes.user_email
        case 'subscription_created':
        case 'subscription_updated':
            return payload.data.attributes.user_email
        case 'subscription_cancelled':
            return payload.data.attributes.user_email
        default:
            return ''
    }
}

export const action = ({ request }: ActionFunctionArgs) => {
    return whatwgWebhooksHandler({
        async onData(payload) {
            console.log(JSON.stringify(payload))
            let customData = payload.meta.custom_data
            let orgId = customData?.orgId
            let pluginName: PluginName = customData?.pluginName

            if (!orgId) {
                notifyError(
                    new AppError(
                        'No orgId in lemon squeezy custom_data, ignoring ' +
                            payload?.data?.id,
                    ),
                    'lemon squeezy webhook',
                )
                const email = getUserEmail(payload)
                if (!email) {
                    return // no matching user found, exit early
                }
                const userWithEmail = await prisma.users.findFirst({
                    where: {
                        email,
                    },
                    include: {
                        orgs: true,
                    },
                })

                if (userWithEmail?.orgs?.[0]?.orgId) {
                    console.log(
                        `Found user with email ${email} and orgId ${userWithEmail.orgs[0].orgId}, using that`,
                    )
                    orgId = userWithEmail.orgs[0].orgId
                } else {
                    return // no matching user found, exit early
                }
            }
            let org = await prisma.org.findFirst({
                where: {
                    orgId: orgId,
                },
            })
            if (!org) {
                console.log(
                    `No org found for lemon squeezy custom_data, ignoring ${payload?.data?.id}`,
                )
                return
            }
            if (payload.event_name === 'order_created') {
                let data = payload.data
                let item = data.attributes.first_order_item

                const productId = String(item.product_id)
                if (
                    productId === env.PUBLIC_LEMON_PRODUCT_MIGRATE &&
                    !pluginName
                ) {
                    pluginName = 'migrate'
                }
                let create: Prisma.PaymentForCreditsCreateManyInput = {
                    id: String(data.id),
                    // price: 0,
                    email: data.attributes.user_email,
                    variantName: item.variant_name,
                    orderId: String(data.id),
                    orgId,
                    productId: String(item.product_id),
                    pluginName,
                    variantId: String(item.variant_id),
                }
                console.log(
                    `adding payment for credits ${JSON.stringify(plansConfig.find((x) => x.variantId === item.variant_id))} after order ${data.id}`,
                )
                await prisma.paymentForCredits.upsert({
                    where: { id: String(data.id) },
                    create,
                    update: create,
                })
            } else if (
                payload.event_name === 'subscription_created' ||
                payload.event_name === 'subscription_cancelled' ||
                payload.event_name === 'subscription_expired' ||
                payload.event_name === 'subscription_paused' ||
                payload.event_name === 'subscription_resumed' ||
                payload.event_name === 'subscription_unpaused'
            ) {
                let data = payload.data
                let variantId = data.attributes.variant_id
                let create: Prisma.SubscriptionCreateManyInput = {
                    orgId: orgId,
                    orderId: String(data.attributes.order_id),
                    productId: String(data.attributes.product_id),
                    variantId: String(variantId),
                    subscriptionId: String(data.id),
                    email: data.attributes.user_email || undefined,
                    endsAt: data.attributes.ends_at
                        ? new Date(data.attributes.ends_at)
                        : undefined,
                    status: data.attributes.status || undefined,
                    variantName: data.attributes.variant_name || undefined,
                    createdAt: new Date(data.attributes.created_at),
                    pluginName,
                }
                console.log(
                    `adding subscription for credits ${JSON.stringify(plansConfig.find((x) => x.variantId === variantId))} after order ${data.id}`,
                )

                let sub = await prisma.subscription.upsert({
                    where: {
                        subscriptionId_variantId: {
                            subscriptionId: String(data.id),
                            variantId: String(data.attributes.variant_id),
                        },
                    },
                    create,
                    update: create,
                })
            } else if (payload.event_name === 'subscription_payment_success') {
                let data = payload.data
                let sub = await prisma.subscription.findFirst({
                    where: {
                        subscriptionId: String(data.attributes.subscription_id),
                    },
                })
                if (!sub) {
                    throw new AppError(
                        `Subscription not found for payment ${data.id}`,
                    )
                }
                let create: Prisma.PaymentForCreditsCreateManyInput = {
                    id: String(data.id),
                    orgId: orgId || sub.orgId,
                    productId: String(sub.productId),
                    // price: data.attributes.total,
                    email: sub.email,
                    orderId: String(sub.orderId),
                    subscriptionId: String(sub.subscriptionId),
                    variantId: sub.variantId,
                    variantName: sub.variantName,
                    pluginName,
                }
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                // to support both 1 time subscriptions and recurring subscriptions, i need to add payment for credits on order and then delete it
                await prisma.paymentForCredits
                    .deleteMany({
                        where: {
                            orderId: String(sub.orderId),
                            createdAt: {
                                gt: yesterday,
                            },
                        },
                    })
                    .catch((e) => notifyError(e, 'delete old order'))
                await prisma.paymentForCredits.upsert({
                    where: { id: String(data.id) },
                    create,
                    update: create,
                })
            }
        },
        request,

        secret: env.SECRET!,
    })
}
