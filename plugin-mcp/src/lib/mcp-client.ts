import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import type { McpCallParam, McpToolNames, mcpTools } from './types'
import z from 'zod'

export interface CreateTransportOptions {
    clientName?: string
    mcpUrl: string
}

export async function createTransport(
    options: CreateTransportOptions,
): Promise<{
    transport: Transport
}> {
    const sseUrl = new URL(options.mcpUrl)
    const transport = new SSEClientTransport(sseUrl)
    return {
        transport,
    }
}

export async function createMCPClient(options: CreateTransportOptions) {
    const client = new Client({
        name: options?.clientName ?? 'test',
        version: '1.0.0',
    })

    const { transport } = await createTransport(options)

    await client.connect(transport)

    await client.ping()

    const cleanup = async () => {
        try {
            await client.close()
        } catch (e) {
            console.error('Error during MCP client cleanup:', e)
        }
    }

    function callTool({ args, name }: McpCallParam): any {
        return client.callTool({ name, arguments: args })
    }

    return {
        client,
        callTool,
        cleanup,
    }
}
