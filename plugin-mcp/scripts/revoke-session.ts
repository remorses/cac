/**
 * Revoke a user's MCP session secret.
 *
 * Deletes the FramerLoginSession row from the database. The worker's KV cache
 * has a 5 minute TTL so the session may remain valid for up to 5 minutes after
 * revocation.
 *
 * Usage:
 *   pnpm revoke-session <secret>
 *
 * Requires DATABASE_URL env var (use doppler run -c production).
 */

import { prisma } from 'db'

async function main() {
    const secret = process.argv[2]
    if (!secret) {
        console.error('Usage: pnpm revoke-session <secret>')
        process.exit(1)
    }

    // Look up the session
    const session = await prisma.framerLoginSession.findUnique({
        where: { key: secret },
    })

    if (!session) {
        console.error(`No session found for this secret`)
        process.exit(1)
    }

    const sessionData = session.data as Record<string, unknown>
    console.log(`Found session:`)
    console.log(`  framerUserId: ${session.framerUserId}`)
    console.log(`  orgId:        ${session.orgId}`)
    console.log(`  email:        ${sessionData?.email || '(none)'}`)
    console.log(`  createdAt:    ${session.createdAt.toISOString()}`)
    console.log(`  pluginName:   ${session.pluginName}`)

    // Delete from database
    await prisma.framerLoginSession.delete({
        where: { key: secret },
    })
    console.log(`\n✓ Session deleted from database`)
    console.log(`  Note: KV cache may keep the session valid for up to 5 more minutes`)
    console.log(`\nDone. User will need to re-login from the plugin to get a new session.`)
    process.exit(0)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
