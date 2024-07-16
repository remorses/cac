import { hc } from 'hono/client'
import { Session } from '@supabase/supabase-js'
import { RouteType } from '../routes/api.$'

export function createClient({
    url,
    session,
    supabaseRef,
    fetch,
}: {
    session: Session
    supabaseRef: string
    url: string
    fetch?: any
}) {
    if (!session) {
        throw new Error('No session')
    }
    const client = hc<RouteType>(url, {
        fetch,
        headers() {
            return {
                Cookie: `sb-${supabaseRef}-auth-token=${encodeURIComponent(JSON.stringify(session))}`,
            }
        },
    })
    return client
}
