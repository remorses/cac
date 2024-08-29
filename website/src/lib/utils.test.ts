import { db, sql } from 'db/kysely'
import { test, expect } from 'vitest'
import { yieldNewArrayItems } from 'website/src/lib/ndjson'

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

test('yieldNewArrayItems', async () => {
    async function* stream() {
        yield {
            items: [{ id: 1 }],
        }
        yield {
            items: [{ id: 1, text: 'hello' }],
        }
        yield {
            items: [{ id: 1, text: 'hello world' }],
        }
        yield {
            items: [
                { id: 1, text: 'hello world' }, //
                { id: 2, text: '' }, //
            ],
        }
        yield {
            items: [
                { id: 1, text: 'hello world' }, //
                { id: 2, text: 'hello again' }, //
            ],
        }
        yield {
            items: [
                { id: 1, text: 'hello world' }, //
                { id: 2, text: 'hello again' }, //
                { id: 3, text: 'hi' }, //
            ],
        }
        yield {
            items: [
                { id: 1, text: 'hello world' }, //
                { id: 2, text: 'hello again' }, //
                { id: 3, text: 'hi for ' }, //
            ],
        }
        yield {
            items: [
                { id: 1, text: 'hello world' }, //
                { id: 2, text: 'hello again' }, //
                { id: 3, text: 'hi for third time' }, //
            ],
        }
    }
    let lastId = -1
    for await (let chunk of yieldNewArrayItems({
        arrayField: 'items',
        stream: stream(),
    })) {
        if (chunk.fullItem) {
            console.log('fullItem', chunk.fullItem)
        }
        if (chunk.partialItem?.id && chunk.partialItem.id !== lastId) {
            console.log('incoming object', chunk.partialItem?.id)
            lastId = chunk.partialItem.id
        }
    }
})
