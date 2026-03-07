/**
 * Audit Durable Object storage for the old framer-mcp-preview worker.
 *
 * The old worker used the `agents` npm package which creates 5 SQLite tables
 * per DO instance (cf_agents_state, cf_agents_mcp_servers, cf_agents_queues,
 * cf_agents_schedules, cf_agents_workflows). These are pure waste now that
 * we migrated to framer-mcp-v2 with the McpTunnel DO class.
 *
 * Usage:
 *   pnpm tsx scripts/audit-do-storage.ts
 *   pnpm tsx scripts/audit-do-storage.ts --delete-dry-run
 *
 * Auth: Uses CLOUDFLARE_API_TOKEN env var, or falls back to wrangler's OAuth token
 * from ~/Library/Preferences/.wrangler/config/default.toml (macOS).
 *
 * Fetches only a small sample of DO instances (3 pages of 100) to avoid hammering
 * the CF API. The total count is extrapolated from the sample.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ACCOUNT_ID = '103e73569e2f6d4aea0fb679ceb8709b'
const API_BASE = 'https://api.cloudflare.com/client/v4'
const OLD_WORKER_NAME = 'framer-mcp-preview'
const OLD_DO_CLASS = 'MyMCP'

// How many pages of 100 objects to sample (keeps API calls minimal)
const SAMPLE_PAGES = 3
const PAGE_SIZE = 100
// Seconds to wait between paginated requests
const PACE_SECONDS = 3

function readWranglerOAuthToken(): string | undefined {
  const candidates = [
    path.join(os.homedir(), 'Library', 'Preferences', '.wrangler', 'config', 'default.toml'),
    path.join(os.homedir(), '.wrangler', 'config', 'default.toml'),
  ]
  for (const configPath of candidates) {
    if (!fs.existsSync(configPath)) {
      continue
    }
    const content = fs.readFileSync(configPath, 'utf-8')
    const match = content.match(/^oauth_token\s*=\s*"([^"]+)"/m)
    if (match) {
      return match[1]
    }
  }
  return undefined
}

const token = process.env.CLOUDFLARE_API_TOKEN || readWranglerOAuthToken()
if (!token) {
  console.error('Missing CLOUDFLARE_API_TOKEN env var and no wrangler OAuth token found')
  process.exit(1)
}

const dryRunDelete = process.argv.includes('--delete-dry-run')

interface CfResponse<T> {
  success: boolean
  errors: Array<{ code: number; message: string }> | null
  result: T
  result_info?: {
    count: number
    cursor?: string
    page?: number
    per_page?: number
    total_count?: number
  }
}

interface Namespace {
  id: string
  class: string
  name: string
  script: string
  use_sqlite: boolean
}

interface DurableObjectEntry {
  id: string
  hasStoredData: boolean
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Fetch with unlimited retries on 429. Waits exponentially (10s, 20s, 40s, ...)
 * and never gives up — the CF rate limit window eventually clears.
 */
async function cfFetch<T>(apiPath: string): Promise<CfResponse<T>> {
  const url = `${API_BASE}${apiPath}`
  let attempt = 0
  while (true) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 429) {
      attempt++
      const waitMs = Math.min(10_000 * 2 ** (attempt - 1), 120_000)
      console.log(`  429 rate limited — waiting ${waitMs / 1000}s (attempt ${attempt})...`)
      await sleep(waitMs)
      continue
    }
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`CF API ${res.status} ${res.statusText}: ${body}`)
    }
    return res.json() as Promise<CfResponse<T>>
  }
}

async function listNamespaces(): Promise<Namespace[]> {
  const all: Namespace[] = []
  let page = 1
  while (true) {
    const res = await cfFetch<Namespace[]>(
      `/accounts/${ACCOUNT_ID}/workers/durable_objects/namespaces?per_page=100&page=${page}`,
    )
    if (!res.success) {
      throw new Error(`Failed to list namespaces: ${JSON.stringify(res.errors)}`)
    }
    all.push(...res.result)
    const total = res.result_info?.total_count ?? 0
    if (all.length >= total || res.result.length === 0) {
      break
    }
    page++
    await sleep(PACE_SECONDS * 1000)
  }
  return all
}

/**
 * Fetch a small sample of DO instances (SAMPLE_PAGES pages of PAGE_SIZE).
 * Returns { sampled, hasMore, cursor } so we know if there are more without
 * exhausting the API.
 */
async function sampleObjects(namespaceId: string): Promise<{
  sampled: DurableObjectEntry[]
  hasMore: boolean
}> {
  const all: DurableObjectEntry[] = []
  let cursor: string | undefined
  for (let page = 0; page < SAMPLE_PAGES; page++) {
    if (page > 0) {
      await sleep(PACE_SECONDS * 1000)
    }
    const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''
    const res = await cfFetch<DurableObjectEntry[]>(
      `/accounts/${ACCOUNT_ID}/workers/durable_objects/namespaces/${namespaceId}/objects?limit=${PAGE_SIZE}${cursorParam}`,
    )
    if (!res.success) {
      throw new Error(`Failed to list objects: ${JSON.stringify(res.errors)}`)
    }
    all.push(...res.result)
    console.log(`  ... fetched ${all.length} objects so far (page ${page + 1}/${SAMPLE_PAGES})`)
    cursor = res.result_info?.cursor
    if (!cursor || res.result.length === 0) {
      return { sampled: all, hasMore: false }
    }
  }
  return { sampled: all, hasMore: true }
}

async function main() {
  console.log('=== Durable Object Storage Audit ===\n')

  console.log('Fetching DO namespaces...')
  const namespaces = await listNamespaces()
  console.log(`Found ${namespaces.length} namespace(s):\n`)

  for (const ns of namespaces) {
    const marker = ns.script === OLD_WORKER_NAME ? ' ← OLD WORKER (target)' : ''
    console.log(
      `  [${ns.class}] id=${ns.id} script=${ns.script} sqlite=${ns.use_sqlite}${marker}`,
    )
  }
  console.log()

  // Also flag other MyMCP namespaces on different workers (framer-mcp-preview-preview, framer-mcp-v1, etc.)
  const allMyMcpNamespaces = namespaces.filter((ns) => ns.class === OLD_DO_CLASS)
  if (allMyMcpNamespaces.length > 1) {
    console.log(`Found ${allMyMcpNamespaces.length} namespaces with class="${OLD_DO_CLASS}":`)
    for (const ns of allMyMcpNamespaces) {
      console.log(`  - ${ns.script} (${ns.id})`)
    }
    console.log()
  }

  const oldNamespace = namespaces.find(
    (ns) => ns.class === OLD_DO_CLASS && ns.script === OLD_WORKER_NAME,
  )
  if (!oldNamespace) {
    const byClass = namespaces.find((ns) => ns.class === OLD_DO_CLASS)
    if (byClass) {
      console.log(
        `No namespace matched script="${OLD_WORKER_NAME}" + class="${OLD_DO_CLASS}".`,
      )
      console.log(
        `  Found class="${OLD_DO_CLASS}" on script="${byClass.script}" — using that.\n`,
      )
      await auditNamespace(byClass)
    } else {
      console.log(`No namespace found for class="${OLD_DO_CLASS}". Nothing to audit.`)
    }
    return
  }

  await auditNamespace(oldNamespace)
}

async function auditNamespace(ns: Namespace) {
  console.log(`\n=== Auditing namespace: ${ns.class} (${ns.id}) ===`)
  console.log(`  Worker: ${ns.script}`)
  console.log(`  SQLite: ${ns.use_sqlite}\n`)

  console.log(`Sampling DO instances (${SAMPLE_PAGES} pages of ${PAGE_SIZE})...`)
  const { sampled, hasMore } = await sampleObjects(ns.id)

  if (sampled.length === 0) {
    console.log('No instances found.')
    return
  }

  const withStorage = sampled.filter((o) => o.hasStoredData)
  const withoutStorage = sampled.filter((o) => !o.hasStoredData)
  const storageRate = withStorage.length / sampled.length

  console.log()
  console.log(`Sampled ${sampled.length} instances${hasMore ? ' (more exist beyond sample)' : ' (all instances)'}`)
  console.log(`  With stored data:    ${withStorage.length} (${(storageRate * 100).toFixed(1)}%)`)
  console.log(`  Without stored data: ${withoutStorage.length}`)
  console.log()

  const agentsTables = [
    'cf_agents_state',
    'cf_agents_mcp_servers',
    'cf_agents_queues',
    'cf_agents_schedules',
    'cf_agents_workflows',
  ]

  console.log('--- First 50 instances with stored data ---')
  console.log(
    '(CF API only exposes hasStoredData boolean, no per-object byte size)\n',
  )

  const top50 = withStorage.slice(0, 50)
  for (const [i, obj] of top50.entries()) {
    console.log(`  ${String(i + 1).padStart(3)}. ${obj.id}`)
  }
  if (withStorage.length > 50) {
    console.log(`  ... and ${withStorage.length - 50} more in sample`)
  }
  console.log()

  console.log('=== Summary ===')
  console.log(`Namespace:              ${ns.class} (${ns.id})`)
  console.log(`Worker:                 ${ns.script}`)
  console.log(`Sampled instances:      ${sampled.length}${hasMore ? '+' : ''}`)
  console.log(`With stored data:       ${withStorage.length} (${(storageRate * 100).toFixed(1)}%)`)
  console.log(`Without stored data:    ${withoutStorage.length}`)
  console.log()

  if (ns.use_sqlite) {
    console.log('Storage backend: SQLite')
    console.log(`Each DO with stored data likely holds ${agentsTables.length} wasted SQLite tables:`)
    for (const t of agentsTables) {
      console.log(`  - ${t}`)
    }
    console.log()
  }

  if (dryRunDelete) {
    console.log('=== DRY-RUN DELETION PLAN ===')
    console.log('NO ACTUAL DELETION — this is a dry run\n')
    console.log(
      'To actually delete storage, you must call storage.deleteAll() from inside each DO.',
    )
    console.log(
      'The CF REST API does not support remote storage deletion. Options:\n',
    )
    console.log('  1. Deploy a temporary worker with the MyMCP DO class that calls')
    console.log('     ctx.storage.deleteAll() on alarm or fetch, then trigger each instance.')
    console.log('  2. Use wrangler to delete the entire worker + DO namespace if you no')
    console.log('     longer need any of the data.\n')

    console.log(`Would delete storage for ${withStorage.length} sampled DO instances:`)
    for (const [i, obj] of withStorage.slice(0, 20).entries()) {
      console.log(`  [DRY-RUN] ${i + 1}. ${obj.id}`)
    }
    if (withStorage.length > 20) {
      console.log(`  ... and ${withStorage.length - 20} more`)
    }
    console.log()
    console.log('DRY-RUN COMPLETE — no changes made.')
  } else {
    console.log('Run with --delete-dry-run to see deletion plan (no actual deletion).')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
