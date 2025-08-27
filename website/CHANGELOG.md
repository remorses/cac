# Changelog

## 2025-08-27 13:30

- Fixed GitHub OAuth configuration inconsistency in React Export plugin
- Moved `allowSignup: true` parameter to OAuthApp constructor for consistency
- Ensured both authorization and callback routes use same OAuth configuration

## 2025-08-27 16:45

- Fixed GitHub OAuth code reuse issue in React Export plugin callback
- OAuth code was being used twice when user had to login to GitHub first
- Moved all OAuth token exchange logic from action to loader function to ensure single use
- Implemented streaming pattern for slow repo creation with loading UI
- Parallelized collaborator addition and database updates with Promise.all

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