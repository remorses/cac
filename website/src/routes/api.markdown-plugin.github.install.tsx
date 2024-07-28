import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import {
    getSupabaseSession,
    getSupabaseWithHeaders,
} from '../lib/supabase.server'
import { notifyError } from '../lib/errors'
import { afterFramerLogin, loginRedirectUrl } from 'website/src/lib/utils'
import { env } from '../lib/env'
import { prisma } from 'db/prisma'
import { checkGitHubIsInstalled } from 'website/src/lib/github.server'
import { GithubState } from 'website/src/routes/api.markdown-plugin.github.callback'

export async function loader({ request, response }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const next = url.searchParams.get('next') || ''

    const { supabase, userId, headers } = await getSupabaseSession({
        request,
        response,
    })
    if (!next) {
        throw new Error('URL is malformed, missing next param')
    }

    let orgId = userId
    if (!orgId) {
        throw new Error('User not found')
    }

    // if it is already installed, redirect to after now, needs database here
    const [githubInstallation] = await Promise.all([
        prisma.githubInstallation.findFirst({
            where: {
                orgId,
                status: 'active',
            },
        }),
    ])
    if (githubInstallation?.installationId) {
        const ok = await checkGitHubIsInstalled({
            installationId: githubInstallation?.installationId,
        })

        if (githubInstallation && ok) {
            return redirect(next, { headers })
        }
    }

    const githubInstallationUrl = new URL(
        `https://github.com/apps/${env.GITHUB_APP_NAME}/installations/new`,
    )
    const redirectUri = new URL(
        '/api/markdown-plugin/github/callback',
        env.PUBLIC_URL,
    )
    // redirectUri.searchParams.set('next', next)

    githubInstallationUrl.searchParams.set(
        'redirect_uri',
        redirectUri.toString(),
    )
    let state: GithubState = {
        next: next,
        // redirectToPath: after.toString()
    }

    githubInstallationUrl.searchParams.set('state', JSON.stringify(state))

    return redirect(githubInstallationUrl.toString(), { headers })
}
