import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { connect } from 'framer-api'
import { syncItemsToCollection, ManagedCollectionLike, SyncFileItem } from './sync-items'

// Test configuration
const projectUrl = 'https://framer.com/projects/Framer-MCP-project-Designor-Framer-Template-copy--lfAw10qcrLpLLEznmZmo-irrP1'
const apiKey = process.env.FRAMER_API_KEY

// Fixed collection name - reused across test runs to avoid accumulating collections
const TEST_COLLECTION_NAME = '__github-sync-test-collection__'

// GitHub test repo config
const GITHUB_TEST_REPO = {
    owner: 'remorses',
    repo: 'framer-github-sync-bug-repro',
    basePath: '/posts',
}

describe('syncItemsToCollection', () => {
    // Skip tests if API key not set
    if (!apiKey) {
        it.skip('skipped - FRAMER_API_KEY required', () => {})
        return
    }

    let framer: Awaited<ReturnType<typeof connect>>
    let testCollection: ManagedCollectionLike | null = null

    // Helper to get or create the test collection
    async function getTestCollection(): Promise<ManagedCollectionLike> {
        if (testCollection) {
            return testCollection
        }
        
        // Try to find existing test collection
        const collections = await framer.getManagedCollections()
        const existing = collections.find((c: any) => c.name === TEST_COLLECTION_NAME)
        
        if (existing) {
            testCollection = existing as unknown as ManagedCollectionLike
            // Clear existing items
            const itemIds = await testCollection.getItemIds()
            if (itemIds.length > 0) {
                await testCollection.removeItems(itemIds)
            }
        } else {
            // Create new collection
            testCollection = await framer.createManagedCollection(TEST_COLLECTION_NAME) as unknown as ManagedCollectionLike
        }
        
        return testCollection
    }

    beforeAll(async () => {
        console.time('framer-api cold start')
        framer = await connect(projectUrl, apiKey!)
        console.timeEnd('framer-api cold start')
    }, 60000)

    afterAll(async () => {
        // Clear test collection items on cleanup
        if (testCollection) {
            try {
                const itemIds = await testCollection.getItemIds()
                if (itemIds.length > 0) {
                    await testCollection.removeItems(itemIds)
                }
            } catch {
                // Cleanup failed, ignore
            }
        }
        framer?.disconnect()
    }, 30000)

    it('should create collection and add items with markdown content', async () => {
        const collection = await getTestCollection()

        const files = [
            {
                id: 'test-1',
                slug: '/test-post-1',
                path: '/content/test-1.md',
                markdown: '# Hello World\n\nThis is **markdown** content.',
                frontMatter: { title: 'Test Post 1' },
            },
            {
                id: 'test-2',
                slug: '/test-post-2',
                path: '/content/test-2.md',
                markdown: '## Another Post\n\n- Item 1\n- Item 2',
                frontMatter: { title: 'Test Post 2' },
            },
        ]

        const result = await syncItemsToCollection({
            collection,
            files,
            idsToDelete: [],
            mapFieldsConfig: [
                { id: 'title', name: 'Title', type: 'string' },
            ],
            existingItemIds: new Set(),
        })

        expect(result.imported).toBe(2)
        expect(result.errors).toHaveLength(0)
        expect(result.notImported).toBe(0)

        // Verify items were created
        const itemIds = await collection.getItemIds()
        expect(itemIds).toContain('test-1')
        expect(itemIds).toContain('test-2')
    }, 60000)

    it('should handle item deletion', async () => {
        const collection = await getTestCollection()
        
        // First, add some items
        const files = [
            {
                id: 'delete-1',
                slug: '/delete-1',
                path: '/delete-1.md',
                markdown: '# To Delete',
            },
            {
                id: 'keep-1',
                slug: '/keep-1',
                path: '/keep-1.md',
                markdown: '# To Keep',
            },
        ]

        await syncItemsToCollection({
            collection,
            files,
            idsToDelete: [],
            mapFieldsConfig: [],
            existingItemIds: new Set(),
        })

        // Now sync again with deletion
        const result = await syncItemsToCollection({
            collection,
            files: [files[1]], // Only keep-1
            idsToDelete: ['delete-1'],
            mapFieldsConfig: [],
            existingItemIds: new Set(['delete-1', 'keep-1']),
        })

        expect(result.deleted).toBe(1)
        
        const remainingIds = await collection.getItemIds()
        expect(remainingIds).not.toContain('delete-1')
        expect(remainingIds).toContain('keep-1')
    }, 60000)

    it('should skip items with null markdown', async () => {
        const collection = await getTestCollection()

        const files = [
            {
                id: 'valid-1',
                slug: '/valid',
                path: '/valid.md',
                markdown: '# Valid',
            },
            {
                id: 'invalid-1',
                slug: '/invalid',
                path: '/invalid.md',
                markdown: null,
            },
        ]

        const result = await syncItemsToCollection({
            collection,
            files,
            idsToDelete: [],
            mapFieldsConfig: [],
            existingItemIds: new Set(),
        })

        expect(result.imported).toBe(1)
        
        const itemIds = await collection.getItemIds()
        expect(itemIds).toContain('valid-1')
        expect(itemIds).not.toContain('invalid-1')
    }, 60000)

    it('should add MDX warning for items with foundMdx flag', async () => {
        const collection = await getTestCollection()

        const files = [
            {
                id: 'mdx-1',
                slug: '/mdx-post',
                path: '/mdx-post.mdx',
                markdown: '# MDX Post\n\n<CustomComponent />',
                foundMdx: true,
            },
        ]

        const result = await syncItemsToCollection({
            collection,
            files,
            idsToDelete: [],
            mapFieldsConfig: [],
            existingItemIds: new Set(),
        })

        expect(result.errors).toHaveLength(1)
        expect(result.errors[0].kind).toBe('warning')
        expect(result.errors[0].message).toContain('MDX')
    }, 60000)

    // E2E test: Sync real GitHub repo content to Framer
    // This uses a fixture based on remorses/framer-github-sync-bug-repro
    it('E2E: should sync GitHub repo with rewritten image URLs to Framer', async () => {
        const collection = await getTestCollection()

        // Fixture: what the server returns for remorses/framer-github-sync-bug-repro
        // Images are rewritten to raw.githubusercontent.com URLs
        const files: SyncFileItem[] = [
            {
                id: 'microchip-announces-pic18-q10-with-i3c',
                slug: '/microchip-announces-pic18-q10-with-i3c',
                path: '/posts/microchip-announces-pic18-q10-with-i3c.md',
                markdown: `![microchip_logo](https://raw.githubusercontent.com/${GITHUB_TEST_REPO.owner}/${GITHUB_TEST_REPO.repo}/main/posts/images/microchip_logo.jpg)

In early 2022, I shared my excitement regarding news of Microchip's I3C Target-Only implementation in the 8-bit PIC18-Q20.

![231002-MCU8-PHOTO-EV73T25A-Front-Transparent](https://raw.githubusercontent.com/${GITHUB_TEST_REPO.owner}/${GITHUB_TEST_REPO.repo}/main/posts/images/231002-MCU8-PHOTO-EV73T25A-Front-Transparent.png)

This device has some really clever features.

![Supernova_LowRes_32](https://raw.githubusercontent.com/${GITHUB_TEST_REPO.owner}/${GITHUB_TEST_REPO.repo}/main/posts/images/Supernova_LowRes_32.jpg)`,
                frontMatter: {
                    title: 'Microchip Launches PIC18-Q20 with I3C',
                    category: 'Post',
                    date: '2023-10-23',
                    author_name: 'Jonathan Georgino',
                },
            },
            {
                id: 'test-draft-post',
                slug: '/test-draft-post',
                path: '/posts/test-draft-post.md',
                markdown: `# Test Draft Post

This is a simple test post without images.`,
                frontMatter: {
                    title: 'Test Draft Post',
                    draft: true,
                },
            },
        ]

        const result = await syncItemsToCollection({
            collection,
            files,
            idsToDelete: [],
            mapFieldsConfig: [
                { id: 'title', name: 'Title', type: 'string' },
                { id: 'category', name: 'Category', type: 'string' },
                { id: 'date', name: 'Date', type: 'date' },
                { id: 'author_name', name: 'Author', type: 'string' },
            ],
            existingItemIds: new Set(),
        })

        expect(result.imported).toBe(2)
        expect(result.errors).toHaveLength(0)

        // Verify items exist in Framer
        const itemIds = await collection.getItemIds()
        expect(itemIds).toContain('microchip-announces-pic18-q10-with-i3c')
        expect(itemIds).toContain('test-draft-post')

        console.log(`✅ E2E test passed: Synced ${result.imported} items to Framer collection "${TEST_COLLECTION_NAME}"`)
    }, 90000)
})
