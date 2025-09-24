import { PluginName } from 'db'
import dedent from 'dedent'
import { env } from './env'
export { bfsFramerLayersTree, framerLayersTreeToXml } from 'plugin-mcp/'

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

// IMPORTANT! this must be kept in sync with schema.prisma enum PluginName
export enum PluginNames {
    github = 'github',
    migrate = 'migrate',
    react = 'react',
    llm = 'llm',
    mcp = 'mcp',
}

export function framerLoginUrl({
    key,
    code,
    pluginName,
    projectId,
    projectName,
    framerUserId,
}: {
    key: string
    code: string
    pluginName?: string
    projectId?: string
    projectName?: string
    framerUserId?: string
}) {
    let url: URL
    if (pluginName === PluginNames.github) {
        url = new URL('/api/markdown-plugin/auth/framer-login', env.PUBLIC_URL)
    } else {
        url = new URL('/api/auth/framer-login', env.PUBLIC_URL)
    }
    url.searchParams.set('key', key)
    if (projectId) {
        url.searchParams.set('projectId', projectId)
    }
    if (pluginName) {
        url.searchParams.set('pluginName', pluginName)
    }
    if (projectName) {
        url.searchParams.set('projectName', projectName)
    }
    if (framerUserId) {
        url.searchParams.set('framerUserId', framerUserId)
    }
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

export function isTruthy<T>(
    val: T | undefined | null | false | '' | 0,
): val is T {
    return Boolean(val)
}

export function afterFramerLogin({
    key,
    projectId,
    pluginName,
    projectName,
    code,
    framerUserId,
}: {
    key: string
    projectId?: string
    pluginName?: PluginName
    projectName?: string
    code: string
    framerUserId?: string
}) {
    const url = new URL('/after-framer-login', env.PUBLIC_URL)
    url.searchParams.set('key', key)
    if (projectId) {
        url.searchParams.set('projectId', projectId)
    }
    if (pluginName) {
        url.searchParams.set('pluginName', pluginName)
    }
    if (projectName) {
        url.searchParams.set('projectName', projectName)
    }
    url.searchParams.set('code', code)
    if (framerUserId) {
        url.searchParams.set('framerUserId', framerUserId)
    }
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

export function canHaveFreePlugin(email?: string) {
    // return false
    if (!email) {
        return false
    }
    if (email?.endsWith('@framer.com')) {
        return true
    }
    if (email === 't.de.rossi.01@gmail.com') {
        return true
    }
    if (email === 'beats.by.morse@gmail.com') {
        return true
    }
    return false
}

export function deduplicateByKey<T>(
    items: T[],
    getKey: (item: T) => string | number,
): T[] {
    const seen = new Map<string | number, T>()
    for (const item of items) {
        const key = getKey(item)
        if (!seen.has(key)) {
            seen.set(key, item)
        }
    }
    return Array.from(seen.values())
}

export function safeUrl(u) {
    try {
        return new URL(u)
    } catch {
        return null
    }
}



export async function generateStackblitzProject({ projectId, title = '' }) {
    const sdk = (await import('@stackblitz/sdk')).default
    const { generateStackblitzFiles } = await import('unframer-workspace')
    const files = generateStackblitzFiles({ projectId, title })

    const filesObject = files.reduce((acc, { relativePath, contents }) => {
        acc[relativePath] = contents
        return acc
    }, {})

    return await sdk.openProject(
        {
            title: `Unframer - ${title}`,
            description: `${title} demo for Unframer`,
            template: 'node',
            files: filesObject,
        },
        {
            openFile: 'src/App.tsx',
            showSidebar: false,
        },
    )
}
