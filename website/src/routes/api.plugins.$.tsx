import { ActionFunctionArgs } from 'react-router';
import { spiceflowApp } from 'website/src/lib/spiceflow-plugins.server'

export function action({ request }: ActionFunctionArgs) {
    // console.log('action', [...request.headers.entries()])
    return spiceflowApp.handle(request)
}
export function loader({ request }: ActionFunctionArgs) {
    return spiceflowApp.handle(request)
}
