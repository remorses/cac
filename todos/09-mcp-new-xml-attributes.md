# MCP: Add new XML attributes (z-index, overflow, text truncation)

## Status
Ready to implement

## Summary
Add support for new node attributes in MCP's XML handling: `zIndex`, `overflow`, `overflowX`, `overflowY`, and `textTruncation`.

## New attributes in framer-plugin 3.10.3

### WithZIndexTrait
```typescript
interface WithZIndexTrait {
    readonly zIndex: number | null;
}
```

### WithOverflowTrait
```typescript
interface WithOverflowTrait {
    readonly overflow: Overflow | null;      // "visible" | "hidden" | "auto" | "clip"
    readonly overflowX: AxisOverflow | null; // same values
    readonly overflowY: AxisOverflow | null; // same values
}
```

### WithTextTruncationTrait
```typescript
interface WithTextTruncationTrait {
    readonly textTruncation: number | null; // line clamp value
}
```

## Implementation

### 1. Update schema documentation in `plugin-mcp/src/lib/schema.ts`

Add to the attribute documentation section:
```typescript
// Z-Index (stacking order)
// zIndex: number | null - CSS z-index for stacking order

// Overflow
// overflow: "visible" | "hidden" | "auto" | "clip" - How content overflow is handled
// overflowX: same values, horizontal axis only
// overflowY: same values, vertical axis only

// Text Truncation
// textTruncation: number | null - Number of lines before truncating with ellipsis (line-clamp)
```

### 2. Update XML generation in `plugin-mcp/src/lib/xml.ts`

Add attribute extraction for new traits:
```typescript
// In framerLayersTreeToXml or related function
if (node.zIndex != null) {
    attrs.zIndex = node.zIndex
}
if (node.overflow != null) {
    attrs.overflow = node.overflow
}
if (node.overflowX != null) {
    attrs.overflowX = node.overflowX
}
if (node.overflowY != null) {
    attrs.overflowY = node.overflowY
}
if (node.textTruncation != null) {
    attrs.textTruncation = node.textTruncation
}
```

### 3. Update XML parsing in `applyAttributes` function

In `plugin-mcp/src/lib/framer.ts`:
```typescript
// Handle new attributes when applying from XML
if ('zIndex' in attributes) {
    await node.setAttributes({ zIndex: attributes.zIndex })
}
if ('overflow' in attributes) {
    await node.setAttributes({ overflow: attributes.overflow })
}
// ... etc for overflowX, overflowY, textTruncation
```

### 4. Update type guards

Use the new helper functions:
```typescript
import { supportsZIndex, supportsOverflow, supportsTextTruncation } from 'framer-plugin'

if (supportsZIndex(node)) {
    // node.zIndex is available
}
```

## Supported node types

Based on the `.d.ts`:
- **zIndex**: FrameNode, TextNode
- **overflow**: FrameNode, TextNode
- **textTruncation**: TextNode only

## Files to modify

### `plugin-mcp/src/lib/schema.ts`
- Line ~143-363: Add new attributes to the documentation section in `getProjectXml`
- Document zIndex, overflow, overflowX, overflowY, textTruncation with types and descriptions

### `plugin-mcp/src/lib/xml.ts`
- `framerLayersTreeToXml` function: Add extraction of new attributes from nodes
- Add conditions to include zIndex, overflow, overflowX, overflowY, textTruncation in XML output
- `extractObjectsFromXmlContent` function: Parse new attributes from XML input

### `plugin-mcp/src/lib/framer.ts`
- `applyAttributes` function: Handle setting new attributes on nodes
- Add cases for zIndex, overflow, overflowX, overflowY, textTruncation
- Use `supportsZIndex()`, `supportsOverflow()`, `supportsTextTruncation()` type guards

### `plugin-mcp/src/lib/schema.ts` (types)
- May need to update any TypeScript types for node attributes if manually defined
