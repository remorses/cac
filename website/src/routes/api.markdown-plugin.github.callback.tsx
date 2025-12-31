import { redirect, type LoaderFunctionArgs } from 'react-router'
import {
    getGithubApp,
    getOctokit,
    GithubLoginRequestData,
} from 'website/src/lib/github.server'
import { App, OAuthApp } from 'octokit'

import { env } from 'website/src/lib/env'
import { safeJsonParse } from 'website/src/lib/utils'
import { getSupabaseSession } from '../lib/supabase.server'
import { GithubAccountType, Prisma, prisma } from 'db'

export type GithubState = {
    next?: string
}

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const { userId, redirectTo } = await getSupabaseSession({
        request,
    })
    if (!userId) {
        throw new Response('Unauthorized', { status: 401 })
    }
    const query = url.searchParams
    let stateStr = query.get('state') || ('' as string)
    const state: GithubState | null = safeJsonParse(
        decodeURIComponent(stateStr),
    )
    // const userId = session?.user?.id
    let afterFramerLoginUrl = state?.next

    const setupAction = query.get('setup_action')

    console.log(JSON.stringify(state, null, 2))
    const code = (query.get('code') as string) || ''

    let token
    if (code) {
        console.log('getting oauth token')
        const oauthApp = getGithubApp()
        const tokenRes = await oauthApp.oauth.createToken({
            code,
            state: stateStr,
            redirectUrl: new URL(url.pathname!, env.PUBLIC_URL).href,
        })
        // console.log('createToken', JSON.stringify(tokenRes, null, 2))
        token = tokenRes.authentication.token
    }

    const installationId = Number(query.get('installation_id') || '')

    if (!installationId) {
        return new Response('Missing installation_id', { status: 400 })
        // return res.status(400).json({ error: 'Missing installation_id' })
    }
    const octokit = await getOctokit({ installationId })
    const [installation] = await Promise.all([
        octokit.request('GET /app/installations/{installation_id}', {
            installation_id: installationId,
        }),
    ])
    const account = installation.data.account

    // console.log('account', account)

    const accountLogin =
        account && 'login' in account
            ? account.login
            : account!.slug.replace(/\//g, '-')

    let accountType: GithubAccountType =
        account && 'type' in account && account.type === 'User'
            ? 'USER'
            : 'ORGANIZATION'

    let members = [] as string[]
    if (accountType === 'ORGANIZATION') {
        const { data: githubMembers } = await octokit.rest.orgs.listMembers({
            org: accountLogin,
        })
        members = githubMembers.map((m) => m.login)
    } else {
        members = [accountLogin]
    }

    const appId = String(installation?.data?.app_id || '')
    let orgId = userId
    const createInstallation: Prisma.GithubInstallationUncheckedCreateInput = {
        installationId,
        orgId,
        accountLogin,
        accountAvatarUrl: installation.data.account?.avatar_url || '',
        oauthToken: token,
        appId,
        accountType,
        memberLogins: members,
    }
    await Promise.all([
        prisma.githubInstallation.upsert({
            where: {
                installationId_orgId: {
                    installationId,
                    orgId,
                },
            },
            create: createInstallation,
            update: createInstallation,
        }),
        // state.siteId &&
        //     prisma.site.update({
        //         where: {
        //             siteId: await state.siteId,
        //         },
        //         data: {
        //             installationId,
        //         },
        //     }),
    ])

    if (setupAction === 'update' || !afterFramerLoginUrl) {
        return new Response(
            `<html>
                <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                    <div style="text-align: center;">
                        <h2>GitHub settings saved</h2>
                        <p>You can close this tab and return to Framer.</p>
                    </div>
                </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } },
        )
    }

    let redirectUrl = new URL(afterFramerLoginUrl)
    let data: GithubLoginRequestData = {
        githubAccountLogin: accountLogin,
    }
    redirectUrl.searchParams.set('data', JSON.stringify(data))
    return redirect(redirectUrl.toString())
}
