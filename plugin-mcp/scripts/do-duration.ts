/**
 * Query Cloudflare Durable Object execution duration for the MCP worker.
 *
 * References:
 * - Cloudflare Durable Objects metrics docs:
 *   https://developers.cloudflare.com/durable-objects/observability/graphql-analytics/
 * - Cloudflare GraphQL token docs (needs Account Analytics: Read):
 *   https://developers.cloudflare.com/analytics/graphql-api/getting-started/authentication/api-token-auth/
 * - flareclerk reference implementation:
 *   https://github.com/michaloo/flareclerk
 *
 * Notes:
 * - The REST Durable Objects namespace API works with the Wrangler OAuth token we
 *   already have locally, but GraphQL analytics may reject that token if it lacks
 *   Account Analytics: Read.
 * - This script tries CLOUDFLARE_API_TOKEN / CLOUDFLARE_ANALYTICS_API_TOKEN first,
 *   then falls back to Wrangler auth stored under ~/.wrangler or the macOS
 *   ~/Library/Preferences/.wrangler directory.
 * - `activeTime` is converted using the same formula flareclerk uses for DO billing:
 *   `activeTime / 1_000_000` => active seconds, then `* 0.125` => GB-seconds for
 *   the standard 128 MiB DO memory size.
 *
 * Examples:
 *   pnpm do:duration
 *   pnpm do:duration --env production --days 30
 *   pnpm do:duration --bucket hour --days 2 --json
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ACCOUNT_ID = '103e73569e2f6d4aea0fb679ceb8709b'
const API_BASE = 'https://api.cloudflare.com/client/v4'
const GRAPHQL_URL = `${API_BASE}/graphql`
const ANALYTICS_DOCS_URL =
    'https://developers.cloudflare.com/analytics/graphql-api/getting-started/authentication/api-token-auth/'
const WORKER_NAME_BY_ENV = {
    preview: 'framer-mcp-preview-preview',
    production: 'framer-mcp-preview',
} as const
const DO_CLASS = 'McpTunnel'

type EnvironmentName = keyof typeof WORKER_NAME_BY_ENV
type BucketMode = 'day' | 'hour'

type CliArgs = {
    accountId: string
    bucket: BucketMode
    days: number
    env: EnvironmentName
    json: boolean
}

type AuthToken = {
    source: string
    value: string
}

type CloudflareApiResponse<T> = {
    errors?: Array<{ code: number; message: string }> | null
    messages?: Array<{ code: number; message: string }> | null
    result: T
    result_info?: {
        page?: number
        per_page?: number
        total_count?: number
    }
    success: boolean
}

type GraphqlEnvelope<T> = {
    data?: T
    errors?: Array<{ message: string }>
    messages?: Array<{ code: number; message: string }>
    result?: T | null
    success?: boolean
}

type NamespaceEntry = {
    class: string
    id: string
    script: string
}

type PeriodicRow = {
    dimensions: {
        datetimeHour: string
        namespaceId: string
    }
    sum?: {
        activeTime?: number
        inboundWebsocketMsgCount?: number
    }
}

type InvocationRow = {
    avg?: {
        sampleInterval?: number
    }
    dimensions: {
        datetimeHour: string
        namespaceId: string
    }
    sum?: {
        requests?: number
    }
}

type AnalyticsData = {
    viewer?: {
        accounts?: Array<{
            durableObjectsInvocationsAdaptiveGroups?: InvocationRow[]
            durableObjectsPeriodicGroups?: PeriodicRow[]
        }>
    }
}

type BucketSummary = {
    activeSeconds: number
    bucket: string
    gbSeconds: number
    requests: number
    websocketMessages: number
}

function parseArgs(): CliArgs {
    if (process.argv.includes('--help')) {
        printHelp()
        process.exit(0)
    }

    const args = process.argv.slice(2)
    const parsed = args.reduce<CliArgs>(
        (acc, arg, index) => {
            const next = args[index + 1]
            if (arg === '--env' && next && isEnvironmentName(next)) {
                return { ...acc, env: next }
            }
            if (arg === '--bucket' && next && isBucketMode(next)) {
                return { ...acc, bucket: next }
            }
            if (arg === '--days' && next) {
                const days = Number(next)
                if (!Number.isFinite(days) || days <= 0) {
                    throw new Error(`Invalid --days value: ${next}`)
                }
                return { ...acc, days }
            }
            if (arg === '--account-id' && next) {
                return { ...acc, accountId: next }
            }
            if (arg === '--json') {
                return { ...acc, json: true }
            }
            return acc
        },
        {
            accountId: ACCOUNT_ID,
            bucket: 'day',
            days: 14,
            env: 'preview',
            json: false,
        },
    )

    return parsed
}

function printHelp() {
    console.log(`Usage: pnpm do:duration [options]

Options:
  --env <preview|production>   Worker environment to inspect (default: preview)
  --days <n>                   Look back N days (default: 14)
  --bucket <day|hour>          Output granularity (default: day)
  --account-id <id>            Override Cloudflare account id
  --json                       Print machine-readable JSON
  --help                       Show this help
`)
}

function isBucketMode(value: string): value is BucketMode {
    return value === 'day' || value === 'hour'
}

function isEnvironmentName(value: string): value is EnvironmentName {
    return value === 'preview' || value === 'production'
}

function readWranglerToken(): AuthToken | undefined {
    const envToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_ANALYTICS_API_TOKEN
    if (envToken) {
        return {
            source: process.env.CLOUDFLARE_API_TOKEN
                ? 'CLOUDFLARE_API_TOKEN'
                : 'CLOUDFLARE_ANALYTICS_API_TOKEN',
            value: envToken,
        }
    }

    const candidates = [
        path.join(os.homedir(), 'Library', 'Preferences', '.wrangler', 'config', 'default.toml'),
        path.join(os.homedir(), '.wrangler', 'config', 'default.toml'),
        path.join(os.homedir(), 'Library', 'Preferences', '.wrangler', 'config', 'default.json'),
        path.join(os.homedir(), '.wrangler', 'config', 'default.json'),
    ]

    const tokenFromFile = candidates
        .filter((configPath) => {
            return fs.existsSync(configPath)
        })
        .map((configPath) => {
            const content = fs.readFileSync(configPath, 'utf8')
            if (configPath.endsWith('.json')) {
                const parsed = JSON.parse(content) as {
                    api_token?: string
                    oauth_token?: string
                }
                const token = parsed.api_token || parsed.oauth_token
                if (!token) {
                    return undefined
                }
                return {
                    source: configPath,
                    value: token,
                } satisfies AuthToken
            }

            const token =
                content.match(/^api_token\s*=\s*"([^"]+)"/m)?.[1] ||
                content.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1]
            if (!token) {
                return undefined
            }
            return {
                source: configPath,
                value: token,
            } satisfies AuthToken
        })
        .find(Boolean)

    return tokenFromFile
}

async function cfApi<T>({
    apiPath,
    token,
}: {
    apiPath: string
    token: string
}): Promise<CloudflareApiResponse<T>> {
    const response = await fetch(`${API_BASE}${apiPath}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    const json = (await response.json()) as CloudflareApiResponse<T>
    if (!response.ok || !json.success) {
        const errors = json.errors?.map((error) => error.message).join(', ') || response.statusText
        throw new Error(`Cloudflare API request failed for ${apiPath}: ${errors}`)
    }

    return json
}

async function listNamespaces({
    accountId,
    token,
}: {
    accountId: string
    token: string
}): Promise<NamespaceEntry[]> {
    let page = 1
    const namespaces: NamespaceEntry[] = []

    while (true) {
        const response = await cfApi<NamespaceEntry[]>({
            apiPath: `/accounts/${accountId}/workers/durable_objects/namespaces?per_page=100&page=${page}`,
            token,
        })

        namespaces.push(...response.result)

        const total = response.result_info?.total_count || namespaces.length
        if (namespaces.length >= total || response.result.length === 0) {
            return namespaces
        }

        page++
    }
}

async function cfGraphql<T>({
    query,
    token,
    variables,
}: {
    query: string
    token: string
    variables: Record<string, unknown>
}): Promise<T> {
    const response = await fetch(GRAPHQL_URL, {
        body: JSON.stringify({ query, variables }),
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        method: 'POST',
    })

    const json = (await response.json()) as GraphqlEnvelope<T>
    const graphqlErrors = json.errors?.map((error) => error.message).join(', ')
    const cloudflareErrors = json.messages?.map((message) => message.message).join(', ')

    if (!response.ok || graphqlErrors || json.success === false || cloudflareErrors) {
        const message = graphqlErrors || cloudflareErrors || response.statusText
        if (message.includes('Authentication error')) {
            throw new Error(
                `Cloudflare GraphQL rejected this token. Durable Object metrics require an API token with Account Analytics: Read. See ${ANALYTICS_DOCS_URL}`,
            )
        }
        throw new Error(`Cloudflare GraphQL request failed: ${message}`)
    }

    if (!json.data) {
        throw new Error('Cloudflare GraphQL returned no data')
    }

    return json.data
}

async function getNamespaceId({
    accountId,
    scriptName,
    token,
}: {
    accountId: string
    scriptName: string
    token: string
}): Promise<string> {
    const namespaces = await listNamespaces({ accountId, token })

    const namespace = namespaces.find((entry) => {
        return entry.class === DO_CLASS && entry.script === scriptName
    })

    if (!namespace) {
        throw new Error(`Could not find namespace for worker=${scriptName} class=${DO_CLASS}`)
    }

    return namespace.id
}

async function queryAnalytics({
    accountId,
    endIso,
    namespaceId,
    startIso,
    token,
}: {
    accountId: string
    endIso: string
    namespaceId: string
    startIso: string
    token: string
}): Promise<AnalyticsData> {
    const query = `query DODuration(
      $accountTag: String!
      $periodicFilter: DurableObjectsPeriodicGroupsFilter_InputObject!
      $invocationsFilter: DurableObjectsInvocationsAdaptiveGroupsFilter_InputObject!
    ) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          durableObjectsPeriodicGroups(limit: 10000, filter: $periodicFilter) {
            dimensions { namespaceId datetimeHour }
            sum { activeTime inboundWebsocketMsgCount }
          }
          durableObjectsInvocationsAdaptiveGroups(limit: 10000, filter: $invocationsFilter) {
            dimensions { namespaceId datetimeHour }
            sum { requests }
            avg { sampleInterval }
          }
        }
      }
    }`

    return cfGraphql<AnalyticsData>({
        query,
        token,
        variables: {
            accountTag: accountId,
            invocationsFilter: {
                datetimeHour_geq: startIso,
                datetimeHour_leq: endIso,
                namespaceId_in: [namespaceId],
            },
            periodicFilter: {
                datetimeHour_geq: startIso,
                datetimeHour_leq: endIso,
                namespaceId_in: [namespaceId],
            },
        },
    })
}

function toBucketKey({
    bucket,
    datetimeHour,
}: {
    bucket: BucketMode
    datetimeHour: string
}) {
    if (bucket === 'day') {
        return datetimeHour.slice(0, 10)
    }

    return datetimeHour.replace('.000Z', 'Z')
}

function aggregateAnalytics({
    analytics,
    bucket,
    namespaceId,
}: {
    analytics: AnalyticsData
    bucket: BucketMode
    namespaceId: string
}): BucketSummary[] {
    const account = analytics.viewer?.accounts?.[0]
    const periodicRows = account?.durableObjectsPeriodicGroups || []
    const invocationRows = account?.durableObjectsInvocationsAdaptiveGroups || []
    const buckets = new Map<string, BucketSummary>()

    periodicRows
        .filter((row) => {
            return row.dimensions.namespaceId === namespaceId
        })
        .forEach((row) => {
            const key = toBucketKey({ bucket, datetimeHour: row.dimensions.datetimeHour })
            const current = buckets.get(key) || {
                activeSeconds: 0,
                bucket: key,
                gbSeconds: 0,
                requests: 0,
                websocketMessages: 0,
            }

            current.activeSeconds += (row.sum?.activeTime || 0) / 1_000_000
            current.websocketMessages += row.sum?.inboundWebsocketMsgCount || 0
            current.gbSeconds = current.activeSeconds * 0.125
            buckets.set(key, current)
        })

    invocationRows
        .filter((row) => {
            return row.dimensions.namespaceId === namespaceId
        })
        .forEach((row) => {
            const key = toBucketKey({ bucket, datetimeHour: row.dimensions.datetimeHour })
            const current = buckets.get(key) || {
                activeSeconds: 0,
                bucket: key,
                gbSeconds: 0,
                requests: 0,
                websocketMessages: 0,
            }

            current.requests += (row.sum?.requests || 0) * (row.avg?.sampleInterval || 1)
            buckets.set(key, current)
        })

    return [...buckets.values()].sort((left, right) => {
        return left.bucket.localeCompare(right.bucket)
    })
}

function printTable({
    accountId,
    authSource,
    bucket,
    endIso,
    namespaceId,
    rows,
    scriptName,
    startIso,
}: {
    accountId: string
    authSource: string
    bucket: BucketMode
    endIso: string
    namespaceId: string
    rows: BucketSummary[]
    scriptName: string
    startIso: string
}) {
    console.log(`Worker:      ${scriptName}`)
    console.log(`Class:       ${DO_CLASS}`)
    console.log(`Namespace:   ${namespaceId}`)
    console.log(`Account:     ${accountId}`)
    console.log(`Auth source: ${authSource}`)
    console.log(`Range:       ${startIso} -> ${endIso}`)
    console.log(`Bucket:      ${bucket}`)
    console.log('')
    console.log('bucket                  requests   ws msgs   active s     gb-s      ms/req')

    rows.forEach((row) => {
        const msPerRequest = row.requests > 0 ? (row.activeSeconds * 1000) / row.requests : 0
        console.log(
            [
                row.bucket.padEnd(22),
                Math.round(row.requests).toString().padStart(8),
                Math.round(row.websocketMessages).toString().padStart(9),
                row.activeSeconds.toFixed(2).padStart(10),
                row.gbSeconds.toFixed(3).padStart(9),
                msPerRequest.toFixed(2).padStart(10),
            ].join(' '),
        )
    })

    const totals = rows.reduce<BucketSummary>(
        (acc, row) => {
            return {
                activeSeconds: acc.activeSeconds + row.activeSeconds,
                bucket: 'TOTAL',
                gbSeconds: acc.gbSeconds + row.gbSeconds,
                requests: acc.requests + row.requests,
                websocketMessages: acc.websocketMessages + row.websocketMessages,
            }
        },
        {
            activeSeconds: 0,
            bucket: 'TOTAL',
            gbSeconds: 0,
            requests: 0,
            websocketMessages: 0,
        },
    )

    const totalMsPerRequest =
        totals.requests > 0 ? (totals.activeSeconds * 1000) / totals.requests : 0

    console.log('')
    console.log(
        [
            totals.bucket.padEnd(22),
            Math.round(totals.requests).toString().padStart(8),
            Math.round(totals.websocketMessages).toString().padStart(9),
            totals.activeSeconds.toFixed(2).padStart(10),
            totals.gbSeconds.toFixed(3).padStart(9),
            totalMsPerRequest.toFixed(2).padStart(10),
        ].join(' '),
    )
}

function getRange({ days }: { days: number }) {
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
    return {
        endIso: end.toISOString(),
        startIso: start.toISOString(),
    }
}

async function main() {
    const args = parseArgs()
    const auth = readWranglerToken()
    if (!auth) {
        throw new Error(
            `Missing Cloudflare token. Set CLOUDFLARE_API_TOKEN or login with Wrangler. Analytics queries need Account Analytics: Read. See ${ANALYTICS_DOCS_URL}`,
        )
    }

    const scriptName = WORKER_NAME_BY_ENV[args.env]
    const namespaceId = await getNamespaceId({
        accountId: args.accountId,
        scriptName,
        token: auth.value,
    })
    const { endIso, startIso } = getRange({ days: args.days })
    const analytics = await queryAnalytics({
        accountId: args.accountId,
        endIso,
        namespaceId,
        startIso,
        token: auth.value,
    })
    const rows = aggregateAnalytics({
        analytics,
        bucket: args.bucket,
        namespaceId,
    })

    if (args.json) {
        console.log(
            JSON.stringify(
                {
                    accountId: args.accountId,
                    authSource: auth.source,
                    bucket: args.bucket,
                    className: DO_CLASS,
                    endIso,
                    namespaceId,
                    rows,
                    scriptName,
                    startIso,
                },
                null,
                2,
            ),
        )
        return
    }

    if (rows.length === 0) {
        console.log(`No analytics rows returned for ${scriptName} / ${DO_CLASS} in the selected range.`)
        return
    }

    printTable({
        accountId: args.accountId,
        authSource: auth.source,
        bucket: args.bucket,
        endIso,
        namespaceId,
        rows,
        scriptName,
        startIso,
    })
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
    process.exit(1)
})
