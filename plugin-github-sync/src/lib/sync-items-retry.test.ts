// Validates sync fallback behavior when Framer rejects formatted-text image uploads.
//
// Test strategy:
// - Build a fake ManagedCollection that throws the same Framer error string used in production.
// - Capture every addItems payload to verify both the first attempt and the sanitized retry attempt.
// - Assert outcomes (imported/notImported/errors) and ensure image references are removed on retry
//   for markdown image syntax and inline HTML <img> tags.
import { describe, expect, it, vi } from 'vitest'

import {
    ManagedCollectionItemInputLike,
    ManagedCollectionLike,
    syncItemsToCollection,
} from './sync-items'

function getContentFieldValue(items: ManagedCollectionItemInputLike[]): string {
    const firstItem = items[0]
    if (!firstItem) {
        return ''
    }
    const contentField = firstItem.fieldData.content
    if (typeof contentField !== 'object' || contentField == null) {
        return ''
    }
    const value = (contentField as { value?: unknown }).value
    if (typeof value !== 'string') {
        return ''
    }
    return value
}

function createMockCollection({
    addItems,
}: {
    addItems: (items: ManagedCollectionItemInputLike[]) => Promise<void>
}) {
    const addItemsSpy = vi.fn(addItems)
    const collection: ManagedCollectionLike = {
        setFields: async () => {},
        addItems: addItemsSpy,
        removeItems: async () => {},
        getItemIds: async () => [],
    }

    return {
        collection,
        addItemsSpy,
    }
}

describe('syncItemsToCollection image upload retries', () => {
    it('retries by stripping markdown image references when upload fails', async () => {
        const seenContents: string[] = []
        const { collection, addItemsSpy } = createMockCollection({
            addItems: async (items) => {
                const content = getContentFieldValue(items)
                seenContents.push(content)
                if (content.includes('](./bad.png)')) {
                    throw new Error(
                        'Failed to upload images in formatted text for field: Content',
                    )
                }
            },
        })

        const result = await syncItemsToCollection({
            collection,
            files: [
                {
                    id: 'item-1',
                    slug: '/item-1',
                    path: '/item-1.md',
                    markdown:
                        'Hello ![bad](./bad.png) and ![ok](https://example.com/image.png)',
                },
            ],
            idsToDelete: [],
            mapFieldsConfig: [],
            existingItemIds: new Set<string>(),
        })

        expect(result.imported).toBe(1)
        expect(result.notImported).toBe(0)
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0]?.kind).toBe('warning')
        expect(addItemsSpy).toHaveBeenCalledTimes(2)
        expect(seenContents[1]).not.toContain('./bad.png')
        expect(seenContents[1]).not.toContain('![')
    })

    it('handles markdown image URLs that contain parentheses', async () => {
        const seenContents: string[] = []
        const { collection, addItemsSpy } = createMockCollection({
            addItems: async (items) => {
                const content = getContentFieldValue(items)
                seenContents.push(content)
                if (content.includes('./img(test).png')) {
                    throw new Error(
                        'Failed to upload images in formatted text for field: Content',
                    )
                }
            },
        })

        const result = await syncItemsToCollection({
            collection,
            files: [
                {
                    id: 'item-2',
                    slug: '/item-2',
                    path: '/item-2.md',
                    markdown: 'Hello ![bad](./img(test).png) world',
                },
            ],
            idsToDelete: [],
            mapFieldsConfig: [],
            existingItemIds: new Set<string>(),
        })

        expect(result.imported).toBe(1)
        expect(result.notImported).toBe(0)
        expect(addItemsSpy).toHaveBeenCalledTimes(2)
        expect(seenContents[1]).toBe('Hello  world')
    })

    it('strips non-uploadable html image tags on retry', async () => {
        const seenContents: string[] = []
        const { collection, addItemsSpy } = createMockCollection({
            addItems: async (items) => {
                const content = getContentFieldValue(items)
                seenContents.push(content)
                if (content.includes('<img src="/media/bad.gif"')) {
                    throw new Error(
                        'Failed to upload images in formatted text for field: Content',
                    )
                }
            },
        })

        const result = await syncItemsToCollection({
            collection,
            files: [
                {
                    id: 'item-3',
                    slug: '/item-3',
                    path: '/item-3.mdx',
                    markdown:
                        'Before <img src="/media/bad.gif" alt="bad" /> After',
                },
            ],
            idsToDelete: [],
            mapFieldsConfig: [],
            existingItemIds: new Set<string>(),
        })

        expect(result.imported).toBe(1)
        expect(result.notImported).toBe(0)
        expect(addItemsSpy).toHaveBeenCalledTimes(2)
        expect(seenContents[1]).toBe('Before  After')
    })
})
