import { PrismaClient, Prisma } from '@prisma/client/index.js'
import { ITXClientDenyList } from '@prisma/client/runtime/library.js'
export * from '@prisma/client/index.js'

const debugQueries = false

export const prisma: PrismaClient =
    (global as any).prisma ||
    new PrismaClient({
        log: debugQueries
            ? [
                  {
                      emit: 'stdout',
                      level: 'query',
                  },
              ]
            : undefined,
    })

if (process.env.NODE_ENV !== 'production') (global as any).prisma = prisma

export type PrismaTx = Omit<PrismaClient, ITXClientDenyList>
