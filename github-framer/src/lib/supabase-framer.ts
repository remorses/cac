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
                    const keys = getKeys(key)
                    const collection = await framer.getCollection()
                    const values = await Promise.all(
                        keys.map((key) => collection.getPluginData(key) || ''),
                    )
                    const data = values.join('')
                    return data || null
                },

                async removeItem(key: string) {
                    const keys = getKeys(key)
                    const collection = await framer.getCollection()
                    await Promise.all(
                        keys.map((key) => collection.setPluginData(key, null)),
                    )
                },

                async setItem(key: string, value: string) {
                    const keys = getKeys(key)
                    const collection = await framer.getCollection()
                    const values = [value.slice(0, 2048), value.slice(2048)]
                    await Promise.all(
                        values.map((value, index) =>
                            collection.setPluginData(keys[index], value),
                        ),
                    )
                },
            },
            autoRefreshToken: true,

            persistSession: true,
            detectSessionInUrl: false,
            // flowType: 'pkce',
        },
    },
)
const getKeys = (key: string) => [`${key}.framer1`, `${key}.framer2`]
