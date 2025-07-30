# Changelog

## 2025-01-30 11:35

- Fixed TypeScript type errors in tests and App.tsx
- Updated test assertions to work with simplified style objects
- Skipped create color style test due to Framer API limitation in test environment

## 2025-01-30 11:30

- Removed `getProjectColorStyles` and `getProjectTextStyles` tools
- Color and text styles are now included in `getProjectXml` output under `<ColorStyles>` and `<TextStyles>` sections
- Updated tests and documentation to use `getProjectXml` for accessing styles

## 2025-01-30 11:25

- Text nodes now always use non-self-closing XML tags
- Added `disableSelfClosing` property to FramerLayersTree type
- Text nodes set `disableSelfClosing: true` to ensure they render as `<TextNode></TextNode>` even when empty

## 2025-01-30 11:20

- Use generic node names ('Page', 'Component', 'CodeComponent', 'CodeOverride') in project XML instead of actual names
- Project XML now shows consistent generic names for better structure understanding

## 2025-01-30 11:15

- Added comment field to FramerLayersTree for better documentation in XML output
- Enhanced getProjectXml to include descriptive comments only at root level sections
- Removed redundant `type` field from project XML nodes
- Removed `exports` field from code component nodes in project XML
- Added comments for replica nodes explaining that children are hidden and getNodeXml should be called
- Comments now appear as XML comments above nodes in the generated output
- Added support for self-closing XML tags when nodes have no children or content

## 2025-01-30 10:45

- Unified color and text style tools into single `manageColorStyle` and `manageTextStyle` tools
- Added `type` parameter with values "create" or "update" to specify the operation
- Improved error messages to guide users when style exists/doesn't exist
- Updated documentation to show examples of both create and update operations
- Simplified API by having consistent parameter structure for both operations

## 2025-01-29 21:40

- Strip version hash (@ part) from all insert URLs everywhere
- URLs are now stripped immediately when storing them in component objects
- All Framer API calls now use the clean URLs without version hash
- Updated getComponentInsertUrlAndTypes and createCodeFile to use clean URLs
- Updated test snapshots to reflect the new URL format without @ version

## 2025-01-29 21:35

- Simplified `getProjectWebsiteUrl` to return the raw PublishInfo object
- Returns `{ production: null, staging: null }` if project is not published
- Each publish object contains url, currentPageUrl, deploymentTime, and optimizationStatus
- Updated test to expect object response

## 2025-01-29 21:30

- Added `getProjectWebsiteUrl` tool to retrieve published website URLs
- Uses `framer.getPublishInfo()` to get production URL, staging URL, custom domains, and last published date
- Returns helpful instructions if project is not published
- Added test coverage for the new tool

## 2025-01-29 21:25

- Simplified `getComponentInsertUrlAndTypes` implementation in App.tsx
- Created unified approach using array of component objects (name, insertUrl, importName)
- Consolidated markdown generation logic to eliminate code duplication
- Single loop processes all components with consistent formatting
- Cleaner code structure with better separation of concerns

## 2025-01-29 17:20

- Fixed createColorStyle and createTextStyle API to work with Framer's limitation that doesn't allow both name and path attributes
- Updated schema to remove name requirement from style creation - name is now automatically derived from the path
- Updated implementation to filter out any name property before calling Framer API
- Fixed failing tests to handle dynamic style path changes and improved JSON response parsing
- Added documentation explaining that style names are derived from the last segment of the path

## 2025-01-29 21:15

- Added tests for `getComponentInsertUrlAndTypes` tool with file snapshots (.md extension)
- Test coverage for both regular component nodes and code file components
- Snapshots capture the markdown-formatted output including insert URLs, import statements, and prop documentation

## 2025-01-29 21:10

- Updated `getComponentInsertUrlAndTypes` to use single `id` parameter instead of separate nodeId/codeFileId
- Tool now returns all components when given a code file ID with multiple component exports
- Added clarification that TypeDoc props can be used as XML attributes in updateXmlForNode
- Improved output formatting with clear sections for each component

## 2025-01-29 21:00

- Created plugin.txt with comprehensive marketplace description

## 2025-01-29 19:50

- Renamed `getComponentImportUrl` to `getComponentInsertUrlAndTypes` for clarity
- Extended tool to support both regular components (via nodeId) and code file components (via codeFileId)
- Tool now returns insert URL as first item, which must be used with `insertComponentInCanvas`
- Removed insertUrl from `getProjectXml` output to avoid confusion - use `getComponentInsertUrlAndTypes` instead
- Updated `createCodeFile` description to mention using `insertComponentInCanvas` to add component to canvas
- Updated `insertComponentInCanvas` description to clarify it works with both regular and code file components

## 2025-01-29 17:40

- Optimized Framer tree XML generation to reduce token usage by skipping default attribute values
- Added `ATTRIBUTE_DEFAULTS` constant to define common default values (opacity: 1, visible: true, locked: false, rotation: 0, position: 'relative', width: '1fr', height: 'fit-content')
- Modified `getNodeAttributesForXml` to only include attributes that differ from defaults

## 2025-01-29 13:05

- Added `insertComponentInCanvas` MCP tool to insert components into the canvas using their insertUrl
- Enhanced `getProjectXml` to include insertUrl for components and code files  
- Updated `getProjectXml` to show currently focused page/component ID
- Updated `createCodeFile` description to mention insertUrl in return value

## 2025-01-29 12:00

- Removed PluginDataKeys.sessionKey enum and switched to using localStorage for session storage
- Session key now stored directly in localStorage instead of framer.setPluginData
- Simplified authentication flow by using only localStorage for session persistence
- Added LocalStorageKeys enum to avoid hardcoding localStorage key strings

## 2025-01-28 21:55

- Fixed `getComponentImportUrl` to return markdown string instead of object
- Updated schema to specify string output type
- Returns markdown with JS code blocks for import statement and JSDoc prop types

## 2025-01-28 21:50

- Updated `getComponentImportUrl` to return markdown-formatted message with JavaScript code blocks
- Uses JSDoc comments from `propControlsToTypedocComments` for prop type documentation
- Returns import statement and prop types in a readable markdown format

## 2025-01-28 21:45

- Fixed `getComponentImportUrl` to use `getComponentPropertyControls` to fetch prop controls from component URL
- Properly pass required parameters to `propControlsToTypedocComments` including componentImportedName
- Import TypeScript utilities from correct unframer package path

## 2025-01-28 21:30

- Enhanced `getComponentImportUrl` to return complete import statement with proper component name casing
- Added TypeScript prop types documentation generated from prop controls using `propControlsToTypedocComments`
- Returns formatted import statement like `import ComponentName from "url"`

## 2025-01-28 21:15

- Added `getComponentImportUrl` MCP tool to retrieve import URL and TypeScript props type for component nodes
- Validates that the provided node is a component node before returning import information
- Returns insertUrl, component name, and inferred props type name

## 2025-01-28 21:00

- Added `createCodeFile` MCP tool to create new code files with TypeScript/React content
- Added `readCodeFile` MCP tool to read code file content and exports
- Added `updateCodeFile` MCP tool to update existing code file content
- Updated `getProjectXml` to include CodeComponents and CodeOverrides sections
- All code file operations include automatic linting and type checking

## 2025-01-28 20:40

- Optimized `updateTextStyle` and `createTextStyle` to call `getColorStyles` only once
- Added conditional check to load color styles only when color style paths are used
- Improved performance by avoiding redundant API calls

## 2025-01-28 20:30

- Extracted color style properties into reusable `colorStylePropertiesSchema`
- Added `createColorStyle` MCP tool to create new color styles with name, light, and dark properties
- Both create and update color style tools now use the same schema
- Validates that color style paths don't already exist before creation

## 2025-01-28 20:20

- Extracted text style properties into reusable `textStylePropertiesSchema`
- Added `createTextStyle` MCP tool to create new text styles with full property support
- Both create and update text style tools now handle color style path resolution
- Validates that text style paths don't already exist before creation

## 2025-01-28 20:10

- Enhanced `updateTextStyle` to handle color style references for color and decorationColor fields
- When color values start with `/`, they are now resolved to actual ColorStyle objects
- Throws error if referenced color style path is not found

## 2025-01-28 20:00

- Updated `exportReactComponents` to use `isComponentNode` helper for proper component validation

## 2025-01-28 19:50

- Extended `updateTextStyle` MCP tool schema to support all TextStyleData fields
- Added support for color, font variants (bold, italic, boldItalic), and decoration properties
- Added support for decoration styling (color, thickness, style, skip ink, offset)
- Added name and tag fields to both updateTextStyle and updateColorStyle tools

## 2025-01-28 19:00

- Added `exportReactComponents` MCP tool to export Framer components as React code
- Validates that all provided node IDs are component nodes before exporting
- Integrates with existing React export plugin API
- Returns export URL and list of exported components

## 2025-01-28 18:30

- Added `deleteNode` MCP tool to permanently delete nodes from Framer projects
- Added `duplicateNode` MCP tool to create copies of nodes with all their children
- Updated prompt.md documentation with node operations section

## 2025-01-28 18:00

- Handle WebSocket error code 4009 when another plugin is already connected
- Display error message in UI instructing user to close other plugin instances
- Prevent reconnection attempts when this specific error occurs
- Clear error state on successful connection
- Add error state to store for displaying connection errors

## 2025-01-28 17:45

- Changed WebSocket ID from random generated ID to Framer user ID for consistent MCP URL across all projects for the same user
- Moved websocket initialization to rootLoader after authentication
- Removed websocketId from store and plugin data

## 2025-01-28 17:30

- Added user email display and sign out button to main MCP component
- Modified root loader to fetch current user info from API
- Added seamless sign out functionality that clears session and redirects to login

## 2025-01-28 17:15

- Removed duplicate utility functions (framerLoginUrl, generateSecurePassword, etc.)
- Updated imports to use functions from website package instead
- Fixed website dependency to use workspace:* format for proper resolution

## 2025-01-28 17:00

- Updated Login page to match exact styling from plugin-react-export
- Created Button component matching plugin-migrate implementation
- Added Spinner component for loading states
- Removed custom styling in favor of exact style replication

## 2025-01-28 16:45

- Moved height and sizing logic to RootLayout component so both Login and Main screens have proper sizing
- Fixed Login screen remaining small by using consistent layout structure
- Improved Login screen styling with better spacing and Framer theme colors

## 2025-01-28 16:30

- Added Google OAuth login flow similar to plugin-react-export
- Added router setup with react-router for navigation
- Created API client generation script that reuses website's api-client
- Added authentication check before loading main MCP interface
- Created Button component with Framer theme styling
- Added session management with framer.setPluginData/getPluginData

## 2025-01-28 15:20

- Fixed WebSocket connection state reliability by removing mutable `isFramerPluginReady` variable and using resolved `websocketRpc` promise instead

## 2025-07-28 16:09

- Clarified replica node handling: replica nodes are included in output but their children are skipped
- Tree traversal correctly includes replica nodes as leaf nodes with special comment
- Updated documentation to clarify that replica nodes appear in XML but without children

## 2025-07-28 16:00

- Simplified replica node handling by removing `showReplicaChildren` parameter entirely
- `getNodeXml` now returns a warning when called on replica nodes, recommending to update the original
- `getSelectedNodesXml` shows warning if any selected nodes are replicas
- Replica nodes automatically hide children and show actionable comment in attributes
- Updated src/lib/prompt.md documentation to explain replica node behavior and warnings

## 2025-07-28 14:08

- Changed WebSocket connection to resolve when "ready" message is received instead of on open
- This ensures the Framer plugin is fully initialized before accepting MCP requests

## 2025-07-28 14:06

- Added empty handlers for prompts/list and resources MCP endpoints
- Added `ListPromptsRequestSchema`, `GetPromptRequestSchema`, `ListResourcesRequestSchema`, and `ReadResourceRequestSchema` handlers
- Updated server capabilities to include resources

## 2025-07-28 14:02

- Added automatic reconnection logic to MCP WebSocket connection with 2-second retry delay
- Cleaned up WebSocket handling types by creating `WebsocketHandling` interface
- Stop reconnection attempts when MCP server is shutting down

## 2025-07-28 13:49

- Removed `id` and `name` fields from color and text style outputs as they're not needed with path-based updates

## 2025-07-28 13:40

- Added `searchFonts` tool to search through available fonts by selector substring
- Limited search results to 20 fonts to handle Framer's 8000+ font library
- Added documentation and tests for the new searchFonts tool
- Updated tool description to explain font selector usage and inlineTextStyle conflict

## 2025-07-28 13:35

- Changed `updateColorStyle` and `updateTextStyle` to use style path instead of ID for more user-friendly API
- Updated prompt.md documentation to reflect the new path-based API and enhanced return values

## 2025-07-28 13:23

- Added `updateColorStyle` and `updateTextStyle` MCP tools to modify color and text styles by their ID
- Enhanced `getProjectColorStyles` to return id, light, and dark color values
- Enhanced `getProjectTextStyles` to return all typography properties including id, tag, transform, alignment, decoration, balance, and paragraphSpacing
- Updated test snapshots to reflect the additional properties
- Added descriptive field documentation to all MCP tool input parameters for better developer experience

## 2025-07-28 11:26

- Fixed missing `findFirstChildrenLayer` function in tree-utils.ts that was causing TypeScript compilation errors
