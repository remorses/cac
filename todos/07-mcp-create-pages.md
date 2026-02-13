# MCP: Add support to create web and design pages

## Status
Ready to implement

## Summary
Add MCP tools to create new pages in Framer projects.

## Background
Previously the MCP could only work with existing pages. Now framer-plugin 3.10.3 adds:

```typescript
// Create a design page (for components, prototypes)
framer.createDesignPage(pageName: string): Promise<DesignPageNode>

// Example from docs:
const designPage = await framer.createDesignPage("About")
```

Note: `WebPageNode` (published web pages) creation may still require using the Framer UI, but `DesignPageNode` can be created programmatically.

## Implementation

### Changes needed

1. **Add new tool in `plugin-mcp/src/lib/schema.ts`**
   ```typescript
   // Add to McpToolNames
   'createDesignPage'
   
   // Tool schema
   {
       name: 'createDesignPage',
       description: 'Create a new design page in the project',
       inputSchema: {
           type: 'object',
           properties: {
               name: {
                   type: 'string',
                   description: 'Name for the new design page'
               }
           },
           required: ['name']
       }
   }
   ```

2. **Add handler in `plugin-mcp/src/App.tsx`**
   ```typescript
   case 'createDesignPage': {
       const { name } = input
       const page = await framer.createDesignPage(name)
       return `Created design page "${name}" with ID: ${page.id}`
   }
   ```

3. **Update `getProjectXml` to list DesignPageNodes**
   - Add `DesignPageNode` to the pages section
   - Use `framer.getNodesWithType('DesignPageNode')`

## Files to modify

### `plugin-mcp/src/lib/schema.ts`
- Add `'createDesignPage'` to `McpToolNames` type union
- Add tool definition to `getMcpTools()` with name, description, inputSchema
- Update `getProjectXml` tool to mention DesignPageNode in documentation

### `plugin-mcp/src/App.tsx`
- Add case handler in `websocketHandler` switch statement
- Call `framer.createDesignPage(name)` and return success with page ID
- Line ~486: Update `getProjectXml` handler to also fetch DesignPageNodes
- Add: `const designPages = await framer.getNodesWithType('DesignPageNode')`

### `plugin-mcp/src/lib/xml.ts`
- May need to handle `DesignPageNode` in XML generation if not already supported
- Check `framerLayersTreeToXml` function
