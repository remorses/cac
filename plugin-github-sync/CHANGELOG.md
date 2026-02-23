<!-- Date-based changelog for plugin-github-sync marketplace and release notes. -->

# Changelog

All notable changes to `plugin-github-sync` are documented by date.

## 2026-02-23

- Extracted shared CMS sync logic into `src/lib/sync-items.ts` so the plugin and headless/server flows use the same core import behavior.
- Refactored `src/routes/Sync.tsx` to use the shared sync module, reducing route-level complexity and centralizing error handling.
- Added `src/lib/sync-items.test.ts` with `framer-api` integration coverage for add, delete, null markdown skip, and MDX warning scenarios.
- Added `github-sync-testing.md` with setup and execution instructions for API-based sync testing.
- Fixed imported count reporting to include both markdown and legacy HTML fallback content.
- Fixed frontmatter mapping to preserve falsy values (`false`, `0`, `""`) instead of dropping them.
- Updated testing notes to match current behavior (fixed reusable test collection with item cleanup before/after runs).

## 2026-02-07

- Added an in-plugin support email link in settings for faster troubleshooting from the GitHub Sync UI.

## 2026-02-04

- Updated `framer-plugin` dependency to `3.10.3`.
