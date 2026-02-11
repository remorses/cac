# MCP Plugin Testing Instructions

Use `playwriter` skill and CLI to control the browser.

## Prerequisites

1. Start the plugin dev server in a background tmux session:

```bash
tmux new-session -d -s plugin-mcp-dev
tmux send-keys -t plugin-mcp-dev "cd /path/to/plugin-mcp && pnpm dev" Enter
```

The dev server runs at **https://localhost:5173/**

2. Open the Framer test project in Chrome:
   https://framer.com/projects/Framer-MCP-project-Designor-Framer-Template-copy--lfAw10qcrLpLLEznmZmo

3. Wait for the editor UI to finish loading (toolbar visible).

## Opening the Development Plugin

1. Press **Cmd+K** to open the command palette.

2. Search for **"show developer tools"** and press Enter to enable developer mode (if not already enabled). If you see "Disable Show Developer Tools", it's already enabled.

3. Press **Cmd+K** again and search for **"development plugin"** (or use shortcut **⌥⌘L**).

4. **If a URL input dialog appears**: Enter the plugin URL `https://localhost:5173/` and press Enter.

5. **If no dialog appears**: Framer cached the URL from a previous session and the plugin loads automatically.

## User Login Required

**Important**: The plugin iframe is cross-origin (localhost:5173 vs framer.com), so automation tools cannot interact with elements inside the iframe. The user must manually click the "Login With Google" button.

After opening the development plugin:
1. The plugin panel shows "Control Framer with MCP" with a "Login With Google" button
2. **Ask the user to click "Login With Google"** and complete the OAuth flow
3. Once logged in, the plugin will show the MCP connection status

## Running Tests

After the plugin is open and logged in, run the tests:

```bash
cd plugin-mcp && pnpm test
```

The tests connect to the MCP server which communicates with the Framer plugin via WebSocket tunnel.

## Verifying Plugin State with Playwriter

Create a session and navigate to the project:

```bash
playwriter session new
playwriter -s 1 -e "state.page = await context.newPage(); await state.page.goto('https://framer.com/projects/Framer-MCP-project-Designor-Framer-Template-copy--lfAw10qcrLpLLEznmZmo', { waitUntil: 'domcontentloaded' });"
```

Check if the plugin iframe is loaded:

```bash
playwriter -s 1 -e "const iframes = await state.page.locator('iframe').all(); for (const f of iframes) { console.log(await f.getAttribute('src')); }"
```

Look for an iframe with `localhost:5173` in the output.

Get the plugin frame URL:

```bash
playwriter -s 1 -e "const frame = state.page.frames().find(f => f.url().includes('localhost:5173')); console.log('Plugin frame:', frame?.url());"
```

Take a screenshot to see plugin state:

```bash
playwriter -s 1 -e "await screenshotWithAccessibilityLabels({ page: state.page })"
```

## Known Limitations

- **Cross-origin iframe**: Cannot use `frame.locator()`, `frame.evaluate()`, or similar methods on the plugin iframe - they will timeout. This is because the iframe (localhost:5173) is cross-origin relative to the main page (framer.com).

- **Coordinate-based clicking**: Can click at specific coordinates to interact with the iframe, but OAuth popups require user interaction.

- **Popup detection**: Google OAuth may open in a popup window that playwriter cannot control. The user must complete the login manually.

## Expected Test Output

When properly configured, `pnpm test` should show all tests passing:

```
 ✓ src/lib/xml.test.ts (15 tests)
 ✓ src/lib/mcp.test.ts (22 tests)
 Test Files  2 passed (2)
      Tests  37 passed (37)
```

If tests fail with "Upstream not connected", the plugin is not logged in or not open.
