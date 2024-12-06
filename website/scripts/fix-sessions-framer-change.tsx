import { prisma } from 'db/prisma'

async function main() {
    try {
        // First find the records that need updating
        const records = await prisma.framerLoginSession.findMany({
            where: {
                projectId: {
                    not: '',
                    
                },
            },
            // select: {
            //     key: true,
            //     projectId: true,
            // },
        })

        console.log('Found records to update:', records.length)
        const orgIds = new Set(records.map((r) => r.orgId))
        console.log('Unique org IDs:', Array.from(orgIds).length)
        
        return
        // Then update them
        const result = await prisma.framerLoginSession.updateMany({
            where: {
                projectId: {
                    not: null,
                    lt: '0000000000000000',
                },
            },
            data: {
                projectId: null,
            },
        })

        console.log(`Updated ${result.count} records`)
    } catch (error) {
        console.error('Error updating records:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
