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
    markdown = 'markdown',
    migrate = 'migrate',
}

export function framerLoginUrl({
    key,
    code,
    pluginName = PluginNames.migrate,
}) {
    let url: URL
    if (pluginName === PluginNames.markdown) {
        url = new URL('/api/markdown-plugin/auth/framer-login', env.PUBLIC_URL)
    } else {
        url = new URL('/api/auth/framer-login', env.PUBLIC_URL)
    }
    url.searchParams.set('key', key)
    url.searchParams.set('code', code)
    return url.toString()
}

export function generateSecurePassword() {
    const length = 32 // Fixed length for high entropy
    const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    return Array.from(crypto.getRandomValues(new Uint32Array(length)))
        .map((x) => charset[x % charset.length])
        .join('')
}
export function generateShortOtpCode() {
    const length = 6
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    return Array.from(crypto.getRandomValues(new Uint32Array(length)))
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
