import { Elysia, t, ValidationError } from 'elysia'
import { markdownPluginApp } from 'website/src/lib/elysia-markdown-plugin'

import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { notifyError } from 'website/src/lib/errors'

import { db } from 'db/kysely'
import { rewritePluginApp } from 'website/src/lib/elysia-rewrite-plugin'

export const app = new Elysia({ prefix: '/api/framer-plugin', aot: false })
    .state('userId', '')
    .state('orgId', '')

    .use(
        cors({
            // credentials: true,
            // origin: env.PUBLIC_URL,
            // exposeHeaders: '*',
            maxAge: 60 * 60 * 24,
            preflight: true,
            // allowedHeaders: '*',
        }),
    )
    .onError(({ code, error }) => {
        if (error instanceof Response) {
            return error
        }
        let status = 500
        if (code === 'VALIDATION') {
            status = 400
        } else if (code === 'PARSE') {
            status = 400
        } else if (code === 'NOT_FOUND') {
            status = 404
        } else {
            status = 500
            notifyError(error, 'API error')
        }
        if (error instanceof ValidationError) {
            return error.toResponse()
        }

        return new Response(error.message, {
            status,
            // headers: { 'Content-Type': 'text/plain' },
        })
    })

    .onRequest(async ({ request, set, store }) => {
        const sessionKey = request.headers.get('sessionKey')

        const session = await db
            .selectFrom('FramerLoginSession')
            .where('key', '=', sessionKey)
            .innerJoin('Org', 'FramerLoginSession.orgId', 'Org.orgId')
            .selectAll()
            .executeTakeFirst()
        if (!session) {
            return
        }
        const userId = session.usedByUserId
        const orgId = session.orgId
        store.orgId = orgId || ''
        store.userId = userId || ''
    })
    .post('/currentOrg', async ({ store }) => {
        const orgId = store.orgId
        const orgAndUser = await db
            .selectFrom('Org')
            .where('orgId', '=', orgId)
            .leftJoin('auth.users', (join) => join.on('Org.orgId', '=', orgId))
            .selectAll()
            .executeTakeFirst()
        if (!orgAndUser) {
            throw unauthorizedResponse
        }
        const email = orgAndUser.email

        return { orgId, email }
    })
    .post(
        '/getSessionForKey',
        async ({ body, request }) => {
            // check in database if user with key has logged in, if yes, generate a supabase session for it

            if (!body.key) {
                return { error: 'No key provided' }
            }
            // const hourAgo = new Date()
            // hourAgo.setHours(hourAgo.getHours() - 1)
            const [framerSession] = await Promise.all([
                db
                    .selectFrom('FramerLoginSession')
                    .where('key', '=', body.key)
                    .where('usedByUserId', 'is not', null)
                    // .where('createdAt', '>', hourAgo)
                    .selectAll()
                    .executeTakeFirst(),
            ])
            if (!framerSession) {
                console.log('no framer session found')
                return { error: 'No valid framer request found' }
            }
            const user = await db
                .selectFrom('auth.users')
                .where('id', '=', framerSession.usedByUserId)
                .selectAll()
                .executeTakeFirst()

            if (!user) {
                console.log('no user found for framer session')
                throw new Error('No user found for request')
            }

            if (!user.email) {
                throw new Error('No user email found for user')
            }
            
            const { orgId, key } = framerSession
            const { email } = user
            console.log('found user for session', email)
            const requestData = framerSession.data || {}
            return { orgId, email, key, requestData }
        },
        {
            body: t.Object({
                key: t.String(),
            }),
            // response: {
            //     200: t.Object({
            //         data: t.Any(),
            //         session: t.Any(),
            //     }),
            // },
        },
    )
    // .guard({
    //     type: 'application/json',
    //     response: {
    //         500: t.String(),
    //     },
    // })

    .get(
        '/health',
        () => {
            return { ok: true }
        },
        {
            type: 'application/json',
            response: {
                200: t.Object({
                    ok: t.Boolean(),
                }),
            },
            description: 'Health check',
        },
    )
    .get(
        '/sse-test',
        async function* () {
            yield { ok: true }
            yield { ok: true }
            throw new Error('hello')
            yield 'hello'
        },
        {
            description: 'Health check',
        },
    )

    .use(rewritePluginApp)
    .use(markdownPluginApp)
    .get(
        '/errorExample',
        () => {
            throw new Response('An error occurred', { status: 400 })
            return { ok: true }
        },
        {
            type: 'application/json',
            response: {
                200: t.Object({
                    ok: t.Boolean(),
                }),
            },
            description: 'Health check',
        },
    )

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

app.use(swagger({}))
export type RouteType = typeof app
