import fs from 'fs'
import { Evt } from 'evt'

import { on, EventEmitter } from 'events'
import { TransformStream } from 'stream/web'
import path from 'path'
import { Spiceflow } from 'spiceflow'

import {
    prisma,
    ReactExportColorStyle,
    ReactExportComponent,
    ReactExportLocale,
    ReactExportWebPage,
    type ReactExportComponentBreakpoint,
} from 'db/prisma'
import { z } from 'zod'
import { Sema } from 'async-sema'
import { deduplicateByKey } from 'website/src/lib/utils'
import Stripe from 'stripe'
import { env, REACT_PLUGIN_PRICING_CHANGE } from 'website/src/lib/env'
import { X } from 'lucide-react'
import type { url } from 'inspector'

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

export const componentObjectSchema = z.object({
    name: z.string(),
    url: z.string(),
})

export const freeComponents = 30

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {})

export type ComponentObject = z.infer<typeof componentObjectSchema>

type FramerEvent = { type: 'change'; components: ReactExportComponent[] }

let projectsEvents = new Map<string, Evt<FramerEvent>>()

export const reactPluginApp = new Spiceflow({
    basePath: '/reactExportPlugin',
})
    .state('orgId', '')
    .state('userId', '')

    .use(async function addGithubUserLogin({ request, state: store }) {
        const pathname = new URL(request.url).pathname
        if (!pathname.includes('/reactExportPlugin')) {
            return
        }
        const orgId = store.orgId
        if (!orgId) {
            return
        }
        const userId = store.userId
        if (!userId) {
            return
        }
    })
    .get('/health', () => {
        return 'ok'
    })
    .get(
        '/project/:projectId',
        async ({ params, state: store }) => {
            const { projectId } = params
            return await getProject({ projectId })
        },
        {},
    )
    .post(
        '/project/:projectId/publish',
        async ({ request, params }) => {
            const { projectId } = params
            const { components } = await request.json()
            if (!projectsEvents.has(projectId)) {
                projectsEvents.set(projectId, new Evt())
            }
            const emitter = projectsEvents.get(projectId)!
            console.log(
                'Framer emitting event for components',
                components.map((x) => x.url),
            )
            emitter.post({ type: 'change', components })

            return 'ok'
        },
        {
            body: z.object({
                components: z.array(z.custom<ReactExportComponent>()),
            }),
        },
    )
    .get(
        '/project/:projectId/subscribe',
        async function* ({ params, state: store }) {
            const { projectId } = params
            const project = await getProject({ projectId })
            try {
                yield { type: 'project' as const, ...project }
                const emitter = projectsEvents.get(projectId)
                if (!emitter) {
                    return
                }

                // https://docs.evt.land/api/evt/async-iterator
                for await (const event of emitter.iter()) {
                    console.log('emitting event', event)
                    yield event
                }
            } finally {
                const emitter = projectsEvents.get(projectId)
                emitter?.detach()
                projectsEvents.delete(projectId)
            }
        },
        {},
    )
    .get(
        '/subscriptions',
        async ({ request, state: store, query }) => {
            if (!store.orgId) {
                throw unauthorizedResponse
            }
            const { projectId } = query
            const activeSub = await getReactSub({
                orgId: store.orgId,
                projectId,
            })

            let manageSubUrl: string | undefined
            // const activeSub = subs.find((sub) => sub)
            if (activeSub?.customerId) {
                const portalSession =
                    await stripe.billingPortal.sessions.create({
                        customer: activeSub.customerId,

                        return_url: new URL(
                            '/after-framer-payment',
                            env.PUBLIC_URL,
                        ).toString(),
                    })
                manageSubUrl = portalSession.url
            }

            return {
                freeComponents,
                subs: [activeSub],
                activeSub,
                manageSubUrl,
            }
        },
        {
            query: z.object({
                projectId: z.string(),
            }),
        },
    )
    .post(
        '/upsertProject',
        async ({ request, state: store }) => {
            const body = await request.json()
            console.log('react upsertProject', body)
            let {
                colorStyles,
                pages,
                components,
                projectId,
                locales = [],
                projectName = '',
                fullFramerProjectId,
                websiteUrl,
                breakpoints,
            } = body

            const shortId = projectId.slice(0, 4)
            console.time(`[${shortId}] total upsert`)

            pages = deduplicateByKey(pages || [], (p) => p.webPageId)
            components = deduplicateByKey(components, (c) => c.id)
            colorStyles = deduplicateByKey(colorStyles, (s) => s.id)

            const orgId = store.orgId
            if (!orgId) {
                throw unauthorizedResponse
            }
            projectId = projectId.slice(0, 16)
            console.time(`[${shortId}] initial upsert`)
            const [project, reactSub, org] = await Promise.all([
                prisma.reactExportProject.upsert({
                    where: {
                        orgId,
                        projectId,
                    },
                    create: {
                        orgId,
                        projectId,
                        websiteUrl,
                        projectName,
                        fullFramerProjectId,
                    },
                    update: {
                        projectId,
                        websiteUrl,
                        projectName,
                        fullFramerProjectId,
                    },
                }),
                getReactSub({ orgId, projectId }),
                prisma.org.findUnique({
                    where: {
                        orgId,
                    },
                }),
            ])
            console.timeEnd(`[${shortId}] initial upsert`)
            if (!project) {
                throw new Error('Project not created')
            }
            if (!org) {
                throw new Error('Org not found')
            }
            let needsToBuy = (() => {
                if (
                    org.createdAt.getTime() <=
                    REACT_PLUGIN_PRICING_CHANGE.getTime()
                ) {
                    return !reactSub && components.length > freeComponents
                }
                return !reactSub
            })()

            if (needsToBuy) {
                throw new Response('Need subscription', {
                    status: 402,
                })
            }

            return await prisma.$transaction(async (tx) => {
                // First upsert the project

                // Delete all existing records
                console.time(`[${shortId}] delete existing`)
                await Promise.all([
                    tx.reactExportComponent.deleteMany({
                        where: { projectId },
                    }),
                    tx.reactExportColorStyle.deleteMany({
                        where: { projectId },
                    }),
                    tx.reactExportWebPage.deleteMany({
                        where: { projectId },
                    }),
                    tx.reactExportLocale.deleteMany({
                        where: { projectId },
                    }),
                    tx.reactExportComponentBreakpoint.deleteMany({
                        where: { projectId },
                    }),
                ])
                console.timeEnd(`[${shortId}] delete existing`)

                // Insert all new records
                console.time(`[${shortId}] insert new`)
                await Promise.all(
                    [
                        tx.reactExportComponent.createMany({
                            data: components.map((x) => ({ ...x, projectId })),
                        }),
                        tx.reactExportColorStyle.createMany({
                            data: colorStyles.map((x) => ({ ...x, projectId })),
                        }),
                        tx.reactExportLocale.createMany({
                            data: locales.map((x) => ({ ...x, projectId })),
                        }),
                        tx.reactExportWebPage.createMany({
                            data: pages.map((x) => ({ ...x, projectId })),
                        }),
                        tx.reactExportComponentBreakpoint.createMany({
                            data: breakpoints.map((x) => ({ ...x, projectId })),
                        }),
                    ].filter(Boolean),
                )
                console.timeEnd(`[${shortId}] insert new`)
                console.timeEnd(`[${shortId}] total upsert`)

                return { projectId }
            })
        },
        {
            body: z.object({
                components: z.array(z.custom<ReactExportComponent>()),
                breakpoints: z.array(
                    z.custom<ReactExportComponentBreakpoint>(),
                ),
                pages: z.array(z.custom<ReactExportWebPage>()).optional(),
                fullFramerProjectId: z.string().optional(),
                websiteUrl: z.string().optional(),
                locales: z.array(z.custom<ReactExportLocale>()).optional(),
                projectId: z.string(),
                projectName: z.string().optional().nullable(),
                colorStyles: z.array(z.custom<ReactExportColorStyle>()),
            }),
        },
    )

export async function recursiveReaddir(dir: string) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(
        dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name)
            return dirent.isDirectory() ? recursiveReaddir(res) : res
        }),
    )
    return files.flat()
}

async function getReactSub({ orgId, projectId }) {
    if (!projectId) {
        throw new Error('projectId missing, cannot get subscription')
    }
    return await prisma.subscription.findFirst({
        where: {
            orgId: orgId,
            status: {
                in: ['active', 'trialing'],
            },
            pluginName: 'reactExport',
            // metadata: {
            //     path: ['projectId'],
            //     equals: projectId,
            // },
        },
    })
}

async function getProject({ projectId }) {
    const [
        project,
        components,
        colorStyles,
        framerWebPages,
        locales,
        breakpoints,
    ] = await Promise.all([
        prisma.reactExportProject.findUnique({
            where: {
                // orgId,
                projectId,
            },
        }),
        prisma.reactExportComponent.findMany({
            where: {
                projectId,
            },
        }),
        prisma.reactExportColorStyle.findMany({
            where: {
                projectId,
            },
        }),
        prisma.reactExportWebPage.findMany({
            where: {
                projectId,
            },
        }),
        prisma.reactExportLocale.findMany({
            where: {
                projectId,
            },
        }),
        prisma.reactExportComponentBreakpoint.findMany({
            where: {
                projectId,
            },
        }),
    ])

    if (!project) {
        throw new Response(`Project with id ${projectId} not found`, {
            status: 404,
        })
    }

    return {
        project,
        components: components
            .filter((x) => x?.url && x?.id)
            .map((c) => ({
                ...c,
                url: c.url?.split('@')[0],
            })),
        framerWebPages: framerWebPages.filter((x) => x.webPageId && x.path),
        colorStyles,
        locales: locales.map(({ projectId, ...rest }) => rest),
        breakpoints: breakpoints.map(({ projectId, ...rest }) => rest),
    }
}
