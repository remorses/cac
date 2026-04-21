// One-off migration: backfill Org.stripeCustomerId from existing Subscription rows.
//
// The Org.stripeCustomerId column existed but was never written to. Checkout routes
// now use getOrCreateStripeCustomer which reads/writes this column, but old orgs
// that already have Stripe subscriptions still have it as NULL. Without this backfill,
// those orgs would create a NEW Stripe customer on their next purchase.
//
// This script picks the most recent Stripe subscription per org and copies its
// customerId into the Org row. Only touches orgs where stripeCustomerId is NULL.
//
// Usage:
//   pnpm tsx scripts/backfill-stripe-customer-id.ts          # dry run (default)
//   pnpm tsx scripts/backfill-stripe-customer-id.ts --apply  # actually write to DB
//
// Safe to run multiple times (idempotent).

import { prisma } from 'db'

async function main() {
    const dryRun = !process.argv.includes('--apply')

    if (dryRun) {
        console.log('🔍 DRY RUN — pass --apply to actually write changes\n')
    } else {
        console.log('⚡ APPLYING changes to database\n')
    }

    // Find all orgs that have Stripe subscriptions but no stripeCustomerId set
    const orgsWithoutCustomerId = await prisma.org.findMany({
        where: {
            stripeCustomerId: null,
            subscriptions: {
                some: {
                    provider: 'stripe',
                    customerId: { not: null },
                },
            },
        },
        select: {
            orgId: true,
            name: true,
            subscriptions: {
                where: {
                    provider: 'stripe',
                    customerId: { not: null },
                },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                    customerId: true,
                    pluginName: true,
                    status: true,
                    createdAt: true,
                },
            },
        },
    })

    if (orgsWithoutCustomerId.length === 0) {
        console.log('✅ No orgs need backfilling — all Stripe orgs already have stripeCustomerId set.')
        return
    }

    console.log(`Found ${orgsWithoutCustomerId.length} org(s) to backfill:\n`)
    console.log('  orgId | name | customerId | plugin | status | subDate')
    console.log('  ' + '-'.repeat(90))

    const updates: Array<{ orgId: string; customerId: string }> = []

    for (const org of orgsWithoutCustomerId) {
        const sub = org.subscriptions[0]
        if (!sub?.customerId || !sub.customerId.startsWith('cus_')) {
            continue
        }
        updates.push({ orgId: org.orgId, customerId: sub.customerId })
        console.log(
            `  ${org.orgId} | ${org.name || '(unnamed)'} | ${sub.customerId} | ${sub.pluginName || '?'} | ${sub.status} | ${sub.createdAt.toISOString().slice(0, 10)}`,
        )
    }

    console.log('')

    if (dryRun) {
        console.log(`Would update ${updates.length} org(s). Run with --apply to execute.`)
        return
    }

    let updated = 0
    for (const { orgId, customerId } of updates) {
        // CAS update: only write if still null (safe against concurrent runs)
        const result = await prisma.org.updateMany({
            where: { orgId, stripeCustomerId: null },
            data: { stripeCustomerId: customerId },
        })
        updated += result.count
    }

    console.log(`✅ Updated ${updated} org(s) with stripeCustomerId.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => {
        return prisma.$disconnect()
    })
