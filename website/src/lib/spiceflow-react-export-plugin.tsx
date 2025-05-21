import fs from 'fs'
import { Evt } from 'evt'

import { on, EventEmitter } from 'events'
import { TransformStream } from 'stream/web'
import path from 'path'
import { Spiceflow } from 'spiceflow'

import {
    Prisma,
    prisma,
    ReactExportColorStyle,
    ReactExportComponent,
    ReactExportComponentInstance,
    ReactExportLocale,
    ReactExportWebPage,
    type ReactExportComponentBreakpoint,
} from 'db'
import { z } from 'zod'
import { Sema } from 'async-sema'
import { deduplicateByKey, isTruthy } from 'website/src/lib/utils'
import Stripe from 'stripe'
import {
    env,
    REACT_PLUGIN_PRICING_CHANGE,
    reactExportVariants,
    reactExportStatusErrors,
} from 'website/src/lib/env'
import { X } from 'lucide-react'
import type { url } from 'inspector'
import { email } from 'zod/v4'
import { status } from 'nprogress'

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

export const componentObjectSchema = z.object({
    name: z.string(),
    url: z.string(),
})

export const freeComponents = 10

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {})

export type ComponentObject = z.infer<typeof componentObjectSchema>

type FramerEvent = { type: 'change'; components: ReactExportComponent[] }

let projectsEvents = new Map<string, Evt<FramerEvent>>()

export const reactPluginApp = new Spiceflow({
    basePath: '/reactExportPlugin',
})
    .state('orgId', Promise.resolve(''))
    .state('userId', Promise.resolve(''))
    .state('userEmail', Promise.resolve(''))

    .use(async function uselessThing({ request, state: store }) {
        const pathname = new URL(request.url).pathname
        if (!pathname.includes('/reactExportPlugin')) {
            return
        }
        // const orgId = await store.orgId
        // if (!orgId) {
        //     return
        // }
        // const userId = await store.userId
        // if (!userId) {
        //     return
        // }
    })
    .get('/health', () => {
        return 'ok'
    })
    .get(
        '/project/:projectId',
        async ({ params, state: store }) => {
            let { projectId } = params
            projectId = projectId.slice(0, 16)
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
            if (!(await store.orgId)) {
                throw unauthorizedResponse
            }
            const { projectId, forSubscriptionUpgrade } = query
            const activeSub = await getReactSub({
                orgId: await store.orgId,
                projectId,
            })

            let manageSubUrl: string | undefined
            // const activeSub = subs.find((sub) => sub)
            if (activeSub?.customerId) {
                const portalSession =
                    await stripe.billingPortal.sessions.create({
                        customer: activeSub.customerId,
                        flow_data: forSubscriptionUpgrade
                            ? {
                                  type: 'subscription_update',
                                  subscription_update: {
                                      subscription: activeSub.subscriptionId,
                                  },
                              }
                            : undefined,
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
                forSubscriptionUpgrade: z.boolean().optional(),
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
                framerUserId,
                componentInstances,
            } = body

            const shortId = projectId.slice(0, 4)
            console.time(`[${shortId}] total upsert`)

            pages = deduplicateByKey(pages || [], (p) => p.webPageId)
            components = deduplicateByKey(components, (c) => c.id)
            colorStyles = deduplicateByKey(colorStyles, (s) => s.id)

            const orgId = await store.orgId
            if (!orgId) {
                throw unauthorizedResponse
            }
            projectId = projectId.slice(0, 16)
            console.time(`[${shortId}] initial upsert`)
            console.log(`[${shortId}] upserting project for org ${orgId}`)
            const [existingProject, reactSub, org] = await Promise.all([
                prisma.reactExportProject.findFirst({
                    where: {
                        orgId,
                        projectId,
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

            if (!org) {
                throw new Error('Org not found')
            }
            let needsToBuy = (() => {
                if (reactSub) {
                    console.log(
                        `exporting components for user with sub ${JSON.stringify(reactSub)}`,
                    )
                }
                return !reactSub
            })()

            if (needsToBuy) {
                throw new Response(
                    JSON.stringify({
                        message: 'Need subscription',
                    }),
                    {
                        status: reactExportStatusErrors.SUB_NEEDED,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                )
            }

            const [upsertedProject, projectOrg, legacyUserForProject] =
                await Promise.all([
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
                            framerUserId,
                        },
                        update: {
                            projectId,
                            websiteUrl,
                            projectName,
                            fullFramerProjectId,
                            framerUserId,
                        },
                    }),
                    existingProject &&
                        prisma.org.findFirst({
                            where: {
                                orgId: existingProject.orgId,
                            },
                            include: {
                                users: { include: { user: true } },
                            },
                        }),
                    existingProject &&
                        prisma.users.findFirst({
                            where: {
                                id: existingProject.orgId,
                            },
                        }),
                ])
            if (!upsertedProject) {
                throw new Error('Project not created')
            }

            const projectEmail =
                projectOrg?.users?.[0]?.user?.email ||
                legacyUserForProject?.email ||
                ''
            if (existingProject && existingProject.orgId !== orgId) {
                const message = `Project belongs to another user, login with the project account ${email} first`
                console.log(message)
                throw Response.json(
                    {
                        message,
                        email: projectEmail,
                    },
                    {
                        status: reactExportStatusErrors.PROJECT_BELONGS_TO_ANOTHER_USER,
                    },
                )
            }

            const isPersonalSub = [
                reactExportVariants.personal.monthly,
                reactExportVariants.personal.yearly,
            ].includes(reactSub?.variantId || '')
            let needsBusinessSubscription =
                isPersonalSub &&
                existingProject?.framerUserId &&
                framerUserId &&
                framerUserId !== existingProject.framerUserId
            // needsBusinessSubscription = true
            if (needsBusinessSubscription) {
                throw Response.json(
                    {
                        message: 'Need business subscription',
                        email: projectEmail,
                    },
                    {
                        status: reactExportStatusErrors.SUB_UPGRADE_NECESSARY,
                    },
                )
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
                    // only delete locales if there are some, so users can use locales created in my database manually
                    locales?.length &&
                        tx.reactExportLocale.deleteMany({
                            where: { projectId },
                        }),
                    tx.reactExportComponentBreakpoint.deleteMany({
                        where: { projectId },
                    }),
                    tx.reactExportComponentInstance.deleteMany({
                        where: { projectId },
                    }),
                ])
                console.timeEnd(`[${shortId}] delete existing`)

                const validComponents = new Set(components.map((x) => x.id))
                const validPages = new Set(pages.map((x) => x.webPageId))
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
                            data:
                                breakpoints
                                    ?.filter(
                                        (x) =>
                                            x.breakpointName &&
                                            x.width &&
                                            x.componentId &&
                                            x.variantId,
                                    )
                                    .map((x) => ({ ...x, projectId })) || [],
                        }),
                        componentInstances?.length &&
                            tx.reactExportComponentInstance.createMany({
                                data:
                                    componentInstances
                                        .filter(isTruthy)
                                        ?.filter(
                                            (x) =>
                                                x.projectId &&
                                                x.componentId &&
                                                x.controls &&
                                                x.webPageId,
                                        )
                                        .filter((x) => {
                                            if (
                                                !x.projectId ||
                                                !x.componentId ||
                                                !x.webPageId
                                            ) {
                                                console.log(
                                                    `[${shortId}] Skipping instance with missing required field:`,
                                                    {
                                                        projectId: x.projectId,
                                                        componentId:
                                                            x.componentId,
                                                        webPageId: x.webPageId,
                                                    },
                                                )
                                                return false
                                            }

                                            if (
                                                !validComponents.has(
                                                    x.componentId,
                                                )
                                            ) {
                                                console.log(
                                                    `[${shortId}] Skipping instance with non-existent componentId:`,
                                                    x.componentId,
                                                )
                                                return false
                                            }

                                            if (!validPages.has(x.webPageId)) {
                                                console.log(
                                                    `[${shortId}] Skipping instance with non-existent webPageId:`,
                                                    x.webPageId,
                                                )
                                                return false
                                            }

                                            return true
                                        })

                                        .map((x) => ({ ...x, projectId })) ||
                                    [],
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
                breakpoints: z
                    .array(z.custom<ReactExportComponentBreakpoint>())
                    .optional(),
                pages: z.array(z.custom<ReactExportWebPage>()).optional(),
                fullFramerProjectId: z.string().optional(),
                websiteUrl: z.string().optional(),
                locales: z.array(z.custom<ReactExportLocale>()).optional(),
                projectId: z.string(),
                projectName: z.string().optional().nullable(),
                colorStyles: z.array(z.custom<ReactExportColorStyle>()),
                framerUserId: z.string().optional(),
                componentInstances: z
                    .array(
                        z.custom<Prisma.ReactExportComponentInstanceUncheckedCreateInput>(),
                    )
                    .optional(),
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
    // if (!projectId) {
    //     throw new Error('projectId missing, cannot get subscription')
    // }
    return await prisma.subscription.findFirst({
        where: {
            orgId: orgId,
            status: {
                in: ['active', 'trialing', 'on_trial'],
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
