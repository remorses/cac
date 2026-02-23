# GitHub Sync Plugin Testing

Tests use the Framer Server API (`framer-api`) to test CMS operations without needing a browser.

## Prerequisites

1. **Get an API key from the test project**
   - Open the test project: https://framer.com/projects/Framer-MCP-project-Designor-Framer-Template-copy--lfAw10qcrLpLLEznmZmo-irrP1
   - Go to Site Settings → API
   - Generate a new API key

2. **Add environment variable to Doppler**
   - Add `FRAMER_API_KEY` with your API key

## Running Tests

```bash
cd plugin-github-sync
pnpm test  # runs: doppler run -- vitest --run
```

Tests are skipped automatically if env vars are not set.

## Running in Framer (Development Plugin)

Use this when you want to test the real plugin UI in the Framer editor.

1. Start the GitHub Sync plugin dev server:

```bash
tmux new-session -d -s plugin-github-sync-dev -c /Users/morse/Documents/GitHub/unframer-private/plugin-github-sync "pnpm dev"
```

2. Make sure no other plugin dev server is using the same port (`5173`).
   If another plugin is on `5173`, Framer will load that plugin instead of GitHub Sync.

```bash
tmux kill-session -t plugin-mcp-dev
tmux kill-session -t plugin-github-sync-dev
```

Then restart only the plugin you want to load in Framer.

3. Open the plugin from Framer's Plugins menu and launch `GitHub Sync (Development)`.

4. On first launch, GitHub Sync shows a `New Collection` modal where you choose the collection name.
   The default is `GitHub Sync (Development)`. Click `Create` to continue.

## What's Tested

The tests verify the shared `syncItemsToCollection` function:

| Test | Description |
|------|-------------|
| Add items with markdown | Creates collection, adds items with `contentType: 'markdown'` |
| Item deletion | Verifies items are removed correctly |
| Null markdown handling | Skips items with null markdown content |
| MDX warnings | Adds warning for items with MDX components |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    sync-items.ts                         │
│         (shared CMS logic, framework-agnostic)           │
└─────────────────────┬────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   Sync.tsx      │       │ sync-items.test │
│  (plugin UI)    │       │   (vitest)      │
│                 │       │                 │
│ uses framer-    │       │ uses framer-api │
│ plugin          │       │ (Server API)    │
└─────────────────┘       └─────────────────┘
```

Both the plugin and tests use the same `syncItemsToCollection` function, ensuring the CMS logic is tested without browser automation.

## Notes

- Tests reuse a fixed managed collection name (`__github-sync-test-collection__`)
- Collection items are cleared before and after tests
- Tests require network access to Framer's API
- Each test has a 60-second timeout for API operations
