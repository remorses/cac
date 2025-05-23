import { createSpiceflowClient } from 'spiceflow/client'
import { App } from './bucket-server.js'

let url = 'https://bucket-server.unframer.co'
export const unframerBucketServerSdk = createSpiceflowClient<App>(url, {})
