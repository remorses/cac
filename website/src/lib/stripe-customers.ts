// Single source of truth for Stripe customer creation. Every checkout route
// MUST call getOrCreateStripeCustomer instead of passing customer_email to
// Stripe — otherwise duplicate Stripe customers are created per org, which
// breaks portal sessions and allows duplicate subscriptions.
//
// Race condition protection: two concurrent requests for the same org can both
// read stripeCustomerId=null. We use a Stripe idempotency key so Stripe returns
// the same customer for both, and a CAS update (updateMany where null) so only
// the first writer wins. The loser re-reads the org to get the winner's value.

import Stripe from 'stripe'
import { prisma } from 'db'
import { env } from 'website/src/lib/env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {})

/**
 * Statuses that grant actual feature access (can they use the plugin?).
 * Use this for download gates, API access checks, etc.
 */
export const activeSubscriptionStatuses = [
    'active',
    'trialing',
    'on_trial',
] as const

/**
 * Statuses that mean "org already has a subscription in Stripe" — if any sub
 * is in one of these states, the buy route should redirect to the billing portal
 * instead of creating a new checkout. Includes past_due/paused/unpaid because
 * the customer still has a manageable subscription they should fix via portal,
 * not by creating a duplicate.
 */
export const managedSubscriptionStatuses = [
    'active',
    'trialing',
    'on_trial',
    'past_due',
    'paused',
    'unpaid',
    'incomplete',
] as const

/**
 * Get or create the Stripe customer for an org. Idempotent — safe to call
 * from any flow, even concurrently. This is the ONLY place in the codebase
 * where `stripe.customers.create` should be called.
 *
 * Uses a Stripe idempotency key keyed on orgId so concurrent requests get the
 * same customer, and a CAS update so only one writer wins the DB row.
 */
export async function getOrCreateStripeCustomer({
    orgId,
    email,
}: {
    orgId: string
    email?: string | null
}): Promise<string> {
    const org = await prisma.org.findUnique({
        where: { orgId },
        select: { stripeCustomerId: true },
    })
    if (!org) {
        throw new Error(`Org ${orgId} not found`)
    }

    if (org.stripeCustomerId) {
        return org.stripeCustomerId
    }

    // Idempotency key ensures Stripe returns the same customer even if two
    // concurrent requests both reach this point for the same org
    const customer = await stripe.customers.create(
        {
            email: email || undefined,
            metadata: { orgId },
        },
        {
            idempotencyKey: `org:${orgId}:stripe-customer`,
        },
    )

    // CAS update: only write if stripeCustomerId is still null. If another
    // request already wrote it, this is a no-op (count=0).
    const claimed = await prisma.org.updateMany({
        where: { orgId, stripeCustomerId: null },
        data: { stripeCustomerId: customer.id },
    })

    if (claimed.count === 1) {
        return customer.id
    }

    // Another request won the race — re-read to get the winner's customer id
    const currentOrg = await prisma.org.findUnique({
        where: { orgId },
        select: { stripeCustomerId: true },
    })
    if (currentOrg?.stripeCustomerId) {
        return currentOrg.stripeCustomerId
    }

    throw new Error(`Failed to resolve Stripe customer for org ${orgId}`)
}

/**
 * Backfill Org.stripeCustomerId from a Stripe event. Called from webhooks
 * when we know the orgId and customerId but the org row might not have it
 * stored yet (for orgs that subscribed before this column was wired up).
 *
 * Only writes when stripeCustomerId is null so we never overwrite a correct
 * value. Should ONLY be called when orgId was resolved from a trusted source
 * (metadata), never from the email-fallback path.
 */
export async function backfillStripeCustomerId({
    orgId,
    customerId,
}: {
    orgId: string
    customerId: string
}) {
    await prisma.org.updateMany({
        where: {
            orgId,
            stripeCustomerId: null,
        },
        data: { stripeCustomerId: customerId },
    })
}
