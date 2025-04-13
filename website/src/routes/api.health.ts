import { prisma } from 'db'

async function checkDatabaseConnection() {
    try {
        // Perform a lightweight query instead of just connecting
        await prisma.$queryRaw`SELECT 1;`
        return new Response('OK', {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        })
    } catch (error) {
        return new Response('Database health check failed', {
            status: 503,
            headers: {
                'Content-Type': 'text/plain',
            },
        })
    }
}

export async function action() {
    return await checkDatabaseConnection()
}

export async function loader() {
    return await checkDatabaseConnection()
}
