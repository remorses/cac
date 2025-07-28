# Changelog

## 2025-07-28 13:23

- Added `updateColorStyle` and `updateTextStyle` MCP tools to modify color and text styles by their ID
- Enhanced `getProjectColorStyles` to return id, light, and dark color values
- Enhanced `getProjectTextStyles` to return all typography properties including id, tag, transform, alignment, decoration, balance, and paragraphSpacing
- Updated test snapshots to reflect the additional properties

## 2025-07-28 11:26

- Fixed missing `findFirstChildrenLayer` function in tree-utils.ts that was causing TypeScript compilation errors
