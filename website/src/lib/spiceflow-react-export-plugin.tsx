import * as fs from 'fs'

import * as path from 'path'
import { Spiceflow } from 'spiceflow'

import {
    Prisma,
    prisma,
    ReactExportColorStyle,
    ReactExportComponent,
    ReactExportLocale,
    ReactExportWebPage,
    type ReactExportComponentBreakpoint,
} from 'db'
import { marked } from 'marked'
import { href } from 'react-router'
import dedent from 'string-dedent'
import Stripe from 'stripe'
import {
    env,
    getBuyReactExportPluginUrl,
    reactExportStatusErrors,
    reactExportVariants,
} from 'website/src/lib/env'
import { AppError, notifyError } from 'website/src/lib/errors'
import { qstash } from 'website/src/lib/qstash'
import { defaultResendOptions, resend } from 'website/src/lib/resend'
import { deduplicateByKey, isTruthy } from 'website/src/lib/utils'
import { z, ZodType } from 'zod'
import { email } from 'zod/v4'
import { generateUnframerRepo } from './unframer-github-repos'

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
        async ({ params, state: store, request }) => {
            let { projectId } = params
            projectId = projectId.slice(0, 16)
            const agent = request.headers.get('X-Agent') || ''

            const project = await getProject({ projectId })

            // Only check subscription for CLI usage
            if (agent === 'cli' && project.project?.orgId) {
                const shouldSkipSubscriptionCheck = Boolean(
                    project.ownerEmail?.toLowerCase().endsWith('@framer.com'),
                )
                if (!shouldSkipSubscriptionCheck) {
                    const orgSubscription = await getReactSub({
                        orgId: project.project.orgId,
                    })
                    if (!orgSubscription) {
                        const buyUrl = getBuyReactExportPluginUrl({
                            orgId: project.project.orgId,
                            email: project.ownerEmail || '',
                            projectId,
                        })
                        const message = `No active React Export subscription found. To export components and use the React Export plugin, please purchase a subscription at: ${buyUrl}`
                        throw new Response(
                            JSON.stringify({
                                message,
                                buyUrl,
                            }),
                            {
                                status: reactExportStatusErrors.SUB_NEEDED,
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            },
                        )
                    }
                }
            }

            return project
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
            })

            // If no active subscription, try to find any subscription (including inactive ones)
            let anySubscription = activeSub
            if (!activeSub) {
                anySubscription = await prisma.subscription.findFirst({
                    where: {
                        orgId: await store.orgId,
                        pluginName: 'reactExport',
                        status: {
                            notIn: ['canceled', 'incomplete_expired', 'unpaid'],
                        },
                    },
                    orderBy: {
                        createdAt: 'desc', // Get the most recent subscription
                    },
                })
            }

            let manageSubUrl: string | undefined
            // Create manage URL for any subscription with a customerId (active or inactive)
            if (anySubscription?.customerId) {
                const portalSession =
                    await stripe.billingPortal.sessions.create({
                        customer: anySubscription.customerId,
                        flow_data: forSubscriptionUpgrade
                            ? {
                                  type: 'subscription_update',
                                  subscription_update: {
                                      subscription:
                                          anySubscription.subscriptionId,
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
                subscriptionStatus: anySubscription?.status,
            }
        },
        {
            query: z.object({
                projectId: z.string(),
                forSubscriptionUpgrade: z
                    .union([z.boolean(), z.string()])
                    .optional(),
            }),
        },
    )
    .post(
        // given this route is very slow, use an async generator so that Cloudflare does not return error 524
        '/upsertUnframerRepoWithAI',
        async function* upsertUnframerRepoWithAI({ request }) {
            const body = await request.json()

            yield {
                message: 'starting sync',
            }
            // Validate secret
            if (body.secret !== env.SECRET) {
                throw new AppError('Invalid secret')
            }

            // Get project to access projectName
            const projectForRepo = await prisma.reactExportProject.findFirst({
                where: { projectId: body.projectId },
            })

            // Call the generateUnframerRepo function
            const result = await generateUnframerRepo({
                projectId: body.projectId,
                projectTitle: projectForRepo?.projectName || undefined,
                useAI: true,
            })

            // Send email after repo is created
            const [project] = await Promise.all([
                prisma.reactExportProject.findFirst({
                    where: { projectId: body.projectId },
                    include: {
                        org: {
                            include: {
                                users: { include: { user: true } },
                            },
                        },
                    },
                }),
            ])
            if (!project) {
                console.log(
                    `cannot find project to send new email for new github project`,
                    project,
                )
                return {
                    success: false,
                    error: 'Project not found',
                }
            }

            let userEmail = project?.org?.users?.[0]?.user?.email || ''
            if (!userEmail) {
                const legacyUser = await prisma.users.findFirst({
                    where: {
                        id: project.orgId,
                    },
                })
                if (legacyUser) {
                    userEmail = legacyUser.email || ''
                }
            }
            if (!userEmail) {
                console.log(
                    `cannot find user email to send new email for new github project`,
                    project,
                )
                return Response.json({
                    success: false,
                    error: 'User email not found',
                })
            }

            if (!body.sendEmail) {
                return {
                    success: true,
                }
            }

            const projectId = project.projectId
            const projectName = project.projectName || 'without name'

            if (project.creationReason === 'MCP_FIRST_OPEN') {
                if (userEmail.endsWith('@framer.com')) {
                    console.log(
                        `Skipping MCP first-open email for Framer team member: ${userEmail}`,
                    )
                    return {
                        success: true,
                    }
                }

                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                if (project.createdAt < twentyFourHoursAgo) {
                    console.log(
                        `Skipping MCP first-open email, project created more than 24h ago: ${userEmail}`,
                    )
                    return {
                        success: true,
                    }
                }

                const mcpProjectCount = await prisma.reactExportProject.count({
                    where: {
                        orgId: project.orgId,
                        creationReason: 'MCP_FIRST_OPEN',
                    },
                })

                if (mcpProjectCount !== 1) {
                    console.log(
                        `Skipping MCP first-open email, user has ${mcpProjectCount} MCP projects: ${userEmail}`,
                    )
                    return {
                        success: true,
                    }
                }

                const emailContent = await createMcpFirstOpenEmail({
                    projectName,
                })

                const idempotencyKey = `mcp-first-open/${project.orgId}/${userEmail}`

                const res = await resend.emails.send(
                    {
                        ...defaultResendOptions,
                        to: [userEmail],
                        tags: [
                            { name: 'category', value: 'mcp-first-open' },
                            { name: 'project', value: projectId },
                        ],
                        subject: emailContent.subject,
                        html: emailContent.html,
                    },
                    {
                        idempotencyKey,
                    },
                )

                console.log(
                    `MCP first-open email sent successfully to ${userEmail} for project ${projectId}:`,
                    res,
                )

                return {
                    success: true,
                    result: res,
                }
            }

            if (project.creationReason !== 'USER_REQUESTED') {
                console.log(
                    `Skipping email for project ${project.projectId} with creationReason: ${project.creationReason}`,
                )
                return {
                    success: true,
                }
            }

            const emailContent = await createGithubSetupEmail({
                projectId,
                userEmail,
                projectName,
            })

            const idempotencyKey = `github-new-repo-created/${projectId}/${userEmail}`

            const res = await resend.emails.send(
                {
                    ...defaultResendOptions,
                    to: [userEmail],
                    tags: [
                        { name: 'category', value: 'github-setup' },
                        { name: 'project', value: projectId },
                    ],
                    subject: emailContent.subject,
                    html: emailContent.html,
                },
                {
                    idempotencyKey,
                },
            )

            console.log(
                `Email sent successfully to ${userEmail} for project ${projectId}:`,
                res,
            )

            yield {
                success: true,
                result: res,
            }
        },
        {
            body: z.object({
                secret: z.string(),
                sendEmail: z.boolean().optional(),
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
                framerUserId,
                componentInstances,
                pageBackgroundColor,
                creationReason = 'USER_REQUESTED',
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
                        projectId,
                    },
                    include: {
                        org: {
                            include: {
                                users: { include: { user: true } },
                            },
                        },
                    },
                }),
                getReactSub({ orgId }),
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

            const isNewProject = !existingProject
            let userEmail = await store.userEmail
            let needsToBuy = (() => {
                if (reactSub) {
                    console.log(
                        `exporting components for user with sub ${JSON.stringify(reactSub)}`,
                    )
                }

                if (userEmail.endsWith('@framer.com')) {
                    return false
                }
                return !reactSub
            })()
            let projectEmail =
                existingProject?.org?.users?.[0]?.user?.email || ''
            if (existingProject && existingProject.orgId !== orgId) {
                if (!projectEmail) {
                    // get user with the project orgId
                    const legacyUserPerOrg = await prisma.users.findFirst({
                        where: {
                            id: existingProject.orgId,
                        },
                    })
                    projectEmail = legacyUserPerOrg?.email || ''
                }
                const message = `This Framer project belongs to another user account (${projectEmail}). Please log out and log in with the correct account to access this project. If you need to transfer ownership, please contact support.`

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
            const [upsertedProject] = await Promise.all([
                prisma.reactExportProject.upsert({
                    where: {
                        projectId,
                    },
                    create: {
                        orgId,
                        projectId,
                        websiteUrl,
                        projectName,
                        fullFramerProjectId,
                        framerUserId,
                        pageBackgroundColor,
                        creationReason,
                    },
                    update: {
                        websiteUrl,
                        projectName,

                        fullFramerProjectId,
                        framerUserId,
                        pageBackgroundColor,
                    },
                }),
            ])
            if (!upsertedProject) {
                throw new Error('Project not created')
            }

            console.log(
                `creating ${components.length} components for project ${upsertedProject.projectId}`,
            )
            await prisma.$transaction([
                prisma.reactExportColorStyle.deleteMany({
                    where: { projectId },
                }),
                prisma.reactExportComponent.deleteMany({
                    where: { projectId },
                }),
                prisma.reactExportWebPage.deleteMany({
                    where: { projectId },
                }),
                // only delete locales if there are some, so users can use locales created in my database manually
                ...(locales?.length
                    ? [
                          prisma.reactExportLocale.deleteMany({
                              where: { projectId },
                          }),
                      ]
                    : []),
                prisma.reactExportComponentBreakpoint.deleteMany({
                    where: { projectId },
                }),
                prisma.reactExportComponentInstance.deleteMany({
                    where: { projectId },
                }),
                // Insert all new records
                prisma.reactExportComponent.createMany({
                    data: components.map((x) => ({ ...x, projectId })),
                }),
                prisma.reactExportColorStyle.createMany({
                    data: colorStyles.map((x) => ({ ...x, projectId })),
                }),
                prisma.reactExportLocale.createMany({
                    data: locales.map((x) => ({ ...x, projectId })),
                }),
                prisma.reactExportWebPage.createMany({
                    data: pages.map((x) => ({ ...x, projectId })),
                }),
                prisma.reactExportComponentBreakpoint.createMany({
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
                ...(componentInstances?.length
                    ? [
                          prisma.reactExportComponentInstance.createMany({
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

                                          const validComponents = new Set(
                                              components.map((x) => x.id),
                                          )
                                          const validPages = new Set(
                                              pages.map((x) => x.webPageId),
                                          )

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
                                      .map((x) => ({
                                          ...x,
                                          projectId,
                                          styles: (x.styles ?? {}) as Prisma.InputJsonValue,
                                      })) || [],
                          }),
                      ]
                    : []),
            ])
            console.timeEnd(`[${shortId}] insert new`)
            console.timeEnd(`[${shortId}] total upsert`)

            if (components.length) {
                await qstash
                    .publishJSON({
                        url: new URL(
                            '/api/plugins/reactExportPlugin/upsertUnframerRepoWithAI',
                            env.PUBLIC_URL,
                        ).toString(),
                        body: {
                            secret: env.SECRET,
                            sendEmail: isNewProject,
                            projectId: upsertedProject.projectId,
                        },
                        timeout: 900,
                        flowControl: {
                            parallelism: 1,
                            key: `sync-${upsertedProject.projectId}`,
                        },
                    })
                    .catch((error) => {
                        notifyError(error, 'Error queuing repo AI task')
                    })

                console.log(
                    `Scheduled repo generation for project ${projectId}`,
                )
            }

            if (needsToBuy) {
                const buyUrl = getBuyReactExportPluginUrl({
                    orgId,
                    email: userEmail,
                    projectId,
                })
                throw new Response(
                    JSON.stringify({
                        message: `No active React Export subscription found. To export components and use the React Export plugin, please purchase a subscription at: ${buyUrl}`,
                        buyUrl,
                    }),
                    {
                        status: reactExportStatusErrors.SUB_NEEDED,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                )
            }

            const isPersonalSub = [
                reactExportVariants.personal.monthly,
                reactExportVariants.personal.yearly,
            ].includes(reactSub?.variantId || '')
            let needsBusinessSubscription =
                !userEmail?.endsWith('@framer.com') &&
                isPersonalSub &&
                existingProject?.framerUserId &&
                framerUserId &&
                framerUserId !== existingProject.framerUserId
            // needsBusinessSubscription = true
            if (needsBusinessSubscription) {
                const upgradeUrl = getBuyReactExportPluginUrl({
                    orgId,
                    email: userEmail,
                    projectId,
                })
                throw Response.json(
                    {
                        message: `Your current Personal subscription doesn't support multiple Framer users. This project was created by Framer user "${existingProject?.framerUserId}" but you're trying to export as Framer user "${framerUserId}". The project owner's email is: ${projectEmail || 'unknown'}. Your current email is: ${userEmail}. Please upgrade to a Business subscription to collaborate with other team members. Upgrade at: ${upgradeUrl}`,
                        email: projectEmail,
                        currentEmail: userEmail,
                        projectOwnerFramerId: existingProject?.framerUserId,
                        currentFramerId: framerUserId,
                        upgradeUrl,
                    },
                    {
                        status: reactExportStatusErrors.SUB_UPGRADE_NECESSARY,
                    },
                )
            }

            return { projectId }
        },
        {
            body: z.object({
                components: z.array(z.any() as ZodType<ReactExportComponent>),
                breakpoints: z
                    .array(z.any() as ZodType<ReactExportComponentBreakpoint>)
                    .optional(),
                pages: z
                    .array(z.any() as ZodType<ReactExportWebPage>)
                    .optional(),
                fullFramerProjectId: z.string().optional(),
                websiteUrl: z.string().optional(),
                locales: z
                    .array(z.any() as ZodType<ReactExportLocale>)
                    .optional(),
                projectId: z.string(),
                projectName: z.string().optional().nullable(),
                colorStyles: z.array(z.any() as ZodType<ReactExportColorStyle>),
                framerUserId: z.string().optional(),
                pageBackgroundColor: z.string().optional(),
                componentInstances: z
                    .array(
                        z.any() as ZodType<Prisma.ReactExportComponentInstanceUncheckedCreateInput>,
                    )
                    .optional(),
                creationReason: z
                    .enum(['USER_REQUESTED', 'MCP_FIRST_OPEN'])
                    .optional(),
            }),
        },
    )
    .onError((error) => {
        notifyError(error, 'react export api')
    })

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

export async function getReactSub({ orgId }) {
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
        projectWithOrg,
        components,
        colorStyles,
        framerWebPages,
        locales,
        breakpoints,
        componentInstances,
    ] = await Promise.all([
        prisma.reactExportProject.findUnique({
            where: { projectId },
            include: {
                org: {
                    include: {
                        users: { include: { user: true } },
                    },
                },
            },
        }),
        prisma.reactExportComponent.findMany({ where: { projectId } }),
        prisma.reactExportColorStyle.findMany({ where: { projectId } }),
        prisma.reactExportWebPage.findMany({ where: { projectId } }),
        prisma.reactExportLocale.findMany({ where: { projectId } }),
        prisma.reactExportComponentBreakpoint.findMany({
            where: { projectId },
        }),
        prisma.reactExportComponentInstance.findMany({ where: { projectId } }),
    ])

    if (!projectWithOrg) {
        throw new Response(
            `Project with id ${projectId} not found. Please ensure you've exported components from Framer first.`,
            { status: 404 },
        )
    }

    // Get owner email - first try org users, then fall back to legacy user lookup
    let ownerEmail = projectWithOrg.org?.users?.[0]?.user?.email || ''
    if (!ownerEmail && projectWithOrg.orgId) {
        // Legacy user lookup
        const legacyUser = await prisma.users.findFirst({
            where: {
                id: projectWithOrg.orgId,
            },
        })
        ownerEmail = legacyUser?.email || ''
    }

    return {
        project: projectWithOrg,
        ownerEmail,
        components: components
            .filter((x) => x?.url && x?.id)
            .map((c) => ({ ...c, url: c.url?.split('@')[0] })),
        framerWebPages: framerWebPages.filter((x) => x.webPageId && x.path),
        colorStyles,
        locales: locales.map(({ projectId, ...rest }) => rest),
        breakpoints: breakpoints.map(({ projectId, ...rest }) => rest),
        componentInstances: componentInstances.map(
            ({ projectId, ...rest }) => rest,
        ),
    }
}

export async function createMcpFirstOpenEmail({
    projectName,
}: {
    projectName: string
}) {
    const markdown = dedent`
    Hey,

    I saw you tried the Framer MCP. Have you checked out the React Export feature yet?

    You can export your project "${projectName}" components as React code and use them in any codebase. Then deploy in platforms like AWS, Vercel, Cloudflare or anywhere else.

    I can setup an example GitHub repo with your components code, can I send you the url?

    Cheers,
    Tommy, author of the MCP plugin
    `

    return {
        subject: 'Export Framer components as React?',
        html: await marked.parse(markdown),
    }
}

export async function createGithubSetupEmail({
    projectId,
    userEmail,
    projectName,
}: {
    projectId: string
    userEmail: string
    projectName: string
}) {
    const githubUrl = new URL(
        href(`/api/react-export-plugin/github/repo/:projectId`, {
            projectId,
        }),
        env.PUBLIC_URL,
    )

    const markdown = dedent`
    Hey, thanks for trying the React Export plugin!

    I just created an example GitHub repo with your Framer components in "${projectName}".

    The repo includes:
    - Example code showing how to integrate the React components
    - Live preview URL (link in the README)

    Get access to the repo [here](${githubUrl.toString()})

    Any questions? Reply to this email, I read all the replies

    Tommy
    `

    return {
        subject: 'Your Framer components code is ready',
        html: await marked.parse(markdown),
    }
}
