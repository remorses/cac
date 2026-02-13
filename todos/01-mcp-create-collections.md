# MCP: Add support to create CMS collections

## Status
Ready to implement

## Summary
Add a new MCP tool to create CMS collections. Previously this was not possible via the plugin API.

## Implementation

### New API available in framer-plugin 3.10.3
```typescript
framer.createManagedCollection(name: string): Promise<ManagedCollection>
```

### Changes needed

1. **Add new tool in `plugin-mcp/src/lib/schema.ts`**
   - Add `createCMSCollection` to `McpToolNames`
   - Add tool schema with `name` parameter

2. **Add handler in `plugin-mcp/src/App.tsx`**
   ```typescript
   case 'createCMSCollection': {
       const { name } = input
       const collection = await framer.createManagedCollection(name)
       return `Created collection "${name}" with ID: ${collection.id}`
   }
   ```

3. **Update `getProjectXml` documentation**
   - Remove the note saying collections cannot be created
   - Document the new `createCMSCollection` tool

## Files to modify

### `plugin-mcp/src/lib/schema.ts`
- Add `'createCMSCollection'` to `McpToolNames` type union
- Add tool definition to `getMcpTools()` function with name, description, inputSchema

### `plugin-mcp/src/App.tsx`
- Add case handler in `websocketHandler` switch statement (~line 431)
- Call `framer.createManagedCollection(name)` and return success message with collection ID

### `plugin-mcp/src/lib/schema.ts` (documentation)
- Update `getCMSCollections` tool description to mention `createCMSCollection` exists
- Remove any notes saying "you cannot create a CMS collection"
