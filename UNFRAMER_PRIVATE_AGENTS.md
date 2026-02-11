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
