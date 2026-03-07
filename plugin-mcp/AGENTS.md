<!-- Local agent instructions for plugin-mcp test modes and runtime imports. -->

# plugin-mcp testing and runtime notes

## MCP test modes

- Default test mode is **server-api**.
- Use this command for default mode:

```bash
pnpm test
```

- Force **plugin/browser** mode when you want tunnel + live plugin behavior:

```bash
MCP_TEST_MODE=plugin pnpm test
```

- Force **server-api** mode explicitly:

```bash
MCP_TEST_MODE=server-api pnpm test
```

## How each mode works

- **server-api mode**
  - `mcp.test.ts` calls `connect(projectUrl, FRAMER_API_KEY)` from `framer-api`.
  - The returned client is assigned to `globalThis.framer`.
  - MCP handlers run directly in-process through `mcpToolHandler` (no websocket/plugin tunnel required).
  - Best for CI and deterministic API validation.

- **plugin/browser mode**
  - `mcp.test.ts` creates an MCP client using `createMCPClient` (`streamable-http`).
  - Calls go to the deployed MCP endpoint and then through plugin websocket bridge.
  - Requires Framer plugin open and logged in with the same account used by MCP.
  - Best for true end-to-end plugin integration.

## Current missing capabilities in plugin-mcp server runtime

Validated against Framer docs plus package type definitions (`framer-plugin` and `framer-api`).

- `framer-api` and `framer-plugin` both expose core methods like `getSelection`, `zoomIntoView`, `notify`, and `isAllowedTo` in their `.d.ts` files.
- In this repo, current limitations are implementation-level (plugin-mcp), not API surface-level:
  - Remote component schema imports are skipped in Node (`import("https://...")` is not supported in our server path), so property-control comments may be unavailable for remote module URLs.
  - CMS collection access can fail in some environments/accounts/projects; tests currently guard this case.
  - Style writes can fail in read-only/view-only projects; tests currently guard this case.
  - `src/lib/framer-client.server.ts` contains fallback shims for `isAllowedTo`, `notify`, `getSelection`, and `zoomIntoView` that are used only if the runtime client does not provide those methods.

## `framer-plugin` vs `framer-api` runtime differences

- `framer-plugin` (browser plugin runtime):
  - Runs inside Framer plugin iframe with interactive canvas context.
  - Has plugin UX primitives (selection, zoom, notify, permission checks) tied to active editor session.
  - Best for behavior that depends on live editor state.
- `framer-api` (server runtime):
  - Runs in Node and connects via API token (`connect(projectUrl, FRAMER_API_KEY)`).
  - Better for deterministic automation and CI-style tests.
  - Supports extra server-oriented methods (typed as `FramerApiOnlyMethods`), including publish/deploy/change-tracking APIs.

## Validated references

- Framer docs:
  - https://www.framer.com/developers/server-api-introduction
  - https://www.framer.com/developers/plugins-introduction
  - https://www.framer.com/developers/plugins-permissions
- Local type definitions:
  - `plugin-mcp/node_modules/framer-plugin/dist/index.d.ts`
  - `plugin-mcp/node_modules/framer-api/dist/index.d.ts`

## `#framer-client` import contract

Always import Framer runtime APIs from `#framer-client` in `src/lib/*`.

Example:

```ts
import { framer, isTextNode } from '#framer-client'
```

Why:

- `#framer-client` is a package `imports` alias that resolves to different implementations by environment.
- In browser/plugin runtime it resolves to `src/lib/framer-client.ts`, which re-exports `framer-plugin`.
- In server runtime it resolves to `src/lib/framer-client.server.ts`, which reads `globalThis.framer` (provided by `framer-api connect(...)`).
- This gives one shared handler code path that works in both runtimes.

Do not import `framer-plugin` or `framer-api` directly in shared handler code.
