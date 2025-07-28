# Framer MCP Tools - XML Format Guide

This guide explains how to interact with Framer projects using the MCP (Model Context Protocol) tools, focusing on navigating the project structure and updating nodes via XML.

## Getting Started

The first tool you should always call is:

### 1. `getProjectXml`
- **Purpose**: Get the project structure including all pages and components
- **Returns**: XML tree showing pages and components with their IDs
- **Example response**:
```xml
<Project>
  <Pages>
    <Page nodeId="abc123" path="/home" type="WebPageNode" />
    <Page nodeId="def456" path="/about" type="WebPageNode" />
  </Pages>
  <Components>
    <Component nodeId="xyz789" name="Button" type="ComponentNode" />
  </Components>
</Project>
```

## Core Tools

### 2. `getNodeXml`
- **Purpose**: Get detailed XML for a specific node (page or component)
- **Input**: `{ nodeId: "abc123" }`
- **Returns**: Full XML tree with all child nodes and attributes

### 3. `getSelectedNodesXml`
- **Purpose**: Get XML for nodes currently selected in Framer
- **No input required**
- **Returns**: XML tree of selected nodes

### 4. `updateXmlForNode`
- **Purpose**: Update a node's text content or attributes
- **Input**: 
  ```json
  {
    "nodeId": "abc123",
    "xml": "<TextNode nodeId=\"abc123\">New text content</TextNode>"
  }
  ```

### 5. `zoomIntoView`
- **Purpose**: Focus the Framer canvas on a specific node
- **Input**: `{ nodeId: "abc123" }`

## Attribute Format Reference

### Dimensions and Units

All dimension values in XML attributes use CSS units:

- **Pixels**: `"100px"` - Most common for fixed sizes
- **Percentage**: `"50%"` - Relative to parent
- **Viewport**: `"100vh"` or `"100vw"` - Viewport units
- **Fraction**: `"1fr"` - Flexible grid unit
- **Fit Content**: `"fit-content"` - Auto-sizing
- **Rem**: `"1.5rem"` - Relative to root font size
- **Em**: `"2em"` - Relative to current font size

### Common Node Attributes

```xml
<NodeName
    nodeId="unique-id"
    
    <!-- Visibility & Interaction -->
    opacity="1"              <!-- 0 to 1 -->
    visible="true"           <!-- true/false -->
    locked="false"          <!-- true/false -->
    
    <!-- Positioning -->
    position="relative"      <!-- relative/absolute/fixed -->
    top="100px"             <!-- CSSDimension<Pixel> -->
    right="20px"            <!-- CSSDimension<Pixel> -->
    bottom="10px"           <!-- CSSDimension<Pixel> -->
    left="30px"             <!-- CSSDimension<Pixel> -->
    centerX="50%"           <!-- CSSDimension<Percentage> -->
    centerY="50%"           <!-- CSSDimension<Percentage> -->
    
    <!-- Sizing -->
    width="300px"           <!-- Length | fit-content | 100% | 1fr -->
    height="200px"          <!-- Length | fit-content | 100vh -->
    minWidth="100px"        <!-- pixels only -->
    maxWidth="500px"        <!-- pixels only -->
    minHeight="50px"        <!-- pixels only -->
    maxHeight="300px"       <!-- pixels only -->
    aspectRatio="1.5"       <!-- number -->
    
    <!-- Transformation -->
    rotation="45"           <!-- degrees as number -->
    
    <!-- Styling -->
    borderRadius="8px"      <!-- single value or "8px 8px 8px 8px" -->
    backgroundColor="#FF0000"    <!-- hex color or style path -->
    backgroundImage="https://example.com/image.jpg"
    imageRendering="pixelated"   <!-- auto/pixelated/crisp-edges -->
    
    <!-- Links -->
    link="/about"           <!-- URL or page path -->
    linkOpenInNewTab="true" <!-- true/false -->
    
    <!-- Text Styles (TextNode only) -->
    font="GF;Inter-400"     <!-- font selector -->
    inlineTextStyle="/Heading xl"  <!-- project style path -->
>
  Text content goes here
</NodeName>
```

### Style References

Framer uses path-based references for project styles:

- **Text Styles**: Start with `/` like `"/Heading xl"`, `"/Body md"`
- **Color Styles**: Start with `/` like `"/Primary/Blue"`

Example:
```xml
<Heading 
    nodeId="abc123"
    inlineTextStyle="/Heading 2xl"
    backgroundColor="/Brand/Primary"
>
  Welcome to our site
</Heading>
```

### Component Instances

Component instances are references to reusable components. They have a special `componentId` attribute that links to the component definition:

```xml
<Button
    nodeId="comp123"
    componentId="xyz789"    <!-- ID of the component this instance uses -->
    
    <!-- Standard node attributes -->
    width="200px"
    height="48px"
    
    <!-- Component-specific control attributes (customizable per instance) -->
    variant="primary"
    label="Click me"
    isDisabled="false"
/>
```

#### Important: Updating Component Definitions

Component instances can have control attributes that are customizable per instance. However, to update the component definition itself (which affects ALL instances):

1. **Get the component's XML** using the `componentId`:
   ```javascript
   getNodeXml({ nodeId: "xyz789" })  // Use the componentId
   ```

2. **Update the component definition**:
   ```javascript
   updateXmlForNode({
     nodeId: "xyz789",  // The componentId
     xml: `<Component nodeId="xyz789">
       <!-- Your updates to the component structure -->
     </Component>`
   })
   ```

3. **All instances will reflect the changes** - When you update a component definition, every instance of that component throughout the project will automatically inherit the structural changes.

**Example workflow**:
```javascript
// 1. Find a component instance
getSelectedNodesXml()
// Returns: <Button nodeId="instance123" componentId="xyz789" label="Click me" />

// 2. Get the component definition
getNodeXml({ nodeId: "xyz789" })
// Returns the full component structure

// 3. Update the component definition
updateXmlForNode({
  nodeId: "xyz789",
  xml: `<Frame nodeId="xyz789">
    <Text nodeId="abc" inlineTextStyle="/Body md">Updated component structure</Text>
  </Frame>`
})
// Now ALL Button instances will show the new structure
```

## Fonts

### Search for Fonts

Framer provides access to over 8000 fonts. Use the search tool to find specific fonts:

```javascript
// Search for fonts by selector substring
searchFonts({
  query: "Inter"  // Searches in font selector
})
// Returns: {
//   message: "Found 12 fonts matching 'Inter'. Showing first 20.",
//   results: [{
//     family: "Inter",
//     selector: "GF;Inter-400",
//     weight: 400,
//     style: "normal"
//   }, ...],
//   totalMatches: 12
// }

// More specific searches
searchFonts({ query: "Inter-600" })     // Find specific weight
searchFonts({ query: "italic" })        // Find italic variants
searchFonts({ query: "Roboto-bold" })   // Find bold Roboto
```

**Note**: The search is case-insensitive and matches substrings in the font selector. Use specific terms to narrow results.

## Project Styles

### Get Style Information

Use these tools to discover available styles:

```javascript
// Get all color styles
getProjectColorStyles()
// Returns: [{ 
//   id, name, path, 
//   light: "rgb(255, 255, 255)",  // Light theme color
//   dark: null                     // Dark theme color (optional)
// }, ...]

// Get all text styles  
getProjectTextStyles()
// Returns: [{ 
//   id, name, path,
//   fontSize: "16px",
//   lineHeight: "24px", 
//   letterSpacing: "0px",
//   paragraphSpacing: 20,
//   transform: "none",
//   alignment: "left",
//   decoration: "none",
//   balance: false,
//   tag: "p"  // HTML tag (h1, h2, p, etc.)
// }, ...]
```

### Update Styles

```javascript
// Update a color style by its path
updateColorStyle({
  stylePath: "/Primary/Blue",  // Must start with /
  updates: {
    name: "Primary Blue",
    light: "#0066CC",
    dark: "#4488FF"  // null to remove dark variant
  }
})

// Update a text style by its path
updateTextStyle({
  stylePath: "/Heading xl",  // Must start with /
  updates: {
    name: "Heading Large",
    fontSize: "32px",
    lineHeight: "1.5em",
    letterSpacing: "-0.02em",
    paragraphSpacing: 40,
    transform: "none", // none/uppercase/lowercase/capitalize
    alignment: "left", // left/center/right/justify
    decoration: "none", // none/underline/line-through
    balance: true
  }
})
```

## Practical Examples

### Example 1: Update Text Content
```xml
<updateXmlForNode>
  <nodeId>abc123</nodeId>
  <xml>
    <Heading nodeId="abc123">
      New heading text
    </Heading>
  </xml>
</updateXmlForNode>
```

### Example 2: Change Multiple Attributes
```xml
<updateXmlForNode>
  <nodeId>def456</nodeId>
  <xml>
    <Container 
        nodeId="def456"
        width="100%"
        maxWidth="1200px"
        backgroundColor="/Background/Secondary"
        borderRadius="16px"
    />
  </xml>
</updateXmlForNode>
```

### Example 3: Update Multiple Nodes
```xml
<updateXmlForNode>
  <nodeId>parent123</nodeId>
  <xml>
    <Section nodeId="parent123">
      <Title nodeId="child1" inlineTextStyle="/Heading xl">
        Updated Title
      </Title>
      <Description nodeId="child2" opacity="0.8">
        Updated description text
      </Description>
    </Section>
  </xml>
</updateXmlForNode>
```

## Best Practices

1. **Always start with `getProjectXml`** to understand the project structure
2. **Use `getNodeXml` before updating** to see current state and available attributes
3. **Preserve existing attributes** when updating - only change what's needed
4. **Use project styles** (paths starting with `/`) instead of hardcoded values when possible
5. **Include nodeId attributes** in your XML updates to target specific nodes
6. **Test with `getSelectedNodesXml`** to work with user-selected elements

## Common Patterns

### Responsive Sizing
```xml
<!-- Desktop -->
<Container width="1200px" height="auto">

<!-- Tablet -->  
<Container width="100%" maxWidth="768px">

<!-- Mobile -->
<Container width="100%" padding="16px">
```

### Positioning
```xml
<!-- Centered -->
<Element position="absolute" top="50%" left="50%" centerX="50%" centerY="50%">

<!-- Pinned to edges -->
<Header position="fixed" top="0px" left="0px" right="0px" height="64px">

<!-- Relative spacing -->
<Card position="relative" width="300px" height="fit-content">
```

### Typography
```xml
<!-- Using project styles -->
<Text inlineTextStyle="/Body lg">Content</Text>

<!-- Custom font (use searchFonts to find selector) -->
<Text font="GF;Inter-600" fontSize="18px" lineHeight="1.5">Custom styled text</Text>

<!-- Font selector format examples -->
<Text font="GF;Inter-400">Regular Inter</Text>
<Text font="GF;Inter-600">Semi-bold Inter</Text>
<Text font="GF;Inter-400-italic">Italic Inter</Text>
<Text font="GF;Roboto-700">Bold Roboto</Text>
```

Remember: The XML format is forgiving - you only need to include the attributes you want to change. The system will preserve all other existing attributes.