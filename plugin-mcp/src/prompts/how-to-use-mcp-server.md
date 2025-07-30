# Framer MCP Tools Guide

This guide explains how to interact with Framer projects using MCP (Model Context Protocol) tools.

## Overview

The MCP tools allow you to:
- Navigate and inspect Framer project structure
- Read and modify node properties via XML
- Update text content and styling
- Manage project-wide styles (colors, text styles)
- Search and apply fonts
- Delete and duplicate nodes

## Getting Started

Always begin by calling `getProjectXml` to understand the project structure. This returns an XML tree showing all pages and components with their IDs, which you'll use for subsequent operations.

To check if the project is published and get its public URL, use `getProjectWebsiteUrl`.

## Working with Nodes

Framer projects consist of nodes (pages, components, frames, text, etc.) that can be inspected and modified through XML. Each node has a unique `nodeId` that identifies it throughout the system.

To work with nodes:
1. Get the current state using `getNodeXml` or `getSelectedNodesXml`
2. Modify the XML with desired changes
3. Apply changes using `updateXmlForNode`

## XML Attribute Formats

### Dimensions and Units

Dimension values use CSS units:
- **Pixels**: `"100px"` - Fixed sizes
- **Percentage**: `"50%"` - Relative to parent
- **Viewport**: `"100vh"` or `"100vw"` - Viewport units
- **Fraction**: `"1fr"` - Flexible grid unit
- **Fit Content**: `"fit-content"` - Auto-sizing
- **Rem/Em**: `"1.5rem"` or `"2em"` - Relative units

### Common Attributes

Nodes support various attributes:
- **Visibility**: opacity (0-1), visible (true/false), locked (true/false)
- **Positioning**: position (relative/absolute/fixed), top/right/bottom/left (pixels), centerX/centerY (percentage)
- **Sizing**: width/height (various units), min/max constraints (pixels), aspectRatio (number)
- **Styling**: borderRadius, backgroundColor, backgroundImage, imageRendering
- **Text**: font (selector format like "GF;Inter-400"), inlineTextStyle (project style path)
- **Links**: link (URL or path), linkOpenInNewTab (true/false)

### Style References

Project styles are referenced by paths starting with `/`:
- Text Styles: `"/Heading xl"`, `"/Body md"`
- Color Styles: `"/Primary/Blue"`, `"/Background/Secondary"`

## Component Instances

Component instances are references to reusable components. They have:
- A `nodeId` identifying the specific instance
- A `componentId` linking to the component definition
- Control attributes that can be customized per instance
- Standard node attributes (width, height, position, etc.)

### Inserting Components

To add a component to the canvas:
1. Use `getComponentInsertUrlAndTypes` with an ID (either a component node ID or code file ID) to get the insertUrl and available props
2. Use `insertComponentInCanvas` with the insertUrl to add the component to the currently focused page/component
3. Use `updateXmlForNode` to position and configure the newly inserted component instance, using the props from step 1 as XML attributes

### Updating Components vs Instances

**Instance updates**: Modify the specific instance's attributes or control values. Changes affect only that instance.

**Component definition updates**: Use the `componentId` to get and update the component itself. Changes automatically propagate to ALL instances throughout the project.

This distinction is crucial - updating a component definition is a powerful operation that affects every instance of that component.

### Replica Nodes (Variants)

When calling `getNodeXml` on a replica node (variant), children are automatically hidden to avoid confusion. The tool will also return a warning message recommending to update the original component instead. 

In the XML, replica nodes will have a special comment in their attributes:

```xml
<ReplicaNode
    <!-- To see these nodes values and override some of them for this variant, call getNodeXml on this nodeId -->
    nodeId="xyz456">
</ReplicaNode>
```

This behavior applies to both root replica nodes and any child nodes that are replicas. When traversing the tree, replica nodes themselves ARE included in the output (with the special comment), but their children are not. This means you'll see the replica node in the XML tree, but it will appear as a leaf node without any children. This helps prevent accidentally modifying the wrong nodes and guides you to inspect child nodes individually when working with variants. Remember: updating the original component is usually the better approach as changes will propagate to all variants automatically.

## Fonts

Framer provides access to over 8000 fonts. Use `searchFonts` to find fonts by searching their selector string. The returned `selector` value is what you use in the `font` attribute.

**Important**: Text nodes can use EITHER `inlineTextStyle` (project text style) OR `font` (custom font), not both. Remove `inlineTextStyle` before applying a custom font.

## Project Styles

Project styles provide consistent design tokens across your project:

### Color Styles
- Referenced by paths like `/Primary/Blue`
- Support light and dark theme variants
- Can be created or updated globally using `manageColorStyle`

### Text Styles
- Referenced by paths like `/Heading xl`
- Include typography properties (size, line height, spacing, etc.)
- Can be created or updated globally using `manageTextStyle`

Use `getProjectColorStyles` and `getProjectTextStyles` to discover available styles.

### Managing Styles

Use `manageColorStyle` and `manageTextStyle` to create or update styles. The display name is automatically derived from the path:

```typescript
// Create a color style
// Path "/Brand/Primary" creates a style named "Primary" in the "Brand" folder
await mcp.manageColorStyle({
  type: "create",
  stylePath: "/Brand/Primary",
  properties: {
    light: "rgb(45, 123, 255)",
    dark: "rgb(23, 87, 214)"
  }
})

// Update an existing color style
await mcp.manageColorStyle({
  type: "update",
  stylePath: "/Brand/Primary",
  properties: {
    dark: "rgb(30, 90, 200)"  // Only update the dark variant
  }
})

// Create a text style
// Path "/Typography/Heading/H1" creates a style named "H1" in the "Typography/Heading" folder
await mcp.manageTextStyle({
  type: "create",
  stylePath: "/Typography/Heading/H1",
  properties: {
    fontSize: "32px",
    lineHeight: "40px",
    letterSpacing: "-0.02em",
    font: "GF;Inter-700"
  }
})

// Update an existing text style
await mcp.manageTextStyle({
  type: "update",
  stylePath: "/Typography/Heading/H1",
  properties: {
    fontSize: "36px"  // Only update the font size
  }
})
```

**Notes**: 
- The Framer API derives the style name from the last segment of the path. You cannot specify a custom name separately.
- When creating color styles, the `light` property is required.
- When updating styles, only include the properties you want to change.

## Node Operations

### Deleting Nodes

Use `deleteNode` to permanently remove a node and all its children from the project:
- **Irreversible**: This action cannot be undone
- **Protected nodes**: Cannot delete root frames of components or pages
- **Cascading**: Deletes the node and ALL child nodes

### Duplicating Nodes

Use `duplicateNode` to create an exact copy of a node:
- **Complete copy**: Duplicates the node and all its children
- **Positioning**: Duplicated nodes are placed as siblings, slightly offset if visual
- **Returns new ID**: The tool returns the ID of the newly created node

## Best Practices

1. **Start with `getProjectXml`** to understand the project structure
2. **Inspect before modifying** - Use `getNodeXml` to see current state
3. **Preserve existing attributes** - Only include attributes you want to change
4. **Use project styles** - Reference style paths instead of hardcoded values
5. **Include nodeId attributes** - Essential for targeting specific nodes
6. **Work with user selection** - Use `getSelectedNodesXml` for context-aware operations
7. **Be cautious with deletion** - `deleteNode` is permanent and cannot be undone
8. **Check duplicate results** - Use the returned ID to inspect or further modify duplicated nodes

## Key Concepts

### XML Structure
- Nodes are represented as XML elements with attributes
- Text content goes inside text nodes
- The `nodeId` attribute identifies specific nodes
- Only include attributes you want to change - others are preserved

### Common Patterns
- **Responsive sizing**: Use percentages, max-width constraints, or viewport units
- **Positioning**: Combine position type with directional attributes
- **Typography**: Use either project text styles or custom fonts (not both)
- **Styling**: Reference project color styles or use direct color values

The XML format is designed to be intuitive and forgiving, making it easy to make targeted updates without affecting unintended properties.
