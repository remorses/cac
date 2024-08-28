import { db, sql } from 'db/kysely'
import { test, expect } from 'vitest'

test('kysely works as i intended', async () => {
    let orgId = '84e4c5b4-7ee6-4327-bb92-f0ad08d2cac6'
    const sqlQuery = db
        .selectFrom('Org')
        .where('orgId', '=', orgId)
        .innerJoin('auth.users', (join) =>
            join.onRef(sql`cast("Org"."orgId" as uuid)`, '=', 'auth.users.id'),
        )
        .selectAll()
    expect('\n' + sqlQuery.compile().sql).toMatchInlineSnapshot(
        `
      "
      select * from "Org" inner join "auth"."users" on cast("Org"."orgId" as uuid) = "auth"."users"."id" where "orgId" = $1"
    `,
    )
})
