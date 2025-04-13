import { PrismaClient } from './.prisma'
export * from './.prisma'


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


