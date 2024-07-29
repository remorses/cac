import https from 'https'
import dns from 'dns/promises'

import { Locator } from 'playwright'

import { parseDomain, ParseResultType } from 'parse-domain'
import { verifyEmail } from '@devmehq/email-validator-js'

export async function verifySmtpEmail(email: string) {
    const res = await verifyEmail({
        emailAddress: email,
        debug: true,
        verifySmtp: true,
        verifyMx: true,
        timeout: 1000 * 30,
    })

    return { ...res }
}

export async function doesOutlookEmailExists(email: string, token) {
    const res = await fetch(
        `https://outlook.live.com/profile/v1.0/users/${email}/image`,
        {
            headers: {
                authorization: `Bearer ${token}`,
            },
        },
    )
    if (!res.ok) {
        return false
    }
}

export function nHoursAgo(n: number) {
    const d = new Date()
    d.setHours(d.getHours() - n)
    return d
}

export function getApexDomain(host: string) {
    const parsed = parseDomain(host)
    if (parsed.type === ParseResultType.Listed) {
        return parsed.domain + '.' + parsed.topLevelDomains.join('.')
    }
    // console.error(`Failed to parse ${host}`)
    return host.split('.').slice(-2).join('.')
}

export const emailsToCheck = (host: string) => [
    `team@${host}`,
    `hello@${host}`,
    `hey@${host}`,
    `hi@${host}`,
    `info@${host}`,
    `founders@${host}`,
    `sales@${host}`,

    // `support@${host}`,
    // `help@${host}`,
] // maybe add founders@ , sales@, .etc

export function groupByN<T>(arr: T[], n: number): T[][] {
    const res: T[][] = []
    for (let i = 0; i < arr.length; i += n) {
        res.push(arr.slice(i, i + n))
    }
    return res
}

export function groupByFn<T>(arr: T[], fn: (x: T) => string | number) {
    const res: Record<string, T[]> = {}
    for (const x of arr) {
        const k = fn(x)
        if (!res[k]) {
            res[k] = []
        }
        res[k].push(x)
    }
    return res
}

export const spammyHosts = [
    'themeforest.net', //
    'shopify.com', //
    'amazon.com', //
    'amazon.it', //
    'facebook.com', //
    'amazon.co.uk', //
    'apple.com', // app store
    'apple.co', // app store
    'steampowered.com', // steam
    'google.com', // play store, chrome extensions
    'deepin.org',
    // 'softsuave.com',
    'github.com', // github
    // 'producthunt.com', // product hunt
    'gumroad.com', // gumroad
    'behance.net', // behance
    'visualstudio.com', // vscode extensions
    'glideapp.io', // glide apps?
    'electronthemes.com', // glide apps?
    'figma.com',
    'airtable.com',
    'indiehackers.com',
    'thecustomizeboxes.com',
    'appsleet.com',
    'kickstarter.com',
    'twitter.com',
]

export function isTwitterProfileLink(link: string) {
    const href = link.replace(/\?.*/, '')
    const regex = /^http(s):\/\/(www\.)?twitter.com\/(\w*)\/?$/
    return href.includes('twitter.com') && regex.test(href)
}

export const spammyHostsSet = new Set(spammyHosts)

export function filterSpammySites(x: ScrapeResult) {
    let host = getApexDomain(new URL(x.website).host)
    return !spammyHostsSet.has(host)
}

export const isCI = Boolean(process.env.GITHUB_ACTION)

export function packForSheets(x: any) {
    const result: ScrapeResult = {
        createdAt: new Date().toLocaleDateString('it'),
        ...x,
    }
    for (let k in result) {
        if (Array.isArray(result[k])) {
            // deduplicate
            result[k] = [...new Set(result[k])].filter(Boolean).join(', ')
        }
    }
    return result
}
export function unpackForSheets(x: any, arrayFields: readonly string[]) {
    const result: ScrapeResult = {
        ...x,
    }
    for (let k of arrayFields) {
        // deduplicate
        if (result[k]) {
            result[k] = result[k]
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean)
        } else {
            result[k] = []
        }
    }
    // console.log(result)
    return result
}

export function formatEmail(email: string) {
    if (!email) {
        return ''
    }

    email = email.replace('mailto:', '')
    email = email.replace(/\?.*/, '') // because of ?utm_source=
    email = decodeURIComponent(email)
    if (!email.includes('@')) {
        return ''
    }
    email = email.replace(/\s/g, '')
    return email
}

export async function resolveWebsiteRedirect(url?: string, timeout = 1000 * 5) {
    if (!url) {
        console.log('no url to resolve')
        return
    }
    const hostsToResolve = new Set([
        'producthunt.com',
        'betapage.co',
        'www.producthunt.com',
        // url shorteners
        't.ly',
        'adf.ly',
        'www.adf.ly',
        'bit.ly',
        'www.bit.ly',
        'goo.gl',
        'ow.ly',
        'www.ow.ly',
        'amzn.to',
        'amzn.com',
        'bit.do',
        'df.ly',
        'goo.gl',
        'is.gd',
        'lc.chat',
        'ow.ly',
        'polr.me',
        's2r.co',
        'soo.gd',
        'tiny.cc',
        'tinyurl.com',
        'startupbase.io',
    ])
    while (hostsToResolve.has(safeURL(url)?.host || '')) {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), timeout)
        try {
            url = await new Promise<string | undefined>((resolve, reject) =>
                https
                    .get(url!, { signal: controller.signal }, (res) => {
                        // console.log('statusCode:', res.statusCode)
                        // console.log('headers:', res.headers)
                        clearTimeout(id)
                        const loc = res.headers.location
                        if (!safeURL(loc)?.host) {
                            console.log('bad location', loc, url)
                            return resolve(loc)
                        }
                        resolve(loc)
                    })
                    .on('error', (e) => {
                        reject(e)
                    }),
            )

            // console.log(res)
        } catch (e) {
            clearTimeout(id)
            console.log('resolveProductHuntRedirect:', e.message)
            return url
        }
    }
    return url
}

// export type PoweredBy = 'gitbook' | 'super.so' | 'popsy' | 'unknown'
export async function getPoweredBy(url: string, timeout = 1000 * 10) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(url, {
            headers: { accept: 'text/html' },
            redirect: 'follow',
            signal: controller.signal,
        })
        const powered = (res.headers.get('x-powered-by') || '')
            ?.toString()
            .toLowerCase()

        if (powered === 'gitbook') {
            return 'gitbook' as const
        }

        if (res.headers.get('content-type')?.startsWith('text/html')) {
            const text = await res.text()
            // console.log(text)
            if (text.includes('framerusercontent.com')) {
                return 'framer' as const
            }
            if (
                text.includes('cdn.prod.website-files.com') &&
                text.includes('webflow')
            ) {
                return 'webflow' as const
            }
            if (text.includes('/cluster/style.css')) {
                return 'super.so-cluster' as const
            }
            if (text.includes('/aether/style.css')) {
                return 'super.so-aether' as const
            }
            if (
                text.includes('https://super-static-assets.s3.amazonaws.com/')
            ) {
                return 'super.so' as const
            }
            if (text.includes('https://api.popsy.co')) {
                return 'popsy' as const
            }
        }
        return 'unknown' as const
        // console.log(res)
    } catch (e) {
        clearTimeout(id)
        console.log(`${url} getPoweredBy:`, e.message)
        return 'unknown' as const
    }
}

// favours personal emails instead of support emails
export function getEmailRank(email: string, website?: string) {
    const host = website && safeURL(website)?.hostname
    if (!email) {
        return 0
    }
    const domain = email.split('@')[1]
    if (!domain) {
        // sanitize emails, remove emails that do not contain @
        console.log('no domain in email', email)
        return -1
    }
    // email could be scraped wrong
    if (domain.toLowerCase() !== domain) {
        return 0
    }
    if (host && domain.toLowerCase() !== host.toLowerCase()) {
        return 0
    }
    if (['support', 'help'].includes(email.split('@')[0])) {
        return 0
    }
    if (email.endsWith('gmail.com')) {
        return 1
    }
    // on google these emails may just binternal groups that will bounce
    if (['team', 'founders'].includes(email.split('@')[0])) {
        return 1
    }
    if (
        ['contact', 'hello', 'hey', 'info', 'hi', 'sales'].includes(
            email.split('@')[0],
        )
    ) {
        return 2
    }

    return 3
}

export async function validiateEmailMx(emailOrHost?: string) {
    try {
        if (!emailOrHost) {
            return false
        }
        const domain = emailOrHost.includes('@')
            ? emailOrHost.split('@')[1]
            : emailOrHost
        if (!domain) {
            return false
        }
        const records = await dns.resolveMx(domain)
        if (!records.length) {
            return false
        }
        return records.some((x) => Boolean(x.exchange))
    } catch (e) {
        return null
    }
}

// taken from
// https://github.com/nyxgeek/onedrive_user_enum/blob/master/onedrive_enum.py
export async function checkOneDriveAcc(email: string) {
    const username = email.split('@')[0].replace('.', '_')
    const domain = email.split('@')[1]
    const targetDomainArray = domain.split('.')
    const targetDomain = targetDomainArray[0]
    const targetSections = targetDomainArray.length
    let targetExtension = ''
    if (targetSections > 2) {
        targetExtension =
            targetDomainArray[targetSections - 2] +
            '_' +
            targetDomainArray[targetSections - 1]
        console.log('Extension is: ' + targetExtension)
    } else {
        targetExtension = targetDomainArray[targetSections - 1]
    }
    // # set tenantname here by default
    const tenantName = targetDomain
    const url =
        'https://' +
        tenantName +
        '-my.sharepoint.com/personal/' +
        username +
        '_' +
        targetDomain +
        '_' +
        targetExtension +
        '/_layouts/15/onedrive.aspx'
    // console.log({ url })
    try {
        const r = await fetch(url, { method: 'HEAD' })
        if (r.status == 403) {
            console.log('[+] [403] VALID ONEDRIVE')
            return true
        } else if (r.status == 401) {
            console.log('[+] [401] VALID ONEDRIVE')
            return true
        } else if (r.status == 404) {
            console.log('[-] [404] not found')
            return false
        } else {
            console.log('[?] [' + r.status + '] UNKNOWN RESPONSE')
            return false
        }
    } catch (e) {
        return false
    }
}

// taken from
// https://gist.github.com/dertin/a24b35e230f9022c5dec380845cba68c
export async function checkGmailAcc(
    emails: string[],
): Promise<Record<string, { photoUrl: string; displayName?: string }>> {
    console.log('checking gmail accounts', emails.length)
    let cookie = process.env.GOOGLE_COOKIE
    if (!cookie) {
        throw new Error('GOOGLE_COOKIE is not set')
    }
    // https://issuetracker.google.com/action/user_profiles?usernames=xxx@gmail.com?enable_jspb=true
    const u = new URL(
        'https://issuetracker.google.com/action/user_profiles?enable_jspb=true',
    )
    // console.log(JSON.stringify(emails))
    u.searchParams.set('usernames', emails.join(','))

    const res = await fetch(u, {
        headers: {
            accept: 'application/json',
            cookie,
        },
        // body: body,
        method: 'GET',
    })
    if (!res.ok) {
        throw new Error(res.status + '\n' + (await res.text()))
    }

    let text = await res.text()

    // console.log('text', text)
    text = text.replace(")]}'", '')
    try {
        const raw_json = JSON.parse(text)
        const list = raw_json[0][1]
        if (!list || !list.length) {
            return {}
        }
        const json = Object.fromEntries(list)
        if (Object.keys(json).length === 0) {
            return {}
        }
        return json
    } catch (e) {
        throw new Error(
            `GOOGLE_COOKIE has probably expired, checkGmailAcc no longer works`,
        )
    }
}

export function safeURL(url: string | undefined) {
    try {
        return new URL(url as any)
    } catch {
        console.warn(`Could not parse to URL: ${url}`)
        return {
            toString() {
                return ''
            },
        } as Partial<URL>
    }
}

export function transferSitesWithNoDocs() {
    return transferTo(sheets.companiesWithoutDocsSite.id, (x) => {
        if (x.docsSite) {
            return
        }
        if (!x.website) {
            return
        }
        if (!x.emails?.length) {
            return
        }
        return {
            allEmails: x.emails,
            email: x.emails?.sort((a, b) => {
                return getEmailRank(b, x.website) - getEmailRank(a, x.website)
            })?.[0],
            company: x.company.split('.')[0], // do not add links or it would end up in spam
            website: x.website,
            twitter: x.twitters?.[0] || '',
        }
    })
}

export async function present(loc: Locator) {
    try {
        await loc.waitFor({ state: 'attached', timeout: 2000 })
        return true
    } catch {
        return false
    }
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
