import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import {
    getSupabaseSession,
    getSupabaseWithHeaders,
} from '../lib/supabase.server'
import { notifyError } from '../lib/errors'
import {
    afterFramerLogin,
    isTruthy,
    loginRedirectUrl,
    safeJsonParse,
} from 'website/src/lib/utils'
import { env } from '../lib/env'
import { prisma } from 'db/prisma'
import {
    checkGitHubIsInstalled,
    getGithubApp,
    getGithubUserLogin,
    GithubLoginRequestData,
} from 'website/src/lib/github.server'
import { GithubState } from 'website/src/routes/api.markdown-plugin.github.callback'
import {
    Form,
    useLoaderData,
    useNavigation,
    useSearchParams,
} from '@remix-run/react'
import { Button } from '@nextui-org/react'
import { Octokit } from 'octokit'
import { PageContainer } from 'website/src/components/Container'
import { db } from 'db/kysely'

enum FormNames {
    chooseAnother = '_chooseAnother',
    chosenOrg = 'chosenOrg',
}

export default function ChooseOrg() {
    const { installations } = useLoaderData<typeof loader>()
    const [searchParams] = useSearchParams()
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    return (
        <PageContainer>
            <h1 className='text-2xl max-w-md text-center text-balance'>
                Choose a GitHub organization or account to connect to Framer
            </h1>
            <Form className='flex dark flex-col gap-6'>
                <select
                    className='rounded-md py-1 border-0 dark:bg-default-200'
                    name={FormNames.chosenOrg}
                >
                    {installations.map((org) => {
                        return (
                            <option
                                key={org.accountLogin}
                                value={org.accountLogin}
                            >
                                {org.accountLogin}
                            </option>
                        )
                    })}
                    <option value={FormNames.chooseAnother}>
                        add another organization
                    </option>
                </select>
                {/* add all other search params with hidden inputs */}
                {Array.from(searchParams).map(([key, value]) => {
                    return (
                        <input
                            key={key}
                            type='hidden'
                            name={key}
                            value={value}
                        />
                    )
                })}

                <Button isLoading={isLoading} type='submit'>
                    Connect GitHub
                </Button>
            </Form>
        </PageContainer>
    )
}

export async function loader({ request, response }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    let afterFramerLoginUrl = url.searchParams.get('next') || ''

    const chosenOrg =
        url.searchParams.get(FormNames.chosenOrg)?.toString() || ''

    const { supabase, session, userId, headers } = await getSupabaseSession({
        request,
        response,
    })
    if (!afterFramerLoginUrl) {
        throw new Error('URL is malformed, missing next param')
    }

    let orgId = userId
    if (!orgId) {
        throw new Error('User not found')
    }
    const githubLogin = await getGithubUserLogin({ userId })
    // if it is already installed, redirect to after now, needs database here
    const [githubInstallations] = await Promise.all([
        prisma.githubInstallation.findMany({
            where: {
                status: 'active',
                memberLogins: { hasSome: [githubLogin] },
            },
        }),
        db
            .updateTable('auth.users')
            .where('id', '=', userId)
            .set({ githubLogin: githubLogin })
            .execute(),
    ])
    let installations = (
        await Promise.all(
            githubInstallations.map(async (installation) => {
                const ok = await checkGitHubIsInstalled({
                    installationId: installation.installationId,
                })
                if (ok) {
                    return installation
                }
                return null
            }),
        )
    ).filter(isTruthy)

    if (installations.some((x) => x.accountLogin === chosenOrg)) {
        let url = new URL(afterFramerLoginUrl)
        let data: GithubLoginRequestData = { githubAccountLogin: chosenOrg }
        url.searchParams.set('data', JSON.stringify(data))
        return redirect(url.toString(), { headers })
    }

    if (!chosenOrg && installations.length) {
        // render the org selection page
        return {
            installations,
        }
    } else {
        console.log('adding another github installation')
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
        next: afterFramerLoginUrl,
        // redirectToPath: after.toString()
    }

    githubInstallationUrl.searchParams.set('state', JSON.stringify(state))

    return redirect(githubInstallationUrl.toString(), { headers })
}
