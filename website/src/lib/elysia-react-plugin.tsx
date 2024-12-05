import fs from 'fs'
import crypto from 'crypto'
import GithubSlugger from 'github-slugger'
import path from 'path'
import { Sema } from 'sema4'
import { Spiceflow } from 'spiceflow'
import { bundle } from 'unframer-workspace/dist/exporter'

import { prisma, ReactExportColorStyle, ReactExportComponent } from 'db/prisma'
import dedent from 'dedent'
import { Octokit } from 'octokit'
import { env } from 'website/src/lib/env'
import {
    createNewRepo,
    doesRepoExist,
    getGithubUserLogin,
    getOctokit,
    getRepoFiles,
    githubPathToPageSlug,
    isMarkdown,
    upsertGithubFile,
} from 'website/src/lib/github.server'
import { generateSecurePassword, sortByKey } from 'website/src/lib/utils'
import { z } from 'zod'
import { ReactExportProject } from 'db/kysely.types'

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

            const [project, components, colorStyles] = await Promise.all([
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
            ])

            if (!project) {
                return new Response(`Project with id ${projectId} not found`, {
                    status: 404,
                })
            }

            return {
                project,
                components,
                colorStyles,
            }
        },
        {},
    )

    .post(
        '/upsertProject',
        async ({ request, state: store }) => {
            const body = await request.json()
            let { colorStyles, components, projectId, projectName = '' } = body
            const orgId = store.orgId
            if (!orgId) {
                throw unauthorizedResponse
            }
            projectId = projectId.slice(0, 16)

            const [project] = await Promise.all([
                prisma.reactExportProject.upsert({
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
                }),
                prisma.reactExportComponent.deleteMany({
                    where: {
                        OR: [
                            { projectId },
                            { id: { in: components.map((c) => c.id) } },
                        ],
                    },
                }),
                prisma.reactExportColorStyle.deleteMany({
                    where: {
                        OR: [
                            { projectId, project: { orgId } },
                            { id: { in: colorStyles.map((c) => c.id) } },
                        ],
                    },
                }),
            ])
            await Promise.all([
                prisma.reactExportComponent.createMany({
                    data: components.map((x) => ({
                        ...x,
                        projectId,
                    })),
                }),
                prisma.reactExportColorStyle.createMany({
                    data: colorStyles.map((x) => ({
                        ...x,
                        projectId,
                    })),
                }),
            ])

            return { projectId }
        },
        {
            body: z.object({
                components: z.array(z.custom<ReactExportComponent>()),
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
