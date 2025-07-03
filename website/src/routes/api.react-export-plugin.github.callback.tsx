import { prisma } from 'db'
import { OAuthApp, Octokit } from 'octokit'
import { useEffect, useRef } from 'react'
import {
  data,
  Form,
  href,
  redirect,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { env } from 'website/src/lib/env'
import { addUnframerGithubCollaboratorIfNeeded } from 'website/src/lib/github.server'
import { generateUnframerRepo } from 'website/src/lib/unframer-github-repos'
import { safeJsonParse } from 'website/src/lib/utils'

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

    // Get project details
    const project = await prisma.reactExportProject.findUnique({
        where: { projectId: state.projectId },
    })

    if (!project) {
        throw new Response('Project not found', { status: 404 })
    }

    return data({
        projectName: project.projectName || 'Untitled',
    })
}

export async function action({ request }: ActionFunctionArgs) {
    const url = new URL(request.url)
    const query = url.searchParams
    console.log(query)
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

        await addUnframerGithubCollaboratorIfNeeded({
            addCollaboratorUsername: user.login,
            owner: 'unframer',
            repo,
        })
        throw redirect(existingRepoUrl)
    }
    const { url: repoUrl, repoName } = await generateUnframerRepo({
        projectId: state.projectId,
        projectTitle: project.projectName || 'Untitled',
        addCollaboratorUsername: user.login,
        useAI: false,
    })

    // Save repo connection to database
    if (repoName) {
        await prisma.reactExportProject.update({
            where: { projectId: state.projectId },
            data: {
                connectedGitHubRepoName: repoName,
                invitedGitHubRepoUsername: user.login,
                connectedGitHubRepoAt: new Date(),
            },
        })
        console.log(
            `Connected project ${state.projectId} to GitHub repo: ${repoName}`,
        )
    }

    return redirect(repoUrl)
}

export default function Component() {
    const { projectName } = useLoaderData<typeof loader>() || {}
    const navigation = useNavigation()
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (formRef.current) {
            formRef.current.submit()
        }
    }, [])

    return (
        <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>

            <Form ref={formRef} method='post' style={{ display: 'none' }} />
        </div>
    )
}
