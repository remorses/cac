// https://localhost:8040/api/react-export-plugin/github/create-repo/cf755ed7d59e0319
import { redirect, type LoaderFunctionArgs, href } from 'react-router'
import { getGithubApp } from 'website/src/lib/github.server'
import { env } from 'website/src/lib/env'
import { prisma } from 'db'
import type { Route } from './+types/api.react-export-plugin.github.create-repo.$projectId'
import { OAuthApp } from 'octokit'

export type GithubState = {
    next?: string
    projectId?: string
}

export async function loader({ request, params }: Route.LoaderArgs) {
    const { projectId } = params
    const url = new URL(request.url)
    const next = url.searchParams.get('next') || `${env.PUBLIC_URL}/dashboard`

    // Check that project exists
    const project = await prisma.reactExportProject.findUnique({
        where: { projectId },
    })

    if (!project) {
        throw new Response('Project not found', { status: 404 })
    }

    const state: GithubState = {
        next,
        projectId,
    }

    const app = new OAuthApp({
        clientId: env.GITHUB_COLLABORATORS_EXPORT_CLIENT_ID!,
        clientSecret: env.GITHUB_COLLABORATORS_EXPORT_CLIENT_SECRET!,
    })
    const { url: authUrl } = app.getWebFlowAuthorizationUrl({
        state: encodeURIComponent(JSON.stringify(state)),
        redirectUrl: new URL(
            href('/api/react-export-plugin/github/callback'),
            env.PUBLIC_URL,
        ).href,
        allowSignup: true,
    })

    return redirect(authUrl)
}
