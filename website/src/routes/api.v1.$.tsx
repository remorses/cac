import { ActionFunctionArgs } from "@remix-run/node"
import { app } from "website/src/lib/elysia.server"

export function action({ request }: ActionFunctionArgs) {
    return app.handle(request)
}
export function loader({ request }: ActionFunctionArgs) {
    return app.handle(request)
}

