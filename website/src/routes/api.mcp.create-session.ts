import { type ActionFunctionArgs } from 'react-router'
import { getSupabaseWithHeaders } from '../lib/supabase.server'
import { prisma, PluginName } from 'db'
import { AppError } from '../lib/errors'

export async function action({ request }: ActionFunctionArgs) {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify Supabase token
    const { supabase } = getSupabaseWithHeaders({ request })
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

    if (error || !user) {
        return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { supabaseUserId, email, framerUserId } = body

    // Verify the token belongs to the same user
    if (user.id !== supabaseUserId) {
        return Response.json({ error: 'User ID mismatch' }, { status: 403 })
    }

    // Get user's org (create if doesn't exist)
    let orgUser = await prisma.orgsUsers.findFirst({
        where: { userId: user.id },
        include: { org: true },
    })

    if (!orgUser) {
        // Create org for user
        const org = await prisma.org.create({
            data: {
                name: email || 'MCP User',
                users: {
                    create: {
                        userId: user.id,
                        role: 'ADMIN',
                    },
                },
            },
        })
        orgUser = { org, orgId: org.orgId, userId: user.id, role: 'ADMIN' }
    }

    // Generate MCP session token
    const sessionToken = crypto.randomUUID()
    const finalFramerUserId =
        framerUserId || user.user_metadata?.framer_id || user.id

    // Store in FramerLoginSession
    await prisma.framerLoginSession.create({
        data: {
            key: sessionToken,
            usedByUserId: user.id,
            orgId: orgUser.orgId,
            framerUserId: finalFramerUserId,
            pluginName: PluginName.mcp, // MCP uses the llm plugin name
            data: {
                email: email || user.email || '',
                isMcpSession: true,
                expiresAt: new Date(
                    Date.now() + 24 * 60 * 60 * 1000,
                ).toISOString(),
            },
        },
    })

    return Response.json({ sessionToken, framerUserId: finalFramerUserId })
}
