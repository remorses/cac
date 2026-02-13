# MCP: Replace /sse with /mcp endpoint

## Status
Ready to implement

## Summary
Update the plugin UI to show the `/mcp` HTTP endpoint URL instead of the legacy `/sse` SSE endpoint.

## Background
The worker already has both endpoints implemented:
- `/sse` and `/sse/message` - Legacy SSE-based MCP transport
- `/mcp` - HTTP streamable transport (preferred)

Both use query-based auth (`?id=xxx&secret=xxx`).

## Implementation

### Changes needed

1. **Update URL displayed in plugin UI**
   - Find where the MCP connection URL is shown to users
   - Replace `/sse` with `/mcp` in the displayed URL

2. **Verify `/mcp` endpoint works correctly**
   - Test with Claude Desktop or other MCP clients
   - Ensure auth flow works the same way

## Files to modify

### `plugin-mcp/src/App.tsx`
- Find where MCP URL is displayed to users (search for `/sse` or endpoint URL construction)
- Replace `/sse` path with `/mcp` in the displayed URL

### `plugin-mcp/src/lib/utils.ts`
- Check if there's a constant or function that builds the MCP endpoint URL
- Update any hardcoded `/sse` references to `/mcp`

### `plugin-mcp/src/worker.ts`
- No changes needed - both endpoints already exist
- `/sse` routes at lines ~750-771
- `/mcp` route already implemented
