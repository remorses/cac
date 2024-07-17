import { LoaderFunctionArgs, redirect, json } from '@remix-run/node'

import { getSupabaseSession } from '../lib/supabase.server'
import Home from './home'

export let loader = async ({ request, response }: LoaderFunctionArgs) => {
    const { headers, session } = await getSupabaseSession({
        request,
        response,
    })

    if (session) {
        return redirect('/x', { headers })
    }

    return json({ success: true }, { headers })
}

export default Home

