import { createClient } from '@supabase/supabase-js'
import { redirect } from '@remix-run/node'
import { createServerClient, parse, serialize } from '@supabase/ssr'

import { env } from './env'
import { notifyError } from './errors'

export function createSupabaseAdmin() {
    return createClient<any>(
        env.PUBLIC_SUPABASE_URL!,
        env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }, //
        },
    )
}

export function createSupabaseAnon() {
    return createClient<any>(
        env.PUBLIC_SUPABASE_URL!,
        env.PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }, //
        },
    )
}

type SupabaseSessionArgs = {
    request: Request
    response: { headers: Headers } | undefined
}

export function getSupabaseWithHeaders({
    request,
    response,
}: SupabaseSessionArgs) {
    const cookies = parse(request.headers.get('Cookie') ?? '')
    const headers = response ? new Headers(response.headers) : new Headers()

    const supabase = createServerClient(
        env.PUBLIC_SUPABASE_URL!,
        env.PUBLIC_SUPABASE_ANON_KEY!,
        {
            // jwtSecret: process.env.SUPABASE_JWT_SECRET,

            cookies: {
                get(key) {
                    return cookies[key]
                },
                set(key, value, options) {
                    headers.append('Set-Cookie', serialize(key, value, options))
                },
                remove(key, options) {
                    headers.append('Set-Cookie', serialize(key, '', options))
                },
            },
            auth: {
                detectSessionInUrl: true,
                flowType: 'pkce',
            },
        },
    )

    return { supabase, headers }
}

export async function getSupabaseSession({
    request,
    response,
}: SupabaseSessionArgs) {
    const { supabase, headers } = getSupabaseWithHeaders({
        request,
        response,
    })
    const [
        {
            data: { session },
            error: sessionError,
        },
        {
            data: { user },
            error,
        },
    ] = await Promise.all([
        supabase.auth.getSession(), //
        supabase.auth.getUser(),
    ])
    if (sessionError) {
        notifyError(sessionError, 'Session error')
    }
    if (session && error) {
        notifyError(error, 'User error')
        return {
            session: null,
            headers,
            supabase,
            user: null,
            userId: null,
        }
    }
    const userId = user?.id as string
    let redirectTo: Response | undefined
    if (!userId) {
        redirectTo = redirect('/login', { headers })
    }

    const email = user?.email || ''
    return { session, email, headers, supabase, userId, user, redirectTo }
}
