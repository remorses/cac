import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { getSupabaseWithHeaders } from '../lib/supabase.server'
import { notifyError } from '../lib/errors'
import { afterFramerLogin, loginRedirectUrl } from 'website/src/lib/utils'

export async function loader({ request, response }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const key = url.searchParams.get('key') || ''
    const code = url.searchParams.get('code') || ''
    const { supabase, headers } = getSupabaseWithHeaders({
        request,
        response,
    })
    if (!key) {
        throw new Error('URL is malformed, missing key param')
    }
    // const next = url.searchParams.get('next') || '/x'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            skipBrowserRedirect: true,
            redirectTo: loginRedirectUrl({
                next: afterFramerLogin({ key, code }),
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
