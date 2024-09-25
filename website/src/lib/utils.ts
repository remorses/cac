import { OldTextTree } from 'website/src/lib/rewrite'
import { XMLParser } from 'fast-xml-parser'
import { parseString } from 'xml2js'
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

const namesToRemove = ['Desktop', 'Mobile', 'Tablet']
export function cleanupOldTextTree(
    tree: OldTextTree,
    shouldRemoveTopTree = true,
): OldTextTree {
    // Helper function to process a single node
    function processNode(
        node: OldTextTree[number],
    ): OldTextTree[number] | OldTextTree | null {
        // Remove node if its name is in namesToRemove, but keep its children
        if (node.name && namesToRemove.includes(node.name)) {
            return node.children?.flatMap(processNode).filter(isTruthy) || []
        }

        console.log('node', node.content, node.name)
        // Use content as name if they are the same when lowercase
        if (
            node.content &&
            node.name &&
            node.content.trim().toLowerCase() === node.name.trim().toLowerCase()
        ) {
            node.name = 'text'
        }

        // Remove nodeId if the node has children
        if (node.children?.length) {
            const { nodeId, ...rest } = node
            return {
                ...rest,
                children: node.children.flatMap(processNode).filter(isTruthy),
            }
        }
        return node
    }

    // Process each node in the tree
    let cleanedTree = tree
        .flatMap(processNode)
        .filter((node): node is OldTextTree[number] => node !== null)

    return cleanedTree
}

export function bfsOldTextTree(tree: OldTextTree): OldTextTree {
    const queue: OldTextTree = [...tree]
    const result: OldTextTree = []

    while (queue.length > 0) {
        const node = queue.shift()
        if (node) {
            result.push(node)

            if (node.children && node.children.length > 0) {
                queue.push(...node.children)
            }
        }
    }

    return result
}

export function oldTextTreeToXml(
    tree: OldTextTree,
    indent: string = '',
): string {
    let xml = ''

    for (const node of tree) {
        if (!node) {
            continue
        }
        let name = node.name || 'Container'
        const nodeName = name
            .replace(/\s+/g, '_')
            .replace(/\.+/g, '')
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .replace(/^[^a-zA-Z_]+/, '_')
        const attributes = [] as string[]

        if (!node?.children?.length && node.nodeId) {
            attributes.push(`nodeId="${node.nodeId}"`)
        }
        if (node.attributes) {
            for (const [key, value] of Object.entries(node.attributes)) {
                if (value !== undefined && value !== null) {
                    attributes.push(`${key}="${value}"`)
                }
            }
        }

        const attributesString =
            attributes.length > 0 ? ' ' + attributes.join(' ') : ''

        xml += `${indent}<${nodeName}${attributesString}>\n`

        if (node.content) {
            xml += `${indent}  ${escapeXml(node.content)}\n`
        }

        if (node.children && node.children.length > 0) {
            xml += oldTextTreeToXml(node.children, indent + '  ')
        }

        xml += `${indent}</${nodeName}>\n`
    }

    return xml
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<':
                return '&lt;'
            case '>':
                return '&gt;'
            case '&':
                return '&amp;'
            case "'":
                return '&apos;'
            case '"':
                return '&quot;'
            default:
                return c
        }
    })
}
