# Changelog

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
