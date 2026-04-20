# Unframer Private Guidelines

> **Editing instructions:** This file (`UNFRAMER_PRIVATE_AGENTS.md`) is the source of truth for the root `AGENTS.md`. Edit this file, not `AGENTS.md` (which is generated) and not any `CLAUDE.md` files (which are deleted). Run `pnpm agents.md` from root to regenerate `AGENTS.md` after editing.

## Git Submodules

This repo uses git submodules for `spiceflow` and `unframer`. Always keep submodules on their respective `main` branches.

When working with submodules:
1. After cloning, run `git submodule update --init`
2. Before making changes in a submodule, ensure you're on `main`: `git checkout main`
3. Never leave submodules in detached HEAD state with uncommitted changes
4. Commit submodule changes to `main` branch, then update the parent repo reference

If you see submodules in detached HEAD:
```bash
cd spiceflow && git checkout main
cd ../unframer && git checkout main
```

## testing plugins with playwriter

framer plugins are just iframes that run inside the framer websites. each plugin is served with vite locally, framer.com has a command palette option to load them.

to try out the plugin you can load them into framer and control them with playwriter

when user asks to open a framer plugin, always read and follow `plugin-mcp/mcp-plugin-testing-instructions.md` with playwriter before taking actions.

mcp plugin also has a test suite that has to be run after the plugin is open in a specific project. see instructions in plugin-mcp/mcp-plugin-testing-instructions.md for how. follow it every time user asks to run mcp plugin test suite.


the framer plugin also depend on a cloudflare worker. if you make changes there run `pnpm deployment` first inside mcp plugin folder to deploy the preview worker. this is safe, the real worker in production is deployed with different script

## submitting mcp plugin for framer review

framer plugins need to be submitted as a zip for review. run `pnpm pack` inside `plugin-mcp/` to build the plugin and create `plugin.zip` (it opens Finder to the file).

the plugin build uses production env vars (`doppler run -c production`), so the MCP URL shown to users points to `mcp.unframer.co` (production worker). but during review the production worker may not have the latest changes yet.

**review workflow:**
1. deploy the preview worker first: `pnpm deployment` inside `plugin-mcp/`
2. build the zip: `pnpm pack` inside `plugin-mcp/`
3. submit the zip to framer for review
4. tell the reviewer to use `mcp.preview.unframer.co` instead of `mcp.unframer.co` for testing, since prod worker is only deployed after the review is approved
5. after review is approved: deploy production worker with `pnpm deployment:prod` (requires sudo, agents should not run this)

## reading framer plugin docs

framer plugin docs are at https://www.framer.com/developers/plugins-introduction

to see available pages for the plugin docs do `curl -s https://www.framer.com/sitemap.xml | grep /developers/`

webfetch these docs to understand how Framer plugin works or how the framer-api npm package works. 

you can also read the framer-plugin .d.ts files to see what APIs are available.

## plugin-mcp: working on the MCP plugin

before any chat in the plugin-mcp folder run the commands:
- `tree`, to get the folder files in a tree format
- read `src/schema.ts` to understand the MCP tools schema

when writing a description for an mcp tool you should never describe the output of the tool, instead describe the inputs and the use cases and what the flow for this tool should be.

to run tests: `pnpm test`. for a specific test: `pnpm test -t "test name"`. the test command already passes `--run -u` so never specify those again.

when running tests always run them with `-u` to update snapshots, then check `git diff src/lib/snapshots` and make sure the output is what you expect.

after making MCP API changes always update `src/prompts/how-to-use-mcp-server.md` with the new API. keep it short.

### CRITICAL: always import from #framer-client, never from framer-plugin or framer-api

All source files in `plugin-mcp/src/lib/` that need Framer SDK types or functions MUST import from `#framer-client`:

```ts
import { framer, isTextNode } from '#framer-client'
```

NEVER import directly from `framer-plugin` or `framer-api`. The `#framer-client` alias is a conditional import defined in `plugin-mcp/package.json` `imports` field: it resolves to `framer-plugin` in the browser (plugin mode) and `framer-api` on the server (Node.js headless mode). This allows the same handler code (`mcp-handlers.ts`, `framer.ts`, etc.) to run in both modes without modification.

Similarly, always import from `unframer` (the main entry point), never from `unframer/src/*`. The `./src/*` exports map resolves to `.ts` source files which Node 22 cannot load at runtime.

### Keeping server-api dist up to date

If you change `plugin-mcp/src/lib/mcp-handlers.ts` or `schema.ts`, always run inside plugin-mcp:

```bash
pnpm tsc --incremental && pnpm gen-unframer
```

This copies compiled JS to `unframer/unframer/src/plugin-mcp-dist/lib/` which is what `unframer mcp` server-api mode loads at runtime.

### Revoking a user's MCP secret

If a user asks to revoke their secret (e.g. they accidentally shared it on GitHub), run from `plugin-mcp/`:

```bash
pnpm revoke-session <the-secret-key>
```

This deletes the `FramerLoginSession` row from the production database. The worker's KV cache has a 5 minute TTL so the session may remain valid briefly after revocation. The user will need to re-login from the Framer plugin to get a new secret.
