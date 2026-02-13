# GitHub Sync: Add support email link

## Status
Ready to implement

## Summary
Add a "Support" email link in the GitHub Sync plugin settings, in addition to the existing "Share Feedback" button.

## Current state
In `plugin-github-sync/src/routes/Settings.tsx:173-180`:
```tsx
<div className='flex gap-2 items-center'>
    <div className=''>Questions or requests?</div>
    <div className='grow'></div>
    <a target='_blank' href={feedbackUrl({ pluginName: 'Github Sync', email })}>
        <Button className='w-auto'>Share Feedback</Button>
    </a>
</div>
```

## Implementation

### Option A: Add as submenu item
Add to the plugin's menu (via `framer.setMenu()`):
```typescript
framer.setMenu([
    {
        label: 'Support',
        submenu: [
            { label: 'Email Support', onAction: () => window.open('mailto:support@example.com') },
            { label: 'Documentation', onAction: () => window.open('https://docs.example.com') },
        ]
    }
])
```

### Option B: Add as separate link in Settings
```tsx
<div className='flex gap-2 items-center'>
    <div className=''>Need help?</div>
    <div className='grow'></div>
    <a target='_blank' href='mailto:support@unframer.com?subject=GitHub%20Sync%20Support'>
        <Button className='w-auto'>Contact Support</Button>
    </a>
</div>
```

## Files to modify

### `plugin-github-sync/src/routes/Settings.tsx`
- Line ~171-181: Add new section after "Share Feedback" with support email link
- Import support email URL from `website/src/lib/env.ts` if centralized there

### `website/src/lib/env.ts`
- Add `supportEmail` or `supportUrl` export if not already present
- Example: `export const supportEmail = 'support@unframer.com'`

### Alternative: `plugin-github-sync/src/App.tsx`
- If using menu approach, call `framer.setMenu()` with Support submenu
- Add after router setup or in a useEffect
