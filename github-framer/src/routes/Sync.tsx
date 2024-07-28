import { Spinner } from '@/components/Spinner'

import {
    getMarkdownPluginData,
    Paths,
    pluginApiClient,
    simpleHash,
} from '@/lib/utils'
import { CollectionFieldConfig } from '@/routes/MapFields'
import { CollectionField, CollectionItem, framer } from 'framer-plugin'
import { LoaderFunctionArgs, RouteObject } from 'react-router'

function Component() {
    // useRefreshOnVisible({ enabled: true })
    return (
        <div className='flex flex-col justify-center items-center min-h-[200px] gap-4'>
            <Spinner />
        </div>
    )
}

function mapValueToFieldValue(value: any, field: CollectionField) {
    if (field.type === 'string') {
        return String(value) || ''
    }
    if (field.type === 'number') {
        return Number(value) ?? null
    }
    if (field.type === 'boolean') {
        return Boolean(value)
    }
    if (field.type === 'date') {
        try {
            return new Date(Date.parse(value))
        } catch (e) {
            return null
        }
    }
    if (field.type === 'enum') {
        return String(value) || ''
    }
    if (field.type === 'formattedText') {
        return String(value) || ''
    }
    if (field.type === 'color') {
        return String(value) || ''
    }
    if (field.type === 'link') {
        return String(value) || ''
    }
    if (field.type === 'image') {
        return String(value) || ''
    }
}

function getFieldsForFrontMatter(
    frontMatter: Record<string, any>,
    mapFieldsConfig: CollectionFieldConfig[],
) {
    if (!frontMatter) {
        return {}
    }
    const fields = {} as any
    for (const field of mapFieldsConfig) {
        if (field.isDisabled) {
            continue
        }
        const value = frontMatter[field.field.id]
        if (value) {
            fields[field.field.id] = mapValueToFieldValue(value, field.field)
        }
    }
    return fields
}

async function loader({}: LoaderFunctionArgs) {
    const { owner, repo, mapFieldsConfig } = await getMarkdownPluginData()
    const { data, error } =
        await pluginApiClient.api.v1.markdownPlugin.syncGithub.post({
            owner,
            repo,
        })
    if (error) {
        throw error
    }
    const { files } = data
    const collection = await framer.getCollection()

    const fields = getCollectionFields()
    await collection.setFields(fields)

    const unseenItemIds = new Set(await collection.getItemIds())

    const itemsToAdd: CollectionItem[] = []

    for (const item of files) {
        if (!item?.html) {
            continue
        }

        const id = simpleHash(item.pagePath)

        unseenItemIds.delete(id)

        let frontMatterFields = getFieldsForFrontMatter(
            item.frontMatter,
            mapFieldsConfig,
        )

        itemsToAdd.push({
            id,
            slug: item.slug,
            title: item.slug,
            fieldData: {
                [CollectionFieldIds.content]: item.html,
                ...frontMatterFields,
            },
        })
    }

    await collection.addItems(itemsToAdd)

    // Remove all the items that weren't in the new feed
    const itemsToDelete = Array.from(unseenItemIds)
    await collection.removeItems(itemsToDelete)

    // Save the data source ID for future plugin runs
    // await collection.setPluginData(rssSourceStorageKey, sourceId)
    await framer.notify(`Imported ${itemsToAdd.length} files`, {
        variant: 'success',
    })
    await framer.closePlugin()
    return {}
}

enum CollectionFieldIds {
    content = 'content',
}

// Creates fields in the CMS collection for every key in the "RSSEntry" type.
function getCollectionFields(): CollectionField[] {
    return [
        {
            type: 'formattedText',
            name: 'Content',
            id: CollectionFieldIds.content,
        },
    ]
}

export function Sync(): RouteObject {
    return {
        handle: 'Syncing Github Repo',
        path: Paths.sync,
        loader,
        Component: Component,
    }
}
