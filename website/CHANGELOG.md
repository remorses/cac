# Changelog

## 2025-08-22

- **Added support for `componentType` field in React Export API**
- Database now accepts and stores component type information
- Distinguishes between regular Framer components and code file components

## 2025-01-28 14:45

- Fixed build errors by setting Vite build target to `esnext` to support top-level await
- Removed unused `framer-plugin` import from `spiceflow-plugins.server.tsx`
- Replaced `framer-plugin` import with local type definition for `ManagedCollectionField` in `spiceflow-github-sync-plugin.tsx`

## 2025-07-28 11:30

- Improved error messages in React Export plugin API to be more descriptive and include subscription purchase URLs
- Used existing `getBuyReactExportPluginUrl` function to generate proper buy URLs with required parameters (orgId, email, projectId)
- Added subscription URL to all subscription-related error responses
- Enhanced error message for project ownership conflicts to guide users to log in with the correct account
- Improved multiple Framer users error to show both the project owner's email and current user's email, along with their Framer user IDs
- Re-commented subscription check in getProject function per request
- Added subscription check in buy route to redirect users with existing subscriptions to Stripe billing portal for management
- Removed projectId parameter from all getReactSub function calls as it's not used in the query