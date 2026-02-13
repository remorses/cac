# GitHub Sync: Use markdown instead of HTML

## Status
Ready to implement

## Summary
Change GitHub Sync to pass markdown content directly to Framer's `formattedText` fields instead of converting to HTML first.

## Background
Previously, Framer's `formattedText` field only accepted HTML. The server-side code converted markdown to HTML before syncing.

### New in framer-plugin 3.10.3
The `FormattedTextFieldDataEntryInput` now supports a `contentType` field:
```typescript
{
    type: "formattedText";
    value: string;
    contentType?: "auto" | "markdown" | "html"; // defaults to "html"
}
```

## Implementation

### Changes needed

1. **Update `plugin-github-sync/src/routes/Sync.tsx`**
   
   Change from:
   ```typescript
   [CollectionFieldIds.content]: {
       value: item.html,
       type: 'formattedText',
   }
   ```
   
   To:
   ```typescript
   [CollectionFieldIds.content]: {
       value: item.markdown, // raw markdown content
       type: 'formattedText',
       contentType: 'markdown',
   }
   ```

2. **Update server-side API** (if needed)
   - The `syncGithub` endpoint may need to return raw markdown instead of (or in addition to) HTML
   - Check `pluginApiClient.api.plugins.markdownPlugin.syncGithub`

## Files to modify

### `plugin-github-sync/src/routes/Sync.tsx`
- Line ~117-120: Change `item.html` to `item.markdown` (or keep raw content)
- Add `contentType: 'markdown'` to the fieldData object

### `website/src/lib/api-routes/plugins/markdownPlugin/syncGithub.ts` (or similar)
- Check if server already returns raw markdown in addition to HTML
- If not, add `markdown` field to response alongside `html`
- Or remove HTML conversion entirely if markdown is now preferred

### `plugin-github-sync/src/routes/MapFields.tsx`
- Line ~507: Check if `formattedText` field type handling needs updates
- May need to document that content is now markdown format
