import { ActionFunctionArgs } from '@remix-run/node'
import { db } from 'db/kysely'
import { Hono } from 'hono'
import { crisp } from '../lib/crisp'
import { notifyError } from '../lib/errors'
import {
    getSupabaseSession,
    getSupabaseWithHeaders,
} from '../lib/supabase.server'
import { env } from '../lib/env'

const app = new Hono()

const route = app
    .get(
        '/api/v1/conversations',
        // zValidator('json', z.object({})),
        async function getConversations(c) {
            const { supabase, headers } = getSupabaseWithHeaders({
                request: c.req.raw,
                response: c.res,
            })
            const {
                data: { session },
            } = await supabase.auth.getSession()
            let userId = session?.user?.id
            // userId = 'de7e3c6b-7dd2-43e6-a571-dcdcdf83d283'
            if (!userId) {
                throw new Error('Unauthorized')
            }

            const [
                websites,
                {
                    data: { user },
                    error,
                },
            ] = await Promise.all([
                db
                    .selectFrom('siteOperators')
                    .innerJoin(
                        'sites',
                        'sites.websiteId',
                        'siteOperators.websiteId',
                    )
                    .innerJoin(
                        'operators',
                        'operators.crispUserId',
                        'siteOperators.crispUserId',
                    )
                    .where('operators.userId', '=', userId)
                    .where('siteOperators.crispPluginId', '=', env.CRISP_ID!)
                    .where('sites.crispPluginId', '=', env.CRISP_ID!)
                    .selectAll()
                    // .distinct()
                    .execute(),
                supabase.auth.getUser(),
            ])
            if (!user || user.id !== userId) {
                throw new Error('User not authenticated')
            }
            if (error) {
                throw error
            }
            const [groups] = await Promise.all([
                Promise.all(
                    websites.map(async (site) => {
                        try {
                            let res = await crisp.getConversations({
                                websiteId: site.websiteId!,
                                orderDateUpdated: true,
                                pageNumber: 0,
                                perPage: 40,
                            })
                            // res = res.filter((x) => {
                            //     return x?.meta?.email
                            // })
                            for (let conversation of res) {
                                if (
                                    !conversation.meta?.device?.geolocation
                                        ?.country
                                ) {
                                    try {
                                        conversation.meta.device.geolocation.country =
                                            'US'
                                    } catch (e) {
                                        notifyError(e, 'Error setting country')
                                    }
                                }
                            }
                            return res
                        } catch (e: any) {
                            if (
                                websites?.length > 1 && // show error if user has only this website
                                e.message.includes(
                                    'the website is not subscribed to the plugin',
                                )
                            ) {
                                console.error(
                                    `removing removed website from Raycast extension: ${site.domain}`,
                                )
                                await db
                                    .deleteFrom('sites')
                                    .where('websiteId', '=', site.websiteId)
                                    .execute()
                                return []
                            }
                            throw e
                        }
                    }),
                ),
            ])

            const conversations = groups
                .flat()
                .map((conversation) => {
                    const site = websites.find(
                        (site) => site.websiteId === conversation.website_id,
                    )
                    return { site, conversation }
                    // const country =
                    //     conversation.meta.device?.geolocation?.country
                    // const email = conversation.meta.email || 'visitor'

                    // const segments = conversation.meta.segments
                    // const avatar = conversation.meta.avatar

                    // const websiteDomain = site?.domain
                    // const lastMessageAt = conversation.updated_at
                    // const unreadMessages = conversation.unread.operator
                    // const sessionId = conversation.session_id
                    // return {
                    //     websiteId: conversation.website_id,
                    //     unreadMessages,
                    //     lastMessageAt,
                    //     websiteDomain,
                    //     country,
                    //     segments,
                    //     avatar,
                    //     sessionId,
                    //     // lastMessage,
                    //     email,
                    // }
                })
                .sort((a, b) => {
                    // latest conversation first
                    return (
                        b.conversation?.updated_at! -
                        a.conversation?.updated_at!
                    )
                })

            return c.json(
                {
                    ok: true,
                    websites,
                    conversations,
                },
                { headers },
            )
        },
    )
    .get('/api/v1/health', (c) => {
        return c.json({
            ok: true,
        })
    })
    .onError(async (error) => {
        notifyError(error, 'API error')
        return new Response(error.message, { status: 500 }) as any
        return new Response('Internal server error', { status: 500 })
    })

export type RouteType = typeof route

export function action({ request }: ActionFunctionArgs) {
    return route.fetch(request)
}
export function loader({ request }: ActionFunctionArgs) {
    return route.fetch(request)
}
