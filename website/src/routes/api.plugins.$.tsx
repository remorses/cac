import { ActionFunctionArgs } from 'react-router';
import { app } from 'website/src/lib/spiceflow-plugins.server'

export function action({ request }: ActionFunctionArgs) {
    // console.log('action', [...request.headers.entries()])
    return app.handle(request)
}
export function loader({ request }: ActionFunctionArgs) {
    return app.handle(request)
}
