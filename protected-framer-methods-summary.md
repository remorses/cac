# Protected Framer Methods That Need Permission Checks

## Methods Found in the Codebase

### Node Methods
- `node.setText()` - Used to set text content on text nodes
- `node.setAttributes()` - Used to set various attributes on nodes
- `node.setParent()` - Used to change parent of a node
- `node.removeNode()` - Used to remove a node
- `node.clone()` - Used to duplicate/clone a node

### Framer Global Methods
- `framer.setText()` - Set text globally
- `framer.setImage()` - Set/upload images
- `framer.setParent()` - Set parent relationships
- `framer.setPluginData()` - Store plugin-specific data
- `framer.removeNode()` - Remove nodes from the canvas
- `framer.createColorStyle()` - Create color styles
- `framer.createTextStyle()` - Create text styles
- `framer.createCodeFile()` - Create code component files
- `framer.uploadImage()` - Upload images to the project
- `framer.addComponentInstance()` - Add component instances to canvas

### Collection Methods
- `collection.setPluginData()` - Set plugin data on collections
- `collection.getPluginData()` - Get plugin data (not protected, read-only)
- `collection.getPluginDataKeys()` - Get plugin data keys (not protected, read-only)
- `collection.setFields()` - Set fields on a collection
- `collection.addItems()` - Add items to a collection
- `collection.removeItems()` - Remove items from a collection

### Code File Methods
- `codeFile.setFileContent()` - Update content of a code file

## Files with Protected Method Usage

### Plugin: AI Rewrite
- `/plugin-ai-rewrite/src/routes/Rewrite.tsx`
  - Uses: `node.setAttributes()`, `node.setText()`, `framer.removeNode()`, `framer.setParent()`
- `/plugin-ai-rewrite/src/routes/Login.tsx`
  - Uses: `framer.setPluginData()`
- `/plugin-ai-rewrite/src/routes/Settings.tsx`
  - Uses: `framer.setPluginData()`
- `/plugin-ai-rewrite/src/lib/utils.ts`
  - Uses: `framer.setPluginData()`

### Plugin: Migrate
- `/plugin-migrate/src/routes/Prompt.tsx`
  - Uses: `node.setAttributes()`, `node.setText()`, `framer.setPluginData()`
- `/plugin-migrate/src/routes/Login.tsx`
  - Uses: `framer.setPluginData()`
- `/plugin-migrate/src/routes/Settings.tsx`
  - Uses: `framer.setPluginData()`
- `/plugin-migrate/src/lib/utils.ts`
  - Uses: `framer.setPluginData()`

### Plugin: Angled Screen
- `/plugin-angled-screen/src/App.tsx`
  - Uses: `framer.setImage()`

### Plugin: GitHub Sync
- `/plugin-github-sync/src/routes/ChooseRepo.tsx`
  - Uses: `collection.setPluginData()`
- `/plugin-github-sync/src/routes/Sync.tsx`
  - Uses: `collection.setFields()`, `collection.removeItems()`, `collection.addItems()`, `collection.setPluginData()`
- `/plugin-github-sync/src/routes/MapFields.tsx`
  - Uses: `collection.setPluginData()`
- `/plugin-github-sync/src/routes/Login.tsx`
  - Uses: `collection.setPluginData()`
- `/plugin-github-sync/src/routes/Settings.tsx`
  - Uses: `collection.setPluginData()`
- `/plugin-github-sync/src/lib/utils.ts`
  - Uses: `collection.setPluginData()`, `collection.getPluginData()`

### Plugin: MCP (Already has permission checks)
- `/plugin-mcp/src/App.tsx`
  - Has permission checks implemented with `checkPermissions()` function
  - Uses: Various protected methods with proper permission handling
- `/plugin-mcp/src/lib/framer.ts`
  - Has permission checks implemented with `checkPermissions()` function
  - Uses: `framer.uploadImage()`, `node.setAttributes()`, `node.setText()`

### Plugin: React Export
- `/plugin-react-export/src/routes/BelongToAnotherUser.tsx`
  - Uses: `framer.setPluginData()`
- `/plugin-react-export/src/routes/Login.tsx`
  - Uses: `framer.setPluginData()`
- `/plugin-react-export/src/routes/Settings.tsx`
  - Uses: `framer.setPluginData()`
- `/plugin-react-export/src/lib/utils.ts`
  - Uses: `framer.setPluginData()`

## Notes

1. The MCP plugin already has proper permission checking implemented using `framer.isAllowedTo()` and a `checkPermissions()` helper function.

2. Most other plugins use protected methods without permission checks, particularly:
   - `setPluginData()` - Very commonly used for storing session keys and configuration
   - `setText()` and `setAttributes()` - Used for modifying canvas content
   - Collection methods - Used in GitHub sync plugin for managing CMS data

3. Methods that are mentioned in the prompt but not found in the codebase:
   - `addDetachedComponentLayers`
   - `addSVG`
   - `addText`
   - `addRedirects`
   - `removeRedirects`
   - `setRedirectOrder`
   - `createFrameNode`
   - `createTextNode`
   - `removeNodes`
   - `setCustomCode`
   - `setLocalizationData`
   - `uploadFile`
   - `uploadFiles`
   - `uploadImages`

4. The permission system appears to use `ProtectedMethod` type from 'framer-plugin' package to define which methods need permissions.