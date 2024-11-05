Convert the code to use spiceflow instead of rpc functions.

Here is an example of how to use spiceflow:

## Requests and Responses

### POST Request with Body Schema

```ts
import { z } from 'zod'
import { Spiceflow } from 'spiceflow'

new Spiceflow().post(
    '/users',
    async ({ request }) => {
        const body = await request.json() // here body has type { name: string, email: string }
        return `Created user: ${body.name}`
    },
    {
        body: z.object({
            name: z.string(),
            email: z.string().email(),
        }),
    },
)
```

### Response Schema

```ts
import { z } from 'zod'
import { Spiceflow } from 'spiceflow'

new Spiceflow().get(
    '/users/:id',
    ({ request, params }) => {
        const typedJson = await request.json() // this body will have the correct type
        return { id: Number(params.id), name: 'John Doe' }
    },
    {
        body: z.object({
            id: z.number(),
            name: z.string(),
        }),
        params: z.object({
            id: z.string(),
        }),
    },
)
```

## Generate RPC Client

```ts
import { createSpiceflowClient } from 'spiceflow/client'
import { Spiceflow } from 'spiceflow'

const app = new Spiceflow().get('/hello/:id', () => 'Hello, World!')

const client = createSpiceflowClient<typeof app>('http://localhost:3000')

const { data, error } = await client.hello({ id: '' }).get()
```

You should use the function name as path and always use POST with the body schema. always make fields of the body optional.

Use zod to define the body schema.

To implement authorization use a middleware:

```ts
import { z } from 'zod'
import { Spiceflow } from 'spiceflow'

new Spiceflow()
    .state('session', null as Session | null)
    .use(async ({ request: req, state }, next) => {
        const res = new Response()

        const { session } = await getPagesSession({ req, res })
        if (!session) {
            return
        }
        state.session = session
        const response = await next()

        const cookies = res.headers.getSetCookie()
        for (const cookie of cookies) {
            response.headers.append('Set-Cookie', cookie)
        }

        return response
    })
    .post('/protected', async ({ state }) => {
        const { session } = state
        if (!session) {
            throw new Error('Not logged in')
        }
        return { ok: true }
    })
```

Always try to return an object in each route, spiceflow will automatically serialize it to json and use correct type in the client.

