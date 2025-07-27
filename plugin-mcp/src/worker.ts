import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { McpAgent } from 'agents/mcp'
import { implementMcpTools } from './lib/mcp'

export class MyMCP extends McpAgent<Env> {
    server = new Server(
        {
            name: 'Framer MCP',
            version: '1.0.0',
        },
        {
            capabilities: {
                tools: {},
            },
        },
    )

    async init() {
        const env = this.env
        const websocketId = this.props?.websocketId as string
        if (!websocketId)
            throw new Error('websocketId ?id search param is required')
        console.log('Initializing MyMCP with websocketId:', websocketId)
        await implementMcpTools({ websocketId, server: this.server })
    }
}

type Env = {
    MY_MCP: MyMCP
}

export default {
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url)

        const id = url.searchParams.get('id') as string | undefined
        ctx.props = {
            websocketId: id,
        }
        if (url.pathname === '/sse' || url.pathname === '/sse/message') {
            const mcp = MyMCP.serveSSE('/sse')

            return mcp.fetch(request, env, ctx)
        }

        if (url.pathname === '/mcp') {
            return MyMCP.serve('/mcp').fetch(request, env, ctx)
        }

        return new Response('Not found', { status: 404 })
    },
}
