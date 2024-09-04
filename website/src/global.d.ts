import { DataFunctionArgs } from '@remix-run/node'
import { Params } from '@remix-run/react'

// allow importing images
declare module '*.jpeg'

declare module '@remix-run/node' {
    export interface AppLoadContext {
        response: {
            headers: Headers
        }
    }
}

