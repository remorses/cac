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
export function raycastLink({ session }) {
    return `raycast://extensions/xmorse/crisp/index?context=${encodeURIComponent(JSON.stringify({ session }))}`
}
