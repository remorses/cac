import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createMCPClient } from './mcp-client.js'

const mcpUrl = 'https://mcp.unframer.co/mcp?id=x8v9d9x1ool'

describe('Framer MCP Server Tests', () => {
    let callTool: Awaited<ReturnType<typeof createMCPClient>>['callTool']
    let cleanup: (() => Promise<void>) | null = null

    beforeAll(async () => {
        const result = await createMCPClient({
            mcpUrl,
            clientName: 'framer-test',
        })
        callTool = result.callTool
        cleanup = result.cleanup
    })

    afterAll(async () => {
        if (cleanup) {
            await cleanup()
            cleanup = null
        }
    })

    it('should get project XML', async () => {
        const result = await callTool({
            name: 'getProjectXml',
            args: undefined,
        })

        expect(result.content).toBeDefined()
        expect(result.content).toMatchInlineSnapshot()
    })
})

function tryJsonParse(str: string) {
    try {
        return JSON.parse(str)
    } catch {
        return str
    }
}
