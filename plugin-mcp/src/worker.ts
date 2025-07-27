import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { McpAgent } from 'agents/mcp'
import { implementMcpTools } from './lib/mcp'

export class MyMCP extends McpAgent<Env> {
    server = new Server({
        name: 'Authless Calculator',
        version: '1.0.0',
    })
    async init() {
        const env = this.env
        const websocketId = env.websocketId
        await implementMcpTools({ websocketId, server: this.server })
    }
}

type Env = {
    MY_MCP: MyMCP
    websocketId?: string
}

export default {
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url)
        const websocketId = url.searchParams.get('id') as string | undefined
        env.websocketId = websocketId
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
