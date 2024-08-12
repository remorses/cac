import { DataFunctionArgs } from '@remix-run/node'
import { Params } from '@remix-run/react'

// allow importing images
declare module '*.jpeg';


declare module '@remix-run/node' {
    interface ExtendedDataFunctionArgs extends DataFunctionArgs {
        response: Response
    }

    export interface LoaderFunctionArgs extends ExtendedDataFunctionArgs {}
    export interface ActionFunctionArgs extends ExtendedDataFunctionArgs {}
}


