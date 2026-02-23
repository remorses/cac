# MCP Plugin Testing Instructions

Use `playwriter` skill and CLI to control the browser.

**Important**: Never call `bringToFront()` on pages - it's disruptive and unnecessary.

## Prerequisites

1. Start the plugin dev server in a background tmux session:

```bash
tmux new-session -d -s plugin-mcp-dev
tmux send-keys -t plugin-mcp-dev "cd /path/to/plugin-mcp && pnpm dev" Enter
```

The dev server runs at **https://localhost:5173/**

2. Open the Framer test project in Chrome:
   https://framer.com/projects/Framer-MCP-project-Designor-Framer-Template-copy--lfAw10qcrLpLLEznmZmo

if there is already a playwriter page open with this url reuse it instead of opening a new one.

3. Wait for the editor UI to finish loading (toolbar visible).

## Opening the Development Plugin

1. Press **Cmd+K** to open the command palette.

2. Search for **"show developer tools"** and press Enter to enable developer mode (if not already enabled). If you see "Disable Show Developer Tools", it's already enabled.

3. Press **Cmd+K** again and search for **"development plugin"** (or use shortcut **⌥⌘L**).

4. **If a URL input dialog appears**: Enter the plugin URL `https://localhost:5173/` and press Enter.

5. **If no dialog appears**: Framer cached the URL from a previous session and the plugin loads automatically.

## User Login Required

After opening the development plugin, check the plugin state:
- If logged in: Shows MCP URL with "Keep this plugin open while using MCP"
- If not logged in: Shows "Login With Google" button

**If not logged in**: Ask the user to click the "Login With Google" button and complete the OAuth flow.

## Running Tests

After the plugin is open and logged in, run the tests:

Use a dedicated task/sub-session for this test run to save the main session context window.
Pass this file path and ask the task to execute the exact steps here.

```bash
cd plugin-mcp && pnpm test
```

The tests connect to the MCP server which communicates with the Framer plugin via WebSocket tunnel.

## Verifying Plugin State with Playwriter

Create a session and get the Framer page:

```bash
playwriter session new
playwriter -s 1 -e "state.page = context.pages().find(p => p.url().includes('framer.com/projects')); console.log('page:', state.page?.url());"
```

Open the development plugin:

```bash
playwriter -s 1 -e "await state.page.keyboard.press('Meta+k'); await state.page.waitForTimeout(500); await state.page.keyboard.type('development plugin'); await state.page.waitForTimeout(500); await state.page.keyboard.press('Enter'); await state.page.waitForTimeout(2000);"
```

Check if the plugin iframe is loaded:

```bash
playwriter -s 1 -e "const frames = state.page.frames(); frames.forEach(f => { if (f.url().includes('localhost')) console.log('Plugin frame:', f.url()); });"
```

Check the plugin state using an accessibility snapshot (prefer this over screenshots — it's faster and gives structured text):

```bash
playwriter -s 1 -e "const frame = state.page.frames().find(f => f.url().includes('localhost:5173')); await snapshot({ frame });"
```

- If logged in: snapshot shows MCP URL text and "Keep this plugin open while using MCP"
- If not logged in: snapshot shows a "Login With Google" button

You can also snapshot the full page to check editor state (toolbar, command palette, etc.):

```bash
playwriter -s 1 -e "await snapshot({ page: state.page });"
```

## Expected Test Output

When properly configured, `pnpm test` should show all tests passing:

```
 ✓ src/lib/xml.test.ts (15 tests)
 ✓ src/lib/mcp.test.ts (22 tests)
 Test Files  2 passed (2)
      Tests  37 passed (37)
```

If tests fail with "Upstream not connected", the plugin is not logged in or not open.
