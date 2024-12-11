Convert the code to use spiceflow instead of rpc functions.

Here is an example of how to use spiceflow:

## Requests and Responses

### POST Request with Body Schema

```
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
