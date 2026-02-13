# AI Rewrite: Add support email link

## Status
Ready to implement

## Summary
Add a "Support" email link in the AI Rewrite plugin settings, in addition to the existing "Share Feedback" button.

## Current state
In `plugin-ai-rewrite/src/routes/Settings.tsx:138-146`:
```tsx
<div className='flex gap-2 items-center'>
    <div className=''>Questions or requests?</div>
    <div className='grow'></div>
    <a target='_blank' href={feedbackUrl({ pluginName: 'Ai Rewrite', email })}>
        <Button className='w-auto'>Share Feedback</Button>
    </a>
</div>
```

## Implementation
Same approach as GitHub Sync (TODO #4).

### Option A: Add as submenu item
```typescript
framer.setMenu([
    {
        label: 'Support',
        submenu: [
            { label: 'Email Support', onAction: () => window.open('mailto:support@example.com') },
        ]
    }
])
```

### Option B: Add as separate link in Settings
```tsx
<div className='flex gap-2 items-center'>
    <div className=''>Need help?</div>
    <div className='grow'></div>
    <a target='_blank' href='mailto:support@unframer.com?subject=AI%20Rewrite%20Support'>
        <Button className='w-auto'>Contact Support</Button>
    </a>
</div>
```

## Files to modify

### `plugin-ai-rewrite/src/routes/Settings.tsx`
- Line ~138-147: Add new section after "Share Feedback" with support email link
- Follow same pattern as GitHub Sync plugin

### `website/src/lib/env.ts`
- Reuse same `supportEmail` export added for GitHub Sync

### Alternative: `plugin-ai-rewrite/src/App.tsx`
- If using menu approach, call `framer.setMenu()` with Support submenu
