# Changelog

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
