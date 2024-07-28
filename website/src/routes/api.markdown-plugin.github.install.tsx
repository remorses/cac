import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import {
    getSupabaseSession,
    getSupabaseWithHeaders,
} from '../lib/supabase.server'
import { notifyError } from '../lib/errors'
import { afterFramerLogin, loginRedirectUrl } from 'website/src/lib/utils'
import { env } from '../lib/env'
import { prisma } from 'db/prisma'

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

    // TODO if it is already installed, redirect to after now, needs database here
    const githubInstallation = await prisma.githubInstallation.findFirst({
        where: {
            orgId,
        },
    })
    if (githubInstallation) {
        return redirect(next, { headers })
    }

    const githubInstallationUrl = new URL(
        `https://github.com/apps/unframer/installations/new`,
    )
    const redirectUri = new URL(
        '/api/markdown-plugin/github/callback',
        env.PUBLIC_URL,
    )
    redirectUri.searchParams.set('next', next)

    githubInstallationUrl.searchParams.set(
        'redirect_uri',
        redirectUri.toString(),
    )
    let state = {
        // redirectToPath: after.toString()
    }

    githubInstallationUrl.searchParams.set('state', JSON.stringify(state))

    return redirect(githubInstallationUrl.toString(), { headers })
}
