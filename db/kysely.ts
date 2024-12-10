import { Kysely, PostgresDialect } from 'kysely'
import { DB } from './kysely.types'
import { Pool } from 'pg'

declare global {
    var __pg_pool: Pool | undefined
}

const pool = globalThis.__pg_pool || new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
})

if (process.env.NODE_ENV !== 'production') {
    globalThis.__pg_pool = pool
}

export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool,
    }),
})

export { sql } from 'kysely'
