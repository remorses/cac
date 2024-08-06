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
    PUBLIC_LEMON_PRODUCT_MIGRATE: process.env.PUBLIC_LEMON_PRODUCT_MIGRATE,
    GITHUB_APP_ID: process.env.GITHUB_APP_ID,
    GITHUB_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_APP_NAME: process.env.GITHUB_APP_NAME,
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
export const framerPluginUrl = new URL(
    '/framer-plugin/migrate',
    env.PUBLIC_URL,
).toString()

// TODO use the framer marketplace url
export const installFramerPluginUrl = new URL(
    '/framer-plugin/migrate',
    env.PUBLIC_URL,
).toString()

export const companyName = 'Unframer'
export const domain = env.PUBLIC_URL!.replace('https://', '').replace('/', '')

export const plansConfig = [
    // test mode
    {
        variantId: 457634,
        name: '10k credits', // an average landing page word length is 1k
        limits: { words: 12_000 }, //
    },
    {
        // 1 time payment
        variantId: 457650,
        name: '10k credits', // an average landing page word length is 1k
        limits: { words: 10_000 }, //
    },
]

const pricingDescription = `
1 credit = 1 migrated word

An average landing page contains 500 words

Migrating a landing page manually takes around 15 minutes, using the plugin it only takes a few seconds.

- 10k credits are about 20 pages, you save 
`

export const variantIdToCredits = Object.assign(
    {},
    ...plansConfig.map((x) => ({ [x.variantId]: x.limits.words })),
)
