import fs from 'fs'
import path from 'path'
import { Spiceflow } from 'spiceflow'

import {
    prisma,
    ReactExportColorStyle,
    ReactExportComponent,
    ReactExportLocale,
    ReactExportWebPage,
} from 'db/prisma'
import { z } from 'zod'
import { Sema } from 'async-sema'
import { deduplicateByKey } from 'website/src/lib/utils'
import Stripe from 'stripe'
import { env } from 'website/src/lib/env'

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
            // const orgId = store.orgId
            // if (!orgId) {
            //     throw unauthorizedResponse
            // }

            const [project, components, colorStyles, framerWebPages, locales] =
                await Promise.all([
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
                framerWebPages: framerWebPages.filter(
                    (x) => x.webPageId && x.path,
                ),
                colorStyles,
                locales: locales.map(({ projectId, ...rest }) => rest),
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
            const [project, reactSub] = await Promise.all([
                prisma.reactExportProject.upsert({
                    where: {
                        orgId,
                        projectId,
                    },
                    create: {
                        orgId,
                        projectId,
                        projectName,
                        fullFramerProjectId,
                    },
                    update: {
                        projectId,
                        projectName,
                        fullFramerProjectId,
                    },
                }),
                getReactSub({ orgId, projectId }),
            ])
            console.timeEnd(`[${shortId}] initial upsert`)
            if (!project) {
                throw new Error('Project not found')
            }

            if (components.length > freeComponents && !reactSub) {
                throw new Response(
                    'You have reached the free limit of components',
                    {
                        status: 402,
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
                    tx.reactExportLocale.deleteMany({
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
                pages: z.array(z.custom<ReactExportWebPage>()).optional(),
                fullFramerProjectId: z.string().optional(),
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
            metadata: {
                path: ['projectId'],
                equals: projectId,
            },
        },
    })
}
