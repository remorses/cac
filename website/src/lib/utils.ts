import { env } from './env'

export function loginRedirectUrl({ next = '' }) {
    const u = new URL('/api/auth/callback', env.PUBLIC_URL)
    if (next) {
        u.searchParams.set('next', new URL(next, env.PUBLIC_URL).toString())
    }
    return u.toString()
}
export function otpRedirectLink({ email, next = '' }) {
    let u = new URL('/otp', env.PUBLIC_URL)
    u.searchParams.set('email', email)
    u.searchParams.set('next', next)

    return u.toString()
}

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export enum PluginNames {
    github = 'github',
    migrate = 'migrate',
}

export function framerLoginUrl({
    key,
    code,
    pluginName = PluginNames.migrate,
}) {
    let url: URL
    if (pluginName === PluginNames.github) {
        url = new URL('/api/markdown-plugin/auth/framer-login', env.PUBLIC_URL)
    } else {
        url = new URL('/api/auth/framer-login', env.PUBLIC_URL)
    }
    url.searchParams.set('key', key)
    url.searchParams.set('code', code)
    return url.toString()
}
export function generateSecurePassword(length = 32) {
    const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    const randomValues = new Uint32Array(length)
    for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * charset.length)
    }

    return Array.from(randomValues)
        .map((x) => charset[x % charset.length])
        .join('')
}

export function generateShortOtpCode() {
    const length = 6
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    const randomValues = new Uint32Array(length)
    for (let i = 0; i < length; i++) {
        randomValues[i] = Math.floor(Math.random() * charset.length)
    }

    return Array.from(randomValues)
        .map((x) => charset[x % charset.length])
        .join('')
}

export function safeJsonParse<T = any>(str: string): T | null {
    try {
        return JSON.parse(str)
    } catch (e) {
        return null
    }
}

export function isTruthy<T>(val: T | undefined | null | false): val is T {
    return Boolean(val)
}

export function afterFramerLogin({ key, code }) {
    const url = new URL('/after-framer-login', env.PUBLIC_URL)
    url.searchParams.set('key', key)
    url.searchParams.set('code', code)
    return url.toString()
}

export type Iterated<T> = T extends AsyncIterable<infer U> ? U : never

export function sortByKey<T>(arr: T[], key: (x: T) => string) {
    return arr.sort((a, b) => {
        const aKey = key(a)
        const bKey = key(b)
        if (aKey < bKey) {
            return -1
        }
        if (aKey > bKey) {
            return 1
        }
        return 0
    })
}
