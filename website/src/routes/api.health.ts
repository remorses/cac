import { prisma } from 'db'
async function checkDatabaseConnection() {
    const randomId = Math.random().toString(36).slice(2, 10)
    const label = `database-health-check-${randomId}`
    console.time(label);
    try {
        // Perform a lightweight query instead of just connecting
        await prisma.$queryRaw`SELECT 1;`
        console.timeEnd(label);
        return new Response('OK', {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        })
    } catch (error) {
        console.timeEnd(label);
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
