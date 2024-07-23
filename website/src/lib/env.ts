export const env = {
    //
    PUBLIC_URL: process.env.PUBLIC_URL,
    PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT || 8040,
    SECRET: process.env.SECRET,
    SCREENSHOTONE_KEY: process.env.SCREENSHOTONE_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
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

export const framerUrl = 'https://framer.com?via=xmorse'
export const framerPluginUrl = 'https://framer.com?via=xmorse'

export const companyName = 'Unframer'
export const domain = env.PUBLIC_URL!.replace('https://', '').replace('/', '')

export const plansConfig = [
    {
        variantId: 52783,
        name: '1 hour',
        usd: 14,
        limits: { words: 8_000, seats: 1 },
    },
    {
        variantId: 50792,
        name: '2 hours',
        usd: 29,
        limits: { words: 16_000, seats: 3 },
    },
    {
        variantId: 50793,
        name: '10 hours',
        usd: 99,
        limits: { words: 80_000, seats: 10 },
    },
    // test mode
    { variantId: 38951, name: '1 hour', limits: { words: 3_000, seats: 1 } },
    { variantId: 38949, name: '2 hours', limits: { words: 1_000, seats: 3 } },
]

export const variantIdToCredits = Object.assign(
    {},
    ...plansConfig.map((x) => ({ [x.variantId]: x.limits.words })),
)
