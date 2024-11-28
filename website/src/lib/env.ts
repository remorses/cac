import { PluginName } from '@prisma/client'

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
    BROWSERBASE_DCP: process.env.BROWSERBASE_DCP,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
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

// TODO use the framer marketplace url
export const installFramerPluginUrl =
    'https://www.framer.com/marketplace/plugins/migrate--atog5qz8imo0pji1b10z8alr7/'

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

    // production, subscription
    {
        variantId: 495826,

        limits: { words: 2_000 },
    },
    {
        variantId: 495827,

        limits: { words: 5_000 },
    },
    {
        variantId: 495828,

        limits: { words: 15_000 },
    },
]

const pricingDescription = `
Each credit corresponds to 1 word of generated content. An average landing page contains 500 words.

Migrating a landing page manually takes around 15 minutes, using the plugin it only takes a few seconds.

10k credits are about 20 pages of an average website, you save about 10 hours of work

20k credits are about 40 pages of an average website, you save about 20 hours of work
`

export const variantIdToCredits = Object.assign(
    {},
    ...plansConfig.map((x) => ({ [x.variantId]: x.limits.words })),
)

export const feedbackUrl = (pluginName) =>
    `mailto:tommy@unframer.co?subject=${encodeURIComponent(pluginName + ' Plugin Feedback')}`

export const FREE_GITHUB_SYNCS_PER_MONTH = 10

export function getBuyGithubPluginUrl({ orgId, email, projectId }) {
    const url = new URL('/api/markdown-plugin/buy', env.PUBLIC_URL)
    url.searchParams.append('orgId', orgId)
    url.searchParams.append('email', email)
    url.searchParams.append('pluginName', 'githubSync' satisfies PluginName)
    url.searchParams.append('projectId', projectId)
    return url.toString()
}
