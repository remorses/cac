before any chat in the plugin-mcp folder run the commands
- `tree`, to get the folder files in a tree format and know what files are in the project
- read src/schema.ts to understand the MCP tools schema


# Framer MCP Plugin Architecture

This folder contains both the Framer plugin client code and the Cloudflare Worker MCP server implementation. The system enables MCP (Model Context Protocol) integration with Framer, allowing AI assistants to interact with Framer projects.

The most important code is in `src/App.tsx` in the `websocketClientHandling` `handle` callback. this is where the actual MCP implementation is done.

To understand framer-plugin package api read `plugin-mcp/node_modules/framer-plugin/dist/index.d.ts`

After making MCP API changes always update `src/prompt.md` with the new API. try to keep it short.

When running tests always run them with `-u` to update snapshot, then see what are the differences of the snapshots with `git diff src/lib/snapshots` and make sure they are what you expect. If not, fix the code to make sure the tests output are what you expect.

## Architecture Overview

The system consists of three main components:

### 1. **Framer Plugin (Tunnel Upstream)**
- Lives inside the Framer app as a plugin
- Implements MCP tool handlers that perform actions on Framer using the Framer Plugin API
- Connects to the WebSocket tunnel as the upstream connection (only one plugin can be connected per user)
- Entry point: `src/App.tsx` and `src/main.tsx`

### 2. **MCP Server (Tunnel Client)**
- Runs on Cloudflare Workers at `mcp.unframer.co`
- Implements the MCP protocol using the `@modelcontextprotocol/sdk` and `agents` npm package
- Connects to the WebSocket tunnel as a client (multiple MCP servers can connect to the same plugin)
- Exposes endpoints:
  - `/sse` and `/sse/message` - For SSE-based MCP communication
  - `/mcp` - Standard MCP endpoint
- Entry point: `src/worker.ts`

### 3. **WebSocket Tunnel (Cloudflare Worker)**
- Creates a bidirectional connection between MCP servers and the Framer plugin
- Uses the Framer user ID as the connection identifier (consistent across all projects for the same user)
- Endpoints:
  - `wss://unframer.co/_tunnel/upstream?id={userId}` - Used by the Framer plugin (only one allowed per user)
  - `wss://unframer.co/_tunnel/client?id={userId}` - Used by MCP servers (multiple allowed)

## How It Works

1. **Initialization**:
   - User logs into the Framer plugin with Google OAuth
   - Plugin retrieves the Framer user ID using `framer.getCurrentUser()`
   - Plugin connects to the WebSocket tunnel as upstream using the user ID
   - User copies the MCP server URL with their user ID: `https://mcp.unframer.co/sse?id={userId}`
   - User configures their MCP client (Claude app/code) with this URL
   - The MCP URL remains consistent across all Framer projects for the same user

2. **MCP Request Flow**:
   - MCP client (Claude, Cline, etc.) sends a tool request to the Cloudflare Worker
   - Worker connects to the WebSocket tunnel as a client using the user ID
   - Worker forwards the request through the tunnel to the Framer plugin
   - Plugin executes the tool using Framer Plugin APIs
   - Plugin sends the response back through the tunnel
   - Worker returns the response to the MCP client

3. **Connection Management**:
   - Only one Framer plugin can be connected per user ID (upstream connection)
   - Multiple MCP servers can connect to the same plugin (client connections)
   - If a second plugin tries to connect with the same user ID, it receives error code 4009
   - The plugin displays an error message instructing the user to close other plugin instances

4. **Authentication**:
   - Uses the Framer user ID as the connection identifier
   - Plugin must be authenticated via Google OAuth before connecting
   - The user ID ensures the MCP URL is consistent and tied to the user, not individual projects

## Available MCP Tools

The system implements these MCP tools (defined in `src/lib/schema.ts`):

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
- `src/lib/mcp-tools.ts` - MCP tool definitions and server setup
- `src/lib/client-websocket.ts` - WebSocket client handling for Framer plugin
- `src/lib/websocket-server.ts` - WebSocket worker handling

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

## Framer Theme Styling

The plugin uses Framer's built-in CSS variables for consistent theming that adapts to light/dark modes. These are configured in `tailwind.config.mjs`:

### Color Classes

**Text Colors:**
- `text-framer-primary` - Primary text color (--framer-color-text)
- `text-framer-secondary` - Secondary text color (--framer-color-text-secondary)
- `text-framer-tertiary` - Tertiary text color (--framer-color-text-tertiary)
- `text-framer-inverted` - Inverted text color (--framer-color-text-inverted)
- `text-framer-tint` - Tint/accent color (--framer-color-tint)

**Background Colors:**
- `bg-framer-primary` - Primary background (--framer-color-bg)
- `bg-framer-secondary` - Secondary background (--framer-color-bg-secondary)
- `bg-framer-tertiary` - Tertiary background (--framer-color-bg-tertiary)
- `bg-framer-divider` - Divider background (--framer-color-divider)
- `bg-framer-tint` - Tint/accent background (--framer-color-tint)
- `bg-framer-tintDimmed` - Dimmed tint background (--framer-color-tint-dimmed)
- `bg-framer-tintDark` - Dark tint background (--framer-color-tint-dark)

**Border Colors:**
- `border-framer-divider` - Divider border color (--framer-color-divider)

### Usage Examples

**Buttons:**
```tsx
// Primary button (uses Framer's built-in class)
<button className='framer-button-primary'>
    Click me
</button>

// Secondary button with hover state
<button className='px-3 py-2 hover:bg-framer-tertiary rounded border border-framer-divider transition-colors'>
    Secondary Action
</button>
```

**Input Fields:**
```tsx
<input
    className='px-3 py-2 text-xs rounded bg-framer-tertiary text-framer-primary border border-framer-divider'
    type='text'
/>
```

**Cards/Containers:**
```tsx
<div className='p-4 bg-framer-primary border border-framer-divider rounded'>
    <h2 className='text-framer-primary font-medium'>Title</h2>
    <p className='text-framer-secondary'>Description text</p>
</div>
```

**Status Indicators:**
```tsx
// Connection status badge
<CircleIcon className={`size-2 fill-current ${isConnected ? 'text-green-500' : 'text-orange-500'}`} />
```

### Best Practices

1. Always use Framer theme colors instead of hardcoded colors (e.g., use `text-framer-secondary` instead of `text-gray-600`)
2. Add `transition-colors` class for smooth hover effects
3. Use appropriate semantic colors (primary for main content, secondary for supporting text, tertiary for disabled/muted states)
4. The `framer-button-primary` class provides complete button styling consistent with Framer's design system
5. All theme colors automatically adapt to light/dark mode based on Framer's theme setting
