import { prisma } from 'db'

async function main() {
    const orgsWithoutUsers = await prisma.org.findMany({
        where: { users: { none: {} } },
    })
    console.log(orgsWithoutUsers)

}


main()
