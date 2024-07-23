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
    PUBLIC_LEMON_PRODUCT: process.env.PUBLIC_LEMON_PRODUCT,
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

    // test mode
    { variantId: 457634, name: '1 hour', limits: { words: 1000, seats: 1 } },
    { variantId: 457648, name: '1 hour', limits: { words: 500, seats: 1 } },
    { variantId: 457650, name: '1 hour', limits: { words: 3_000, seats: 1 } },
]

export const variantIdToCredits = Object.assign(
    {},
    ...plansConfig.map((x) => ({ [x.variantId]: x.limits.words })),
)
