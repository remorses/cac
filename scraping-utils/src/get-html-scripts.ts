import { Plugin, transform } from 'esbuild'
import { HTMLRewriter } from 'htmlrewriter'
import { safeURL } from './utils'
export const externalPackages = [
    'react',
    'react-dom',
    'framer',
    'unframer',
    'framer-motion', //
]

export async function pageUsesSupabase({ url }) {
    const { scriptUrls } = await getHtmlScripts({
        url,
    })
    // console.log(`found ${scriptUrls.length} scripts`)
    console.log(scriptUrls)
    const sources = await Promise.all(
        scriptUrls.map(async (x) => {
            let res = await fetchWithRetryAndError(x, {
                headers: {
                    accept: 'text/javascript',
                },
            })
            let text = await res.text()
            return { text, url: x }
        }),
    )
    for (let source of sources) {
        // console.log(source.url)
        if (scriptUsesSupabase(source.text)) {
            return true
        }
    }
    return false
}

export async function websiteUsesSupabase({ url }) {
    const htmlRes = await fetchWithRetryAndError(url, {
        headers: { accept: 'text/html' },
        redirect: 'follow',
    })
    const applicationUrls = new Set<string>()
    const u = new URL(url)
    const host = u.hostname
    let simpleHost = host
    // only 2 dots, unless special .co.uk or .com.au or other cases like that
    if (host.split('.').length > 2) {
        const parts = host.split('.')
        if (parts.length === 4 && (parts[2] === 'co' || parts[2] === 'com')) {
            // Special cases like .co.uk or .com.au
            simpleHost = parts.slice(-3).join('.')
        } else {
            // For other cases, use the last two parts
            simpleHost = parts.slice(-2).join('.')
        }
    }

    const appHosts = [
        `app`, //
        `dashboard`, //
        `panel`, //
        `portal`, //
        `admin`, //
    ].map((x) => `${x}.${simpleHost}`)
    const loginLikePaths = [
        '/login',
        '/login/',
        '/signin',
        '/signin/',
        '/auth',
        '/auth/',
    ]
    await new HTMLRewriter()
        .on('a', {
            element(element) {
                const href = element.getAttribute('href')
                if (!href) {
                    return
                }
                // const content = element.
                const u = safeURL(href, url)
                if (!u) {
                    return
                }
                if (appHosts.includes(u.hostname!)) {
                    console.log(
                        `found an app url because it has app subdomain ${u.hostname}`,
                    )
                    applicationUrls.add(u.href!)
                }
                if (loginLikePaths.some((x) => u.pathname?.endsWith(x))) {
                    console.log(
                        `found an app url because it has login path ${u.pathname}`,
                    )
                    applicationUrls.add(u.href!)
                }
                // console.log('not an application url', u.href)

                // if same domain but with app subdomain
            },
        })
        .transform(htmlRes)
        .text()
    const allScripts = await Promise.all(
        [...applicationUrls.values()].map(async (url) => {
            const { scriptUrls } = await getHtmlScripts({
                url,
            })
            return scriptUrls
        }),
    )
    let allScriptsFlat = [...new Set([...allScripts.flat()])]
    const somePagesUseSupabase = await Promise.all(
        allScriptsFlat.map(async (x) => {
            let res = await fetchWithRetryAndError(x, {
                headers: {
                    accept: 'text/javascript',
                },
            })
            let text = await res.text()
            const usesSupabase = scriptUsesSupabase(text)
            if (usesSupabase) {
                console.log('found supabase in', x)
            }
            console.log(x)
            return { usesSupabase, text, url: x }
        }),
    )
    const usesSupabase = somePagesUseSupabase.some((x) => x.usesSupabase)
    return { usesSupabase }
}

export function scriptUsesSupabase(script: string) {
    const supabaseRegex = /https?:\/\/[a-zA-Z0-9]+\.supabase\.co/
    if (supabaseRegex.test(script)) {
        return true
    }
    // if (script.includes('supabase.auth.token')) {
    //     return true
    // }
    // if (script.includes('supabase.gotrue-js.locks.debug')) {
    //     return true
    // }
    // if (script.includes('X-Supabase-Api-Version')) {
    //     return true
    // }
    // if (script.includes('@supabase/gotrue-js')) {
    //     return true
    // }

    return false
}
export function scriptUsesNextAuth(script: string) {
    // if (script.includes('auth')) {
    //     return true
    // }
    return false
}

let logger = console

export async function getHtmlScripts({
    url = '' as string,
    timeout = 1000 * 5,
}) {
    const res = await fetchWithRetryAndError(url, {
        headers: { accept: 'text/html' },
        redirect: 'follow',
        // signal: controller.signal,
        timeout,
    })

    let scriptUrls = [] as string[]
    let u = new URL(url)
    await new HTMLRewriter()
        .on('script', {
            element(element) {
                const src = element.getAttribute('src')
                if (!src) {
                    return
                }
                const scriptUrl = new URL(src, url)

                if (
                    scriptUrl.hostname !== u.hostname &&
                    !scriptUrl.hostname.endsWith(`.${u.hostname}`)
                ) {
                    return
                }

                scriptUrls.push(new URL(src, url).href)
            },
        })
        .transform(res)
        .text()
    return { scriptUrls }
}

let redirectCache = new Map<string, Promise<string>>()
const codeCache = new Map()
export function esbuildPluginBundleDependencies({
    signal = undefined as AbortSignal | undefined,
    externalizeNpm = false,
}) {
    const plugin: Plugin = {
        name: 'esbuild-plugin',
        setup(build) {
            const namespace = 'https '
            build.onResolve({ filter: /^https?:\/\// }, (args) => {
                const url = new URL(args.path)
                return {
                    path: args.path,
                    external: false,
                    // sideEffects: false,
                    namespace,
                }
            })
            const resolveDep = (args) => {
                if (signal?.aborted) {
                    throw new Error('aborted')
                }
                if (args.path.startsWith('https://')) {
                    return {
                        path: args.path,
                        external: false,
                        // sideEffects: false,
                        namespace,
                    }
                }
                if (args.path === 'framer') {
                    return {
                        path: 'unframer',
                        external: true,
                    }
                }
                if ('framer-motion' === args.path) {
                    return {
                        path: 'unframer',
                        external: true,
                    }
                }
                if (
                    externalPackages.some(
                        (x) => x === args.path || args.path.startsWith(x + '/'),
                    )
                ) {
                    return {
                        path: args.path,
                        external: true,
                    }
                }

                // console.log('resolve', args.path)
                if (args.path.startsWith('.') || args.path.startsWith('/')) {
                    const u = new URL(args.path, args.importer).toString()
                    // logger.log('resolve', u)
                    return {
                        path: u,
                        namespace,
                    }
                }
                if (externalizeNpm) {
                    return {
                        path: args.path,
                        external: true,
                    }
                }

                const url = `https://esm.sh/${args.path}`

                return {
                    path: url,
                    namespace,
                    external: false,
                }
            }
            // build.onResolve({ filter: /^\w/ }, resolveDep)
            build.onResolve({ filter: /.*/, namespace }, resolveDep)
            build.onLoad({ filter: /.*/, namespace }, async (args) => {
                if (signal?.aborted) {
                    throw new Error('aborted')
                }
                const url = args.path
                const u = new URL(url)
                const resolved = await resolveRedirect({
                    url,
                    redirectCache,
                    signal,
                })
                if (codeCache.has(url)) {
                    const code = await codeCache.get(url)
                    return {
                        contents: code,
                        loader: 'js',
                    }
                }
                let loader = 'jsx' as any
                const promise = Promise.resolve().then(async () => {
                    logger.log('fetching', url.replace(/https?:\/\//, ''))
                    const res = await fetchWithRetry(resolved, { signal })
                    if (!res.ok) {
                        throw new Error(
                            `Cannot fetch ${resolved}: ${res.status} ${res.statusText}`,
                        )
                    }
                    // console.log('type', res.headers.get('content-type'))
                    if (
                        res.headers
                            .get('content-type')
                            ?.startsWith('application/json')
                    ) {
                        loader = 'json'
                        return await res.text()
                    }
                    let text = await res.text()

                    // when it finds a line with /* webpackIgnore: true */
                    // it also adds /* @vite-ignore */
                    text = text.replace(
                        /(\/\* webpackIgnore: true \*\/)/g,
                        '$1 /* @vite-ignore */',
                    )

                    const transformed = await transform(text, {
                        define: {
                            'import.meta.url': JSON.stringify(resolved),
                        },
                        minify: false,
                        format: 'esm',
                        jsx: 'transform',
                        logLevel: 'error',
                        loader,
                        platform: 'browser',
                    })
                    // console.log('transformed', resolved)
                    return transformed.code
                })

                if (loader === 'jsx') {
                    codeCache.set(url, promise)
                }
                const code = await promise

                return {
                    contents: code,

                    loader,
                }
            })
        },
    }
    return plugin
}

export async function resolveRedirect({
    redirectCache,
    signal,
    url,
}: {
    url?: string
    redirectCache?: any
    signal?: AbortSignal
}) {
    if (!url) {
        return ''
    }
    url = url.toString()

    if (redirectCache && redirectCache.has(url)) {
        return await redirectCache.get(url)
    }

    // console.time(`resolveRedirect ${url}`)
    const p = recursiveResolveRedirect(url, signal)
    // console.timeEnd(`resolveRedirect ${url}`)

    if (redirectCache) {
        redirectCache.set(url, p)
    }
    return await p
}

export async function recursiveResolveRedirect(
    url?: string,
    signal?: AbortSignal,
) {
    if (!url) {
        return
    }

    let res = await fetchWithRetry(url, {
        redirect: 'manual',
        method: 'HEAD',
        signal: signal,
    })
    const loc = res.headers.get('location')
    if (res.status < 400 && res.status >= 300 && loc) {
        // logger.log('redirect', loc)
        return recursiveResolveRedirect(res.headers.get('location') || '')
    }

    return url
}

export const fetchWithRetry = retryTwice(fetch) as typeof fetch

export async function fetchWithRetryAndError(
    url,
    options = {} as RequestInit & {
        timeout?: number
    },
): Promise<Response> {
    const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    let retries = 2
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    let res: Response = new Response('')
    while (retries > 0) {
        res = await fetch(url, {
            ...options,
            headers: { ...options.headers, 'User-Agent': userAgent },
            signal: controller.signal,
        })
        if (res.ok) {
            clearTimeout(timeout)
            return res
        } else {
            retries--
        }
    }
    const text = await res.text()
    throw new Error(
        `Failed to fetch ${url}, status: ${res.status}, text: ${text}`,
    )
}

export function retryTwice<F extends Function>(fn: Function): Function {
    return async (...args) => {
        try {
            return await fn(...args)
        } catch (e: any) {
            // ignore abort errors
            if (e.name === 'AbortError') {
                return
            }
            logger.error('retrying', e.message)
            return await fn(...args)
        }
    }
}
