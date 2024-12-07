import fs from 'fs'
import path from 'path'
import { Spiceflow } from 'spiceflow'

import {
    prisma,
    ReactExportColorStyle,
    ReactExportComponent,
    ReactExportWebPage,
} from 'db/prisma'
import { z } from 'zod'
import { Sema } from 'async-sema'

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

export const componentObjectSchema = z.object({
    name: z.string(),
    url: z.string(),
})

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

            const [project, components, colorStyles, framerWebPages] =
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
            }
        },
        {},
    )

    .post(
        '/upsertProject',
        async ({ request, state: store }) => {
            const body = await request.json()
            let {
                colorStyles,
                pages,
                components,
                projectId,
                projectName = '',
            } = body
            const orgId = store.orgId
            if (!orgId) {
                throw unauthorizedResponse
            }
            projectId = projectId.slice(0, 16)

            // First upsert the project
            const project = await prisma.reactExportProject.upsert({
                where: {
                    orgId,
                    projectId,
                },
                create: {
                    orgId,
                    projectId,
                    projectName,
                },
                update: {
                    projectId,
                    projectName,
                },
            })
            if (!project) {
                throw new Error('Project not found')
            }
            // Get existing records and handle components, color styles and pages
            const [existingComponents, existingColorStyles, existingPages] =
                await Promise.all([
                    prisma.reactExportComponent.findMany({
                        where: { projectId },
                        select: { id: true },
                    }),
                    prisma.reactExportColorStyle.findMany({
                        where: { projectId },
                        select: { id: true },
                    }),
                    prisma.reactExportWebPage.findMany({
                        where: { projectId },
                        select: { webPageId: true },
                    }),
                ])

            await Promise.all([
                // Handle components
                prisma.reactExportComponent.createMany({
                    data: components
                        .filter(
                            (c) =>
                                !existingComponents.some(
                                    (ec) => ec.id === c.id,
                                ),
                        )
                        .map((x) => ({ ...x, projectId })),
                }),
                prisma.reactExportComponent.deleteMany({
                    where: {
                        id: {
                            in: existingComponents
                                .filter(
                                    (ec) =>
                                        !components.some((c) => c.id === ec.id),
                                )
                                .map((c) => c.id),
                        },
                    },
                }),

                // Handle color styles
                prisma.reactExportColorStyle.createMany({
                    data: colorStyles
                        .filter(
                            (c) =>
                                !existingColorStyles.some(
                                    (ec) => ec.id === c.id,
                                ),
                        )
                        .map((x) => ({ ...x, projectId })),
                }),
                prisma.reactExportColorStyle.deleteMany({
                    where: {
                        id: {
                            in: existingColorStyles
                                .filter(
                                    (ec) =>
                                        !colorStyles.some(
                                            (c) => c.id === ec.id,
                                        ),
                                )
                                .map((c) => c.id),
                        },
                    },
                }),

                // Handle pages
                prisma.reactExportWebPage.createMany({
                    data: pages
                        .filter(
                            (p) =>
                                !existingPages.some(
                                    (ep) => ep.webPageId === p.webPageId,
                                ),
                        )
                        .map((x) => ({ ...x, projectId })),
                }),
                prisma.reactExportWebPage.deleteMany({
                    where: {
                        webPageId: {
                            in: existingPages
                                .filter(
                                    (ep) =>
                                        !pages.some(
                                            (p) => p.webPageId === ep.webPageId,
                                        ),
                                )
                                .map((p) => p.webPageId),
                        },
                    },
                }),
            ])

            // Update existing components and pages in parallel with rate limiting
            const sema = new Sema(10) // Limit concurrent updates
            await Promise.all([
                ...components
                    .filter((component) =>
                        existingComponents.some((ec) => ec.id === component.id),
                    )
                    .map(async (component) => {
                        await sema.acquire()
                        try {
                            await prisma.reactExportComponent.update({
                                where: { id: component.id },
                                data: { ...component, projectId },
                            })
                        } finally {
                            sema.release()
                        }
                    }),
                ...pages
                    .filter((page) =>
                        existingPages.some(
                            (ep) => ep.webPageId === page.webPageId,
                        ),
                    )
                    .map(async (page) => {
                        await sema.acquire()
                        try {
                            await prisma.reactExportWebPage.update({
                                where: { webPageId: page.webPageId },
                                data: { ...page, projectId },
                            })
                        } finally {
                            sema.release()
                        }
                    }),
                ...colorStyles
                    .filter((style) =>
                        existingColorStyles.some((es) => es.id === style.id),
                    )
                    .map(async (style) => {
                        await sema.acquire()
                        try {
                            await prisma.reactExportColorStyle.update({
                                where: { id: style.id },
                                data: { ...style, projectId },
                            })
                        } finally {
                            sema.release()
                        }
                    }),
            ])

            return { projectId }
        },
        {
            body: z.object({
                components: z.array(z.custom<ReactExportComponent>()),
                pages: z.array(z.custom<ReactExportWebPage>()),
                projectId: z.string(),
                projectName: z.string().optional(),
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
