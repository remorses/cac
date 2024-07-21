import { Session, createClient } from '@supabase/supabase-js'
import { env } from 'website/src/lib/env'
import { framer } from 'framer-plugin'

export async function getSupabaseWithSession() {
    // const contextSession = getContextSession()
    // if (contextSession) {
    //     const { error } = await supabase.auth.setSession(contextSession)
    //     if (error) {
    //         throw error
    //     }
    // }
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession()
    if (error) {
        throw error
    }
    return { session, error }
}

export const supabase = createClient(
    env.PUBLIC_SUPABASE_URL!,
    env.PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            storage: {
                isServer: true,

                async getItem(key: string) {
                    let data = await framer.getPluginData(key)
                    return data || null
                },

                async removeItem(key: string) {
                    await framer.setPluginData(key, null)
                },

                async setItem(key: string, value: string) {
                    console.log('setting item', key, value)
                    await framer.setPluginData(key, value)
                },
            },
            autoRefreshToken: true,

            persistSession: true,
            detectSessionInUrl: false,
            // flowType: 'pkce',
        },
    },
)
