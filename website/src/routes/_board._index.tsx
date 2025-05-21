import { LoaderFunctionArgs, redirect, data as json } from 'react-router'

import { getSupabaseSession } from '../lib/supabase.server'
import Home from './_board.home'

export let loader = async ({ request }: LoaderFunctionArgs) => {
    const { headers, session } = await getSupabaseSession({
        request,
    })

    // if (session) {
    //     return redirect('/x', { headers })
    // }

    return json({ success: true }, { headers })
}

export default Home
