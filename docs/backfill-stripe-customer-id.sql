-- One-off migration: backfill Org.stripeCustomerId from existing Subscription rows.
--
-- Context: the Org.stripeCustomerId column existed but was never written to.
-- Checkout routes now use getOrCreateStripeCustomer which reads/writes this column,
-- but old orgs that already have Stripe subscriptions still have it as NULL.
-- Without this backfill, those orgs would create a NEW Stripe customer on their
-- next purchase instead of reusing the existing one.
--
-- This query picks the most recent Stripe subscription per org and copies its
-- customerId into the Org row. It only touches orgs where stripeCustomerId is NULL.
--
-- Safe to run multiple times (idempotent).
-- Run against production DB after deploying the code changes.

UPDATE "Org" o
SET "stripeCustomerId" = s."customerId"
FROM (
    SELECT DISTINCT ON ("orgId") "orgId", "customerId"
    FROM "Subscription"
    WHERE provider = 'stripe'
      AND "customerId" IS NOT NULL
    ORDER BY "orgId", "createdAt" DESC
) s
WHERE o."orgId" = s."orgId"
  AND o."stripeCustomerId" IS NULL;
