import { redirect, type LoaderFunctionArgs } from 'react-router';
import { getSupabaseWithHeaders } from '../lib/supabase.server'
import { notifyError } from '../lib/errors'
import { afterFramerLogin, loginRedirectUrl } from 'website/src/lib/utils'
import { env } from '../lib/env'
import { PluginName } from 'db'

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const key = url.searchParams.get('key') || ''
    const code = url.searchParams.get('code') || ''
    const projectId = url.searchParams.get('projectId') || ''
    const projectName = url.searchParams.get('projectName') || ''
    const { supabase, headers } = getSupabaseWithHeaders({
        request,
    })
    if (!key) {
        throw new Error('URL is malformed, missing key param')
    }
    // const next = url.searchParams.get('next') || '/x'
    let next = new URL(`/api/markdown-plugin/github/install`, env.PUBLIC_URL)

    next.searchParams.set(
        'next',
        afterFramerLogin({
            key,
            code,
            projectId,
            projectName,
            pluginName: 'githubSync',
        }),
    )

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',

        options: {
            skipBrowserRedirect: true,

            queryParams: {
                // prompt: 'select_account', // can also be 'consent'
            },
            redirectTo: loginRedirectUrl({
                next: next.toString(),
            }),
        },
    })
    if (error) {
        notifyError(error, 'Error logging in for framer')

        return
    }

    console.log(`redirecting to ${data.url}`)
    return redirect(data.url, { headers })
}
