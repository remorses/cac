# Framer MCP Plugin Architecture

This folder contains both the Framer plugin client code and the Cloudflare Worker MCP server implementation. The system enables MCP (Model Context Protocol) integration with Framer, allowing AI assistants to interact with Framer projects.

## Architecture Overview

The system consists of three main components:

### 1. **Framer Plugin (Client)**
- Lives inside the Framer app as a plugin
- Implements MCP tool handlers that perform actions on Framer using the Framer Plugin API
- Connects to a WebSocket tunnel to receive MCP tool requests
- Entry point: `src/App.tsx` and `src/main.tsx`

### 2. **MCP Server (Cloudflare Worker)**
- Runs on Cloudflare Workers at `mcp.unframer.co`
- Implements the MCP protocol using the `@modelcontextprotocol/sdk` and `agents` npm package
- Exposes endpoints:
  - `/sse` and `/sse/message` - For SSE-based MCP communication
  - `/mcp` - Standard MCP endpoint
- Entry point: `src/worker.ts`

### 3. **WebSocket Tunnel (Cloudflare Worker)**
- Creates a bidirectional connection between the MCP server and Framer plugin
- Uses a unique ID to match the server and client connections
- Endpoints:
  - `wss://unframer.co/_tunnel/upstream?id={websocketId}` - Used by MCP server
  - `wss://unframer.co/_tunnel/client?id={websocketId}` - Used by Framer plugin

## How It Works

1. **Initialization**:
   - The Framer plugin generates a unique `websocketId` (or reuses an existing one)
   - Plugin connects to the WebSocket tunnel as a client
   - User copies the MCP server URL with the websocketId: `https://mcp.unframer.co/sse?id={websocketId}`
   - User configures their MCP client (Claude app/code) with this URL

2. **MCP Request Flow**:
   - MCP client sends a tool request to the Cloudflare Worker
   - Worker forwards the request through the WebSocket tunnel to the Framer plugin
   - Plugin executes the tool using Framer Plugin APIs
   - Plugin sends the response back through the tunnel
   - Worker returns the response to the MCP client

3. **Authentication**:
   - Currently uses the unique `websocketId` as the authentication mechanism
   - The ID must match between the MCP URL and the Framer plugin connection

## Available MCP Tools

The system implements these MCP tools (defined in `src/lib/types.ts`):

1. **GetPublishedURL** - Returns staging & production publish information
2. **FetchHTML** - Downloads raw HTML from a public URL
3. **GetSelectedNodeIds** - Gets IDs of currently selected nodes in Framer
4. **SetNodeAttributes** - Bulk-sets style/layout attributes on a node
5. **ApplyColorStyle** - Applies color styling (via style link or inline)
6. **InsertComponentInstance** - Inserts a code component via its URL
7. **ExportReactComponents** - Returns CLI command to export components as React

## Key Files

- `src/App.tsx` - Framer plugin UI and WebSocket client setup
- `src/worker.ts` - Cloudflare Worker MCP server implementation
- `src/lib/mcp.ts` - MCP tool definitions and server setup
- `src/lib/client-websocket.ts` - WebSocket client handling for Framer plugin
- `src/lib/websocket.ts` - WebSocket message handling utilities
- `src/lib/types.ts` - TypeScript types and enums
- `wrangler.jsonc` - Cloudflare Worker configuration
- `framer.json` - Framer plugin manifest

## Development

- `pnpm dev` - Runs the Framer plugin in development mode with Vite
- `pnpm build` - Builds both the plugin and worker for production
- `pnpm deployment` - Deploys the worker to Cloudflare

## Technical Details

- Uses Vite for building the Framer plugin
- Uses TypeScript throughout
- Implements proper WebSocket reconnection and error handling
- Includes ping/pong mechanism to keep connections alive
- Supports request/response correlation via message IDs
- Implements timeout handling for MCP requests (default 5 seconds)