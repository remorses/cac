# MCP: Use markdown for CMS rich text fields

## Status
Ready to implement

## Summary
Update MCP's CMS tools to use markdown directly for `formattedText` fields instead of requiring HTML.

## Background
The current documentation in `plugin-mcp/src/App.tsx:44` says:
```typescript
formattedText: 'JSON string - HTML content (e.g., "<p>Rich text</p>")'
```

### New in framer-plugin 3.10.3
```typescript
ContentType = "auto" | "markdown" | "html"
```

The `FormattedTextFieldDataEntryInput` now accepts:
```typescript
{
    type: "formattedText";
    value: string;
    contentType?: "auto" | "markdown" | "html"; // defaults to "html"
}
```

## Implementation

### Changes needed

1. **Update `plugin-mcp/src/App.tsx` field type documentation**
   ```typescript
   formattedText: 'JSON string - Rich text content. Supports markdown (default) or HTML. Use contentType field to specify format.',
   ```

2. **Update `plugin-mcp/src/lib/cms.ts` mapValueToFieldValue**
   ```typescript
   if (field.type === 'formattedText') {
       return { 
           type: 'formattedText', 
           value: String(value) || '',
           contentType: 'markdown', // Default to markdown for better LLM compatibility
       }
   }
   ```

3. **Update `upsertCMSItem` tool schema**
   - Document that `formattedText` fields now accept markdown by default
   - Optionally allow specifying contentType per field

## Files to modify

### `plugin-mcp/src/App.tsx`
- Line ~44: Update `CMS_FIELD_TYPE_COMMENTS` for `formattedText` to mention markdown support
- Change: `'JSON string - HTML content...'` → `'JSON string - Markdown or HTML content. Defaults to markdown.'`

### `plugin-mcp/src/lib/cms.ts`
- Line ~43-45: Update `mapValueToFieldValue` for formattedText type
- Add `contentType: 'markdown'` to the returned object

### `plugin-mcp/src/lib/schema.ts`
- Update `upsertCMSItem` tool description to document markdown support
- Mention that `formattedText` fields now accept markdown by default

### `plugin-mcp/src/App.tsx` (cleanCMSFieldValue function)
- Line ~130-135: Update formattedText case to preserve/set contentType if needed
