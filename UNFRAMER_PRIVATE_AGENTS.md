# Unframer Private Guidelines

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
