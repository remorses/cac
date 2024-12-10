import fs from 'fs'
import path from 'path'
import { app } from '../src/lib/elysia.server'
import { createSpiceflowClient } from 'spiceflow/client'
async function main() {
    console.log('Creating Spiceflow client...')
    const client = createSpiceflowClient(app)
    
    console.log('Fetching OpenAPI spec...')
    const { data: openapiJson, error } = await client.api.plugins.openapi.get()
    if (error) {
        console.error('Failed to fetch OpenAPI spec:', error)
        throw error
    }

    const outputPath = path.resolve(__dirname, '../openapi.json')
    console.log('Writing OpenAPI spec to', outputPath)
    fs.writeFileSync(
        outputPath,
        JSON.stringify(openapiJson, null, 2),
    )
    console.log('Successfully wrote OpenAPI spec')
}

main().catch((e) => {
    console.error('Failed to generate OpenAPI spec:', e)
    process.exit(1)
})
