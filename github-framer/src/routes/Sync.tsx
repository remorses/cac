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

function mapValueToFieldValue(value: any, field: CollectionFieldConfig) {
    if (!field?.type) {
        return null
    }
    if (value == null) {
        return null
    }
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
        if (!field) {
            continue
        }
        const value = frontMatter[field.id]
        if (value) {
            fields[field.id] = mapValueToFieldValue(value, field)
        }
    }
    return fields
}

async function loader({}: LoaderFunctionArgs) {
    const { owner, repo, githubAccountLogin, basePath, mapFieldsConfig } =
        await getMarkdownPluginData()
    console.log('syncing', owner, repo, githubAccountLogin, basePath)
    const { data, error } =
        await pluginApiClient.api.plugins.markdownPlugin.syncGithub.post({
            owner,
            repo,
            basePath,
            githubAccountLogin,
        })
    if (error) {
        throw error
    }
    const { files } = data
    const collection = await framer.getCollection()

    await collection.setFields([
        {
            type: 'formattedText' as const,
            name: 'Content',
            id: CollectionFieldIds.content,
        },
        ...mapFieldsConfig
            .filter((field) => field?.type)
            .filter((x) => x.id !== CollectionFieldIds.content),
    ])

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
            title: item.title,
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
    await framer.notify(`Imported ${itemsToAdd.length} files`, {
        variant: 'success',
    })
    await framer.closePlugin()
    return {}
}

enum CollectionFieldIds {
    content = 'content',
}

export function Sync(): RouteObject {
    return {
        handle: 'Syncing Github Repo',
        path: Paths.sync,
        loader,
        Component: Component,
    }
}
