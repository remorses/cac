# MCP: Use hideUI for background operation

## Status
Ready to implement

## Summary
Use `framer.hideUI()` to let the MCP plugin run in the background while users work in Framer.

## Background
The MCP plugin currently shows its UI when running. For MCP operations, the plugin UI isn't needed - it just needs the websocket connection active.

The API already exists:
```typescript
framer.hideUI(): void
```

## Implementation

### Changes needed

1. **Call hideUI after websocket connection is established**
   
   In `plugin-mcp/src/App.tsx`, after the websocket connects:
   ```typescript
   // After successful websocket connection
   await framer.hideUI()
   ```

2. **Add option to start minimized**
   - Could add a "Run in Background" button in the UI
   - Or automatically hide after a brief delay showing connection status

3. **Consider showing UI on errors**
   - If connection fails, show UI with error message
   - Use `framer.showUI()` to bring back the UI when needed

### Example flow
```typescript
// In websocket connection setup
websocketClientHandling({
    onConnect: async () => {
        // Show brief success notification
        framer.notify('MCP connected', { variant: 'success' })
        // Hide UI to run in background
        await framer.hideUI()
    },
    onError: async (error) => {
        // Show UI with error
        await framer.showUI()
        framer.notify(`Connection error: ${error.message}`, { variant: 'error' })
    }
})
```

## Files to modify

### `plugin-mcp/src/App.tsx`
- Find websocket connection success handler (around `websocketClientHandling` usage)
- Add `await framer.hideUI()` after successful connection
- Add error handling to show UI again on connection failure

### `plugin-mcp/src/lib/plugin-websocket.ts`
- Check if `websocketClientHandling` has onConnect/onError callbacks
- May need to add hooks for hide/show UI logic

### `plugin-mcp/src/lib/store.ts`
- Optionally add `autoHideUI` preference to store state
- Allow users to toggle background mode behavior

### `plugin-mcp/src/index.ts`
- Check if there's initialization logic that should call hideUI
