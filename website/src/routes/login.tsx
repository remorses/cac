import { redirect, type LoaderFunctionArgs } from 'react-router';
import { getSupabaseWithHeaders } from '../lib/supabase.server'
import { notifyError } from '../lib/errors'
import { loginRedirectUrl } from 'website/src/lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url)

    const { supabase, headers } = getSupabaseWithHeaders({
        request,
    })

    // const next = url.searchParams.get('next') || '/x'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            skipBrowserRedirect: true,
            redirectTo: loginRedirectUrl({
                next: '/x',
            }),
        },
    })
    if (error) {
        notifyError(error, 'Error logging in via /login')

        return
    }

    console.log(`redirecting to ${data.url}`)
    return redirect(data.url, { headers })
}
