import { db } from 'db/kysely'
import crypto from 'crypto'
import { crisp } from './crisp'
import { redirect } from '@remix-run/react'
import { request } from 'http'
import { crispAPIIdentifier, env } from './env'
import { getSupabaseSession, createSupabaseAdmin } from './supabase.server'
import { otpRedirectLink } from './utils'
import { SupabaseClient } from '@supabase/supabase-js'

export async function syncDbWithCrisp() {
    const crispSites = await crisp.getWebsites()
    let data = await Promise.all(
        crispSites.map((site) => syncSite({ websiteId: site.website_id })),
    )

    // TODO delete operators that no longer have access to site
    return data
}

export async function getCrispData({ websiteId }) {
    const [sub, operators, site] = await Promise.all([
        crisp.subscriptionSettings({
            websiteId: websiteId,
            pluginId: crispAPIIdentifier,
        }),
        crisp.getOperators({ websiteId: websiteId }),
        crisp.getWebsite({ websiteId: websiteId }),
    ])
    if (!sub) {
        throw new Error('No Crisp subscription settings found')
    }

    if (!operators.length) {
        throw new Error('No operators found')
    }

    const owner = operators.find((x) => x.details.role === 'owner')
    if (!owner) {
        throw new Error('No owner found')
    }
    return {
        operators,
        // owner,
        site,
        sub,
    }
}

export async function syncSite({ websiteId }) {
    console.log('Syncing site', websiteId)
    const { operators, site, sub } = await getCrispData({ websiteId })

    const emails = operators.map((x) => x.details.email).filter(Boolean)
    const users = await db
        .selectFrom('auth.users')
        .where('email', 'in', emails)
        .where('email_confirmed_at', 'is not', null)
        .selectAll()
        .execute()

    await Promise.all(
        operators.map(async (operator) => {
            if (!operator?.details?.role) {
                console.log(
                    'Operator has no role, skipping',
                    operator.details.email,
                )
                return
            }
            console.log(
                `Syncing operator ${operator.details.email} with website ${websiteId}`,
            )
            await db.transaction().execute(async (db) => {
                const user = users.find(
                    (x) => x.email === operator.details.email,
                )
                if (!user) {
                    console.log(
                        `User for operator ${operator.details.email} not found, inserting without user connection`,
                        // user,
                    )
                }
                const userId = user?.id || null
                await db
                    .insertInto('sites')
                    .values({
                        domain: site.domain,
                        websiteId: websiteId,
                        logo: site.logo,
                        crispPluginId: env.CRISP_ID!,
                        crispToken: sub.token,
                    })
                    .onConflict((oc) => {
                        return oc
                            .columns(['websiteId', 'crispPluginId'])
                            .doUpdateSet({
                                logo: site.logo,
                                crispPluginId: env.CRISP_ID!,
                                crispToken: sub.token,
                                domain: site.domain,
                            })
                    })
                    .execute()
                await db
                    .insertInto('operators')
                    .values({
                        crispEmail: operator.details.email,
                        userId,
                        crispUserId: operator.details.user_id,
                        name: operator.details.first_name,
                    })
                    .onConflict((oc) => {
                        return oc.columns(['crispUserId']).doUpdateSet({
                            userId,
                            name: operator.details.first_name,
                            crispEmail: operator.details.email,
                        })
                    })
                    .execute()

                await db
                    .insertInto('siteOperators')
                    .values({
                        crispRole: operator.details.role,
                        // userId,
                        crispUserId: operator.details.user_id,
                        crispPluginId: env.CRISP_ID!,
                        websiteId: websiteId,
                    })
                    .onConflict((oc) => {
                        return oc
                            .columns([
                                'crispUserId',
                                'crispPluginId',
                                'websiteId',
                            ])
                            .doUpdateSet({
                                crispRole: operator.details.role,
                                // userId,
                                crispPluginId: env.CRISP_ID!,
                                crispUserId: operator.details.user_id,
                                websiteId: websiteId,
                            })
                    })
                    .execute()
            })
        }),
    )
    return { site, operators, sub }
}

export function generatePassword(length = 18) {
    const charset =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?~'
    return crypto
        .randomBytes(length)
        .reduce((acc, byte) => acc + charset[byte % charset.length], '')
}
