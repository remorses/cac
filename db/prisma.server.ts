import { PrismaPg } from '@prisma/adapter-pg'
export * from './generated/models.js'
export * from './generated/client.js'
import { PrismaClient } from './generated/client.js'

const debugQueries = false

export const pgAdapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 6,
})

declare global {
    var prisma: PrismaClient | undefined
}

export const prisma: PrismaClient =
    globalThis.prisma ||
    new PrismaClient({
        adapter: pgAdapter,

        log: debugQueries
            ? [
                  {
                      emit: 'stdout',
                      level: 'query',
                  },
              ]
            : undefined,
    })

globalThis.prisma = prisma
