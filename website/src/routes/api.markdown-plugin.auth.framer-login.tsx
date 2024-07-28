import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { getSupabaseWithHeaders } from '../lib/supabase.server'
import { notifyError } from '../lib/errors'
import { afterFramerLogin, loginRedirectUrl } from 'website/src/lib/utils'
import { env } from '../lib/env'

export async function loader({ request, response }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const key = url.searchParams.get('key') || ''
    const { supabase, headers } = getSupabaseWithHeaders({
        request,
        response,
    })
    if (!key) {
        throw new Error('URL is malformed, missing key param')
    }
    // const next = url.searchParams.get('next') || '/x'
    let next = new URL(`/api/markdown-plugin/github/install`, env.PUBLIC_URL)

    next.searchParams.set('next', afterFramerLogin({ key }))

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            skipBrowserRedirect: true,
            queryParams: {
                prompt: 'select_account', // can also be 'consent'
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
