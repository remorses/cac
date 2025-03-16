import { PrismaClient, Prisma } from './prisma-generated'
import { ITXClientDenyList } from './prisma-generated/runtime/library'
export * from './prisma-generated'

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
