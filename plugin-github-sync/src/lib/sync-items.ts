// Shared CMS sync logic - works with both framer-plugin and framer-api
import { mapValueToFieldValue } from 'plugin-mcp/src/lib/cms'
import { Sema } from 'sema4'

// Shared interface that both framer-plugin and framer-api ManagedCollection satisfy
// We define our own to avoid TypeScript's private field incompatibility
export interface ManagedCollectionLike {
    setFields(fields: ManagedCollectionFieldInputLike[]): Promise<void>
    addItems(items: ManagedCollectionItemInputLike[]): Promise<void>
    removeItems(itemIds: string[]): Promise<void>
    getItemIds(): Promise<string[]>
}

export interface ManagedCollectionFieldInputLike {
    type: string
    name: string
    id: string
}

export interface ManagedCollectionItemInputLike {
    id?: string
    slug: string
    fieldData: Record<string, unknown>
}

// Field IDs used by the sync
export enum CollectionFieldIds {
    content = 'content',
}

// Types for sync input data
export interface SyncFileItem {
    id: string
    slug: string
    path: string
    markdown: string | null
    html?: string | null // fallback for backwards compatibility
    frontMatter?: Record<string, unknown>
    foundMdx?: boolean
}

export interface CollectionFieldConfig {
    id: string
    name: string
    type: string
}

export interface SyncError {
    message: string
    path: string
    kind?: 'error' | 'warning'
}

export interface SyncItemsInput {
    collection: ManagedCollectionLike
    files: SyncFileItem[]
    idsToDelete: string[]
    mapFieldsConfig: CollectionFieldConfig[]
    existingItemIds: Set<string>
}

export interface SyncItemsResult {
    imported: number
    deleted: number
    errors: SyncError[]
    notImported: number
}

/**
 * Syncs items to a Framer managed collection.
 * This function works with both framer-plugin (browser) and framer-api (Node.js).
 */
export async function syncItemsToCollection({
    collection,
    files,
    idsToDelete,
    mapFieldsConfig,
    existingItemIds,
}: SyncItemsInput): Promise<SyncItemsResult> {
    const errors: SyncError[] = []
    const semaphore = new Sema(1)
    let notImported = 0
    const importableItemsCount = files.filter((item) => {
        return item.markdown != null || item.html != null
    }).length

    // Set up collection fields
    await collection.setFields([
        {
            type: 'formattedText',
            name: 'Content',
            id: CollectionFieldIds.content,
        },
        ...(mapFieldsConfig
            .filter((field) => field?.type && field.id)
            .filter((x) => x.id !== CollectionFieldIds.content) as ManagedCollectionFieldInputLike[]),
    ])

    // Remove deleted items
    const itemsToRemove = idsToDelete.filter((id) => existingItemIds.has(id))
    if (itemsToRemove.length > 0) {
        try {
            await collection.removeItems(itemsToRemove)
        } catch (error) {
            errors.push({
                kind: 'error',
                message: `Error removing items: ${(error as Error).message}`,
                path: '',
            })
        }
    }

    // Add/update items
    await Promise.all(
        files.map(async (item) => {
            if (item.foundMdx) {
                errors.push({
                    kind: 'warning',
                    message: 'MDX custom components are not currently supported',
                    path: item.path,
                })
            }

            // Use markdown if available, fallback to HTML for backwards compat
            const contentValue = item.markdown ?? item.html
            if (contentValue == null) {
                return
            }
            // Determine contentType based on which field we're using
            const contentType = item.markdown != null ? 'markdown' : 'html'

            const frontMatterFields = getFieldsForFrontMatter(
                item.frontMatter || {},
                mapFieldsConfig,
            )

            await semaphore.acquire()
            try {
                await collection.addItems([
                    {
                        id: item.id,
                        slug: item.slug,
                        fieldData: {
                            [CollectionFieldIds.content]: {
                                value: contentValue,
                                type: 'formattedText',
                                contentType,
                            },
                            ...frontMatterFields,
                        },
                    },
                ])
            } catch (error) {
                notImported++
                console.error(`Error adding item with id ${item.id}:`, error)
                errors.push({
                    kind: 'error',
                    message: (error as Error).message,
                    path: item.path,
                })
            } finally {
                semaphore.release()
            }
        }),
    )

    return {
        imported: importableItemsCount - notImported,
        deleted: itemsToRemove.length,
        errors,
        notImported,
    }
}

function getFieldsForFrontMatter(
    frontMatter: Record<string, unknown>,
    mapFieldsConfig: CollectionFieldConfig[],
) {
    if (!frontMatter) {
        return {}
    }
    const fields: Record<string, unknown> = {}
    for (const field of mapFieldsConfig) {
        if (!field) {
            continue
        }
        const value = frontMatter[field.id]
        if (value !== undefined && value !== null) {
            fields[field.id] = mapValueToFieldValue(value, field as any)
        }
    }
    return fields
}
