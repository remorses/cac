import { redirect, type LoaderFunctionArgs } from 'react-router'
import { getSupabaseWithHeaders } from '../lib/supabase.server'
import { notifyError } from '../lib/errors'
import { afterFramerLogin, loginRedirectUrl } from 'website/src/lib/utils'
import { PluginName } from 'db'

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const key = url.searchParams.get('key') || ''
    const code = url.searchParams.get('code') || ''
    const projectId = url.searchParams.get('projectId') || ''
    const pluginName: PluginName =
        url.searchParams.get('pluginName') || ('' as any)
    const projectName = url.searchParams.get('projectName') || ''
    const framerUserId = url.searchParams.get('framerUserId') || ''
    const { supabase, headers } = getSupabaseWithHeaders({
        request,
    })
    if (!key) {
        throw new Error('URL is malformed, missing key param')
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            skipBrowserRedirect: true,
            redirectTo: loginRedirectUrl({
                next: afterFramerLogin({
                    key,
                    code,
                    projectId,
                    projectName,
                    pluginName,
                    framerUserId,
                }),
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
