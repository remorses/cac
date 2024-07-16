export const env = {
    //
    PUBLIC_URL: process.env.PUBLIC_URL,
    PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
    CRISP_ID: process.env.CRISP_ID,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT || 8040,
}





// console.log(env)
for (let k in env) {
    if (
        env[k] == null &&
        (typeof window === 'undefined' || k.includes('PUBLIC'))
    ) {
        throw new Error(`Missing env var ${k}`)
    }
}

export const crispAPIIdentifier = 'f5ca7711-02b2-4f5b-bc39-216554c642b7'

export const supabaseRef = env
    .PUBLIC_SUPABASE_URL!.replace('.supabase.co', '')
    .replace('https://', '')

export const raycastUrl = 'https://www.raycast.com/xmorse/crisp?via=tommy'
export const crispPluginUrl =
    'https://crisp.chat/en/integrations/urn:tommaso.de.rossi:raycast:0'

export const companyName = 'Crispy Raycast'
export const domain = env.PUBLIC_URL!.replace('https://', '').replace('/', '')
