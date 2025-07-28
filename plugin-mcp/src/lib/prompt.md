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

Component instances have additional attributes for their props:

```xml
<Button
    nodeId="comp123"
    componentId="xyz789"
    
    <!-- Standard node attributes -->
    width="200px"
    height="48px"
    
    <!-- Component-specific props -->
    variant="primary"
    label="Click me"
    isDisabled="false"
/>
```

## Project Styles

### Get Style Information

Use these tools to discover available styles:

```javascript
// Get all color styles
getProjectColorStyles()
// Returns: [{ id, name, path, light, dark }, ...]

// Get all text styles  
getProjectTextStyles()
// Returns: [{ id, name, path, fontSize, lineHeight, ... }, ...]
```

### Update Styles

```javascript
// Update a color style
updateColorStyle({
  styleId: "color123",
  updates: {
    name: "Primary Blue",
    light: "#0066CC",
    dark: "#4488FF"
  }
})

// Update a text style
updateTextStyle({
  styleId: "text456",
  updates: {
    name: "Heading Large",
    fontSize: "32px",
    lineHeight: "1.5em",
    letterSpacing: "-0.02em",
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

<!-- Custom font -->
<Text font="GF;Inter-600" fontSize="18px" lineHeight="1.5">Custom styled text</Text>
```

Remember: The XML format is forgiving - you only need to include the attributes you want to change. The system will preserve all other existing attributes.