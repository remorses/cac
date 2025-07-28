# Changelog

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
