# Framer MCP Tools Guide

This guide explains how to interact with Framer projects using MCP (Model Context Protocol) tools.

## Overview

The MCP tools allow you to:
- Navigate and inspect Framer project structure
- Read and modify node properties via XML
- Update text content and styling
- Manage project-wide styles (colors, text styles)
- Search and apply fonts

## Getting Started

Always begin by calling `getProjectXml` to understand the project structure. This returns an XML tree showing all pages and components with their IDs, which you'll use for subsequent operations.

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

### Updating Components vs Instances

**Instance updates**: Modify the specific instance's attributes or control values. Changes affect only that instance.

**Component definition updates**: Use the `componentId` to get and update the component itself. Changes automatically propagate to ALL instances throughout the project.

This distinction is crucial - updating a component definition is a powerful operation that affects every instance of that component.

## Fonts

Framer provides access to over 8000 fonts. Use `searchFonts` to find fonts by searching their selector string. The returned `selector` value is what you use in the `font` attribute.

**Important**: Text nodes can use EITHER `inlineTextStyle` (project text style) OR `font` (custom font), not both. Remove `inlineTextStyle` before applying a custom font.

## Project Styles

Project styles provide consistent design tokens across your project:

### Color Styles
- Referenced by paths like `/Primary/Blue`
- Support light and dark theme variants
- Can be updated globally using `updateColorStyle`

### Text Styles
- Referenced by paths like `/Heading xl`
- Include typography properties (size, line height, spacing, etc.)
- Can be updated globally using `updateTextStyle`

Use `getProjectColorStyles` and `getProjectTextStyles` to discover available styles.

## Best Practices

1. **Start with `getProjectXml`** to understand the project structure
2. **Inspect before modifying** - Use `getNodeXml` to see current state
3. **Preserve existing attributes** - Only include attributes you want to change
4. **Use project styles** - Reference style paths instead of hardcoded values
5. **Include nodeId attributes** - Essential for targeting specific nodes
6. **Work with user selection** - Use `getSelectedNodesXml` for context-aware operations

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