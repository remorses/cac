import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabase = createClient<any>(
    env.PUBLIC_SUPABASE_URL!,
    env.PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            flowType: 'pkce',
        },
    },
)
