import { prisma } from 'db'
async function checkDatabaseConnection() {
    console.time('database-health-check');
    try {
        // Perform a lightweight query instead of just connecting
        await prisma.$queryRaw`SELECT 1;`
        console.timeEnd('database-health-check');
        return new Response('OK', {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        })
    } catch (error) {
        console.timeEnd('database-health-check');
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
