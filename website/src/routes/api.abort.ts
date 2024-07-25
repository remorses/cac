import { LoaderFunctionArgs } from '@remix-run/node'
import { sleep } from 'website/src/lib/utils'

export async function loader({ request }: LoaderFunctionArgs) {
    console.log('request', request.signal)
    request.signal.addEventListener('abort', () => {
        console.log('aborting')
    })
    console.trace('request', )

    for (let i = 0; i < 10; i++) {
        await sleep(1000)

        console.log('tick', i, request.signal.aborted)
    }
    return new Response('hello')
}
