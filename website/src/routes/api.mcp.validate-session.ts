import { data, type ActionFunctionArgs } from 'react-router'
import { prisma } from 'db'
import { AppError } from '../lib/errors'

export async function action({ request }: ActionFunctionArgs) {
    const body = await request.json()
    const { sessionToken } = body

    if (!sessionToken) {
        return Response.json(
            { error: 'Missing session token' },
            { status: 400 },
        )
    }

    // Find and validate session
    const session = await prisma.framerLoginSession.findUnique({
        where: {
            key: sessionToken,
        },
        include: {
            org: {
                include: {
                    users: {
                        where: {
                            role: 'ADMIN', // Get admin user for the org
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                },
                            },
                        },
                        take: 1,
                    },
                },
            },
        },
    })

    if (!session) {
        return Response.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Check if session is expired (stored in data JSON)
    const sessionData = session.data as any
    if (
        sessionData?.expiresAt &&
        new Date(sessionData.expiresAt) < new Date()
    ) {
        return Response.json({ error: 'Session expired' }, { status: 401 })
    }

    if (!session.framerUserId) {
      throw new Error(`no session.framerUserId found`)
    }

    const adminUser = session.org.users[0]?.user

    return Response.json({
        framerUserId: session.framerUserId,
        websocketId: session.framerUserId, // For backward compatibility with WebSocket connection
        userId: session.usedByUserId,
        email: sessionData?.email || adminUser?.email || '',
    })
}
