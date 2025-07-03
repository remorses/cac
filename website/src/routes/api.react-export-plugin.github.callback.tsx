import { redirect, type LoaderFunctionArgs, href } from 'react-router'
import { getGithubApp } from 'website/src/lib/github.server'
import { env } from 'website/src/lib/env'
import { safeJsonParse } from 'website/src/lib/utils'
import { Octokit } from 'octokit'
import { OAuthApp } from 'octokit'

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

    const afterLoginUrl = state?.next || `${env.PUBLIC_URL}/dashboard`

    if (!state) {
        throw new Response('Missing state', { status: 400 })
    }

    const code = query.get('code')
    if (!code) {
        throw new Response('Missing code', { status: 400 })
    }

    // Exchange code for access token
    const app = new OAuthApp({
        clientId: env.GITHUB_CLIENT_STATELESS_ID!,
        clientSecret: env.GITHUB_CLIENT_STATELESS_SECRET!,
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

    console.log(
        `GitHub user authenticated: ${user.login}${state.projectId ? `, projectId: ${state.projectId}` : ''}`,
    )

    // Redirect to the user's GitHub profile
    return redirect(`https://github.com/${user.login}`)
}
