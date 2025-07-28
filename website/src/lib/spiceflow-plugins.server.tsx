import { Spiceflow } from 'spiceflow'
import { validateLicense } from '@lemonsqueezy/lemonsqueezy.js'
import { openapi } from 'spiceflow/dist/openapi'

import { notifyError } from 'website/src/lib/errors'

import { db } from 'db/kysely'
import { markdownPluginApp } from 'website/src/lib/spiceflow-github-sync-plugin'
import { rewritePluginApp } from 'website/src/lib/spiceflow-migrate-plugin'
import { z } from 'zod'
import { cors } from 'spiceflow/cors'
import {
    getReactSub,
    reactPluginApp,
} from 'website/src/lib/spiceflow-react-export-plugin'
import { llmPluginApp } from 'website/src/lib/spiceflow-ai-rewrite-plugin'
import { prisma } from 'db'
import { href, redirect } from 'react-router'
import { framer } from 'framer-plugin'
import { generateUnframerRepo } from 'website/src/lib/unframer-github-repos'
import { env } from 'website/src/lib/env'
import { AppError } from 'website/src/lib/errors'
import dedent from 'dedent'
import { marked } from 'marked'

import { defaultResendOptions, resend } from './resend'

export const spiceflowApp = new Spiceflow({ basePath: '/api/plugins' })
    .state('userId', Promise.resolve(''))
    .state('orgId', Promise.resolve(''))
    .state('userEmail', Promise.resolve(''))
    .use(openapi({ path: '/openapi' }))
    .use(cors())
    .use(rewritePluginApp)
    .use(markdownPluginApp)
    .use(reactPluginApp)
    .use(llmPluginApp)
    // .use(
    //     cors({
    //         // credentials: true,
    //         // origin: env.PUBLIC_URL,
    //         // exposeHeaders: '*',
    //         maxAge: 60 * 60 * 24,
    //         preflight: true,
    //         // allowedHeaders: '*',
    //     }),
    // )
    .onError(({ code, error }) => {
        if (error instanceof Response) {
            return error
        }
        let status = 500
        if (code === 'VALIDATION') {
            status = 400
        } else {
            status = 500
            notifyError(error, 'API error')
        }
        // if (error instanceof ValidationError) {
        //     return error.toResponse()
        // }

        return new Response(error.message, {
            status,
            // headers: { 'Content-Type': 'text/plain' },
        })
    })
    .use(async function checkSession({ request, state }) {
        const searchParams = new URL(request.url).searchParams
        const sessionKey =
            request.headers.get('sessionKey') || searchParams.get('sessionKey')
        const projectId = request.headers.get('projectId')
        const orgId = Promise.withResolvers<string>()
        const userId = Promise.withResolvers<string>()
        const userEmail = Promise.withResolvers<string>()
        state.orgId = orgId.promise
        state.userId = userId.promise
        state.userEmail = userEmail.promise
        async function addState() {
            // console.log(`checking session key`)
            const session = await db
                .selectFrom('FramerLoginSession')
                .where('key', '=', sessionKey)
                .innerJoin('Org', 'FramerLoginSession.orgId', 'Org.orgId')
                .leftJoin(
                    'auth.users',
                    'FramerLoginSession.usedByUserId',
                    'auth.users.id',
                )
                .selectAll()
                .executeTakeFirst()

            // TODO remove this projectId check after plugin is updated
            // if (projectId && session.projectId && session.projectId !== projectId) {
            //     return
            // }
            userId.resolve(session?.usedByUserId || '')
            orgId.resolve(session?.orgId || '')
            userEmail.resolve(session?.email || '')
        }
        addState()
    })
    .get(
        '/angledScreen/generationsForUser',
        async ({ request, state, query }) => {
            const { framerUserId } = await query
            const row = await prisma.angledScreenImagesGenerated.findUnique({
                where: {
                    framerUserId,
                },
            })

            let maxFreeGenerations = 5
            if ((await state.userEmail)?.endsWith('@framer.com')) {
                maxFreeGenerations = 100
            }
            const { generations = 0, licenseKey } = row || {}
            const shouldBuyLicense =
                !licenseKey && generations > maxFreeGenerations
            return {
                generations,
                hasLicenseKey: !!licenseKey,
                maxFreeGenerations,
                shouldBuyLicense,
                framerUserId,
            }
        },
        {
            query: z.object({
                framerUserId: z.string(),
            }),
        },
    )
    .post(
        '/angledScreen/incrementGenerations',
        async ({ request }) => {
            const { framerUserId } = await request.json()
            await prisma.angledScreenImagesGenerated.upsert({
                where: {
                    framerUserId,
                },
                create: { generations: 0, framerUserId },
                update: {
                    generations: { increment: 1 },
                },
            })
            return {}
        },
        {
            body: z.object({
                framerUserId: z.string(),
                userName: z.string().optional(),
            }),
        },
    )
    .post(
        '/angledScreen/activate',
        async ({ request }) => {
            const lemonProductId = 348518
            const { framerUserId, userName, licenseKey } = await request.json()
            const { data, error } = await validateLicense(licenseKey || '')
            if (error) {
                return { error: error.message || 'Invalid license key' }
            }
            if (!data.valid) {
                return {
                    error: 'Unknown error validating license',
                }
            }

            if (data.meta?.product_id !== lemonProductId) {
                return {
                    error: 'License is for another product, contact support at tommy@unframer.co',
                }
            }

            await prisma.angledScreenImagesGenerated.upsert({
                where: {
                    framerUserId,
                },
                create: { userName, framerUserId, licenseKey },
                update: {
                    licenseKey,
                    userName,
                },
            })
            return { error: null }
        },
        {
            body: z.object({
                framerUserId: z.string(),
                userName: z.string().optional(),
                licenseKey: z.string(),
            }),
        },
    )

    .post('/currentOrg', async ({ state: store }) => {
        const orgId = await store.orgId
        if (!orgId) {
            throw unauthorizedResponse
        }
        const [org, user] = await Promise.all([
            db
                .selectFrom('Org')
                .where('orgId', '=', orgId)
                .selectAll()
                .executeTakeFirst(),
            db
                .selectFrom('auth.users')
                .where('id', '=', orgId)
                .selectAll()
                .executeTakeFirst(),
        ])
        const orgAndUser = { ...org, ...user }

        if (!orgAndUser) {
            throw unauthorizedResponse
        }
        const email = orgAndUser.email

        return { orgId, email }
    })
    .post(
        '/getSessionForKey',
        async ({ request }) => {
            let body = await request.json()
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
                console.log('no framer session found for key', body.key)
                return {
                    error: 'No valid framer request found - session not found',
                }
            }
            // TODO remove this check after plugin is updated
            if (body.projectId && framerSession.projectId !== body.projectId) {
                console.log('project id mismatch', {
                    requestProjectId: body.projectId,
                    sessionProjectId: framerSession.projectId,
                })
                return {
                    error: 'No valid framer request found - project ID mismatch',
                }
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
            body: z.object({
                key: z.string().optional(),
                projectId: z.string().optional(),
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
                200: z.object({
                    ok: z.boolean(),
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

    .get(
        '/errorExample',
        () => {
            throw new Response('An error occurred', { status: 400 })
            return { ok: true }
        },
        {
            type: 'application/json',
            response: {
                200: z.object({
                    ok: z.boolean(),
                }),
            },
            description: 'Health check',
        },
    )
    .post(
        '/validateSession',
        async ({ request }) => {
            const { sessionId, framerUserId } = await request.json()
            
            if (!sessionId || !framerUserId) {
                return { valid: false, error: 'Missing required parameters' }
            }
            
            const session = await prisma.framerLoginSession.findUnique({
                where: { key: sessionId },
            })
            
            if (!session) {
                return { valid: false, error: 'Session not found' }
            }
            
            if (session.framerUserId !== framerUserId) {
                return { valid: false, error: 'Session belongs to different user' }
            }
            
            if (!session.usedByUserId) {
                return { valid: false, error: 'Session not yet authenticated' }
            }
            
            return { valid: true }
        },
        {
            body: z.object({
                sessionId: z.string(),
                framerUserId: z.string(),
            }),
            response: {
                200: z.object({
                    valid: z.boolean(),
                    error: z.string().optional(),
                }),
            },
            description: 'Validates a session belongs to the given Framer user',
        },
    )


const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

// app.use(swagger({}))
export type RouteType = typeof spiceflowApp
