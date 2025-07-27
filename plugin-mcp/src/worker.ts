import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { McpAgent } from 'agents/mcp'
import { implementMcpTools } from './lib/mcp'

export class MyMCP extends McpAgent {
    server = new Server({
        name: 'Authless Calculator',
        version: '1.0.0',
    })
    async init() {
        const env = this.env

        await implementMcpTools({ server: this.server })
    }
}

type Env = {
    MY_MCP: MyMCP
}

export default {
    fetch(request: Request, env: Env, ctx: ExecutionContext) {
        const url = new URL(request.url)

        if (url.pathname === '/sse' || url.pathname === '/sse/message') {
            return MyMCP.serveSSE('/sse').fetch(request, env, ctx)
        }

        if (url.pathname === '/mcp') {
            return MyMCP.serve('/mcp').fetch(request, env, ctx)
        }

        return new Response('Not found', { status: 404 })
    },
}
