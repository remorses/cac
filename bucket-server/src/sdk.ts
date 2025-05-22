import { createSpiceflowClient } from 'spiceflow/client'

let url = 'https://bucket-server.unframer.co'
export const unframerBucketServerSdk = createSpiceflowClient(url, {})
