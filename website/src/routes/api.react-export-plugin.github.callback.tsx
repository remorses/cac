import { prisma } from 'db'
import { OAuthApp, Octokit } from 'octokit'
import {
    data,
    href,
    redirect,
    type LoaderFunctionArgs,
} from 'react-router'
import { env } from 'website/src/lib/env'
import { addUnframerGithubCollaboratorIfNeeded } from 'website/src/lib/github.server'
import { generateUnframerRepo } from 'website/src/lib/unframer-github-repos'
import { safeJsonParse } from 'website/src/lib/utils'
import { useEffect, useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useLoaderData } from 'react-router'

export type GithubState = {
    next?: string
    projectId?: string
}

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const query = url.searchParams
    const stateStr = query.get('state') || ''
    const state: GithubState | null = safeJsonParse(
        decodeURIComponent(stateStr),
    )

    if (!state?.projectId) {
        throw new Response('Missing projectId in state', { status: 400 })
    }

    const code = query.get('code')
    if (!code) {
        throw new Response('Missing code', { status: 400 })
    }

    // Exchange code for access token
    const app = new OAuthApp({
        clientId: env.GITHUB_COLLABORATORS_EXPORT_CLIENT_ID!,
        clientSecret: env.GITHUB_COLLABORATORS_EXPORT_CLIENT_SECRET!,
    })
    const tokenRes = await app.createToken({
        code,
        state: stateStr,
        redirectUrl: new URL(
            href('/api/react-export-plugin/github/callback'),
            env.PUBLIC_URL,
        ).href,
    })

    const token = tokenRes.authentication.token

    // Get user info using the token
    const octokit = new Octokit({ auth: token })
    const { data: user } = await octokit.rest.users.getAuthenticated()

    // Get project details
    const project = await prisma.reactExportProject.findUnique({
        where: { projectId: state.projectId },
    })

    if (!project) {
        throw new Response('Project not found', { status: 404 })
    }

    if (project.connectedGitHubRepoName) {
        const existingRepoUrl = `https://github.com/unframer/${project.connectedGitHubRepoName}`
        console.log(
            `Project ${state.projectId} already has connected repo: ${existingRepoUrl}`,
        )
        const repo = project.connectedGitHubRepoName

        await Promise.all([
            addUnframerGithubCollaboratorIfNeeded({
                addCollaboratorUsername: user.login,
                owner: 'unframer',
                repo,
                projectId: project.projectId,
            }),
            prisma.reactExportProject.update({
                where: { projectId: state.projectId },
                data: {
                    connectedGitHubRepoAt: new Date(),
                },
            })
        ])
        
        console.log(
            `Connected project ${state.projectId} to GitHub repo: ${repo}`,
        )

        throw redirect(existingRepoUrl)
    }

    // Only return promise for slow repo creation
    const promise = generateUnframerRepo({
        projectId: state.projectId,
        projectTitle: project.projectName || 'Untitled',
        addCollaboratorUsername: user.login,
        useAI: false,
    }).then(async (repoData) => {
        if (!repoData) {
            throw new Error('Failed to create repository')
        }
        
        const { url: repoUrl, repoName: repo } = repoData

        if (repo) {
            await prisma.reactExportProject.update({
                where: { projectId: state.projectId },
                data: {
                    connectedGitHubRepoAt: new Date(),
                },
            })
            console.log(
                `Connected project ${state.projectId} to GitHub repo: ${repo}`,
            )
        }

        return { url: repoUrl }
    })

    return data({ promise })
}

export default function Component() {
    const { promise } = useLoaderData<typeof loader>()
    const [error, setError] = useState('')

    useEffect(() => {
        promise.then(({ url }) => {
            window.location.replace(url)
        }).catch((e) => {
            setError(e.message)
        })
    }, [promise])

    if (error) {
        return (
            <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
                <p className='text-red-600'>Error: {error}</p>
            </div>
        )
    }
    
    return (
        <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
            <Loader2Icon className='h-8 w-8 animate-spin' />
            <p>Creating GitHub repository...</p>
        </div>
    )
}
