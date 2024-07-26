import { prisma } from 'db/prisma'
import { variantIdToCredits } from 'website/src/lib/env'
import { AppError } from 'website/src/lib/errors'

const FREE_CREDITS = 1000

// export async function getOrgSubscriptions({ orgId }) {
//     const subs = await prisma.subscription.findMany({
//         where: {
//             orgId,
//             status: {
//                 in: [
//                     'active',
//                     'incomplete', // what is incomplete?
//                     'past_due', //
//                     // 'expired',
//                 ],
//             },
//         },
//     })
//     return subs
// }
// export async function getOrgLimitsAndSubs({ orgId }) {
//     const subs = await getOrgSubscriptions({ orgId })
//     const limitsC = plansConfig.filter((x) =>
//         subs.find((s) => String(s.variantId) === String(x.variantId)),
//     )
//     console.log(
//         `found ${limitsC.length} subscriptions: ${limitsC
//             .map((x) => x.name)
//             .join(', ')}`,
//     )
//     const limits = limitsC.reduce(
//         (a, b) => {
//             a.words = a.words + b.limits.words
//             a.seats = a.seats + b.limits.seats
//             return a
//         },
//         { words: 0, seats: 0 },
//     )

//     return { subs, limits, hasFreeTrial: false }
// }

export async function getOrgCredits({ orgId }) {
    const [payments, allWords, org] = await Promise.all([
        prisma.paymentForCredits.findMany({
            where: {
                orgId,
            },
            select: {
                variantId: true,
            },
        }),
        prisma.generation.aggregate({
            where: {
                orgId,
                // createdAt: {
                //     gt: oneMonthAgo
                // }
            },
            _sum: {
                words: true,
            },
        }),
        prisma.org.findUnique({
            where: {
                orgId: orgId,
            },
        }),
        // prisma.subscription.findFirst({
        //     where: {
        //         orgId,
        //         status: 'active',
        //     },
        // }),
    ])
    // console.log('recharges', recharges)
    // console.log('allWords', allWords)
    // const createdAt = org?.createdAt?.getTime() || Date.now()
    // const monthsCredits =
    //     Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24 * 30)) + 1
    let totalCredits = payments
        .map((x) => {
            const num = variantIdToCredits[x.variantId]
            if (num == null) {
                throw new AppError(
                    `Cannot get credits for variantId ${x.variantId}`,
                )
            }
            return num
        })
        .reduce((a, b) => a + b, 0)

    const used = allWords?._sum?.words || 0
    let free = !payments?.length
    if (free) {
        totalCredits = FREE_CREDITS
    }
    return {
        remaining: Math.max(totalCredits - (allWords._sum?.words || 0), 0),
        total: totalCredits,
        used,
        free,
    } as RemainingCredits
}

export type RemainingCredits = {
    remaining: number
    total: number
    used: number
    free: boolean
}
