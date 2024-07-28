import { Spinner } from '@/components/Spinner'
import slugify from '@sindresorhus/slugify'

import { notifyError } from '@/lib/errors'
import { useRefreshOnVisible } from '@/lib/hooks'
import {
    getMarkdownPluginData,
    Paths,
    pluginApiClient,
    PluginDataKeys,
    simpleHash,
} from '@/lib/utils'
import { CollectionField, CollectionItem, framer } from 'framer-plugin'
import { useState } from 'react'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useNavigate,
    useRevalidator,
} from 'react-router'
import { generateSecurePassword } from 'website/src/lib/utils'

function Component() {
    // useRefreshOnVisible({ enabled: true })
    return (
        <div className='flex flex-col justify-center items-center min-h-[200px] gap-4'>
            <Spinner />
        </div>
    )
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

        itemsToAdd.push({
            id,
            slug: item.slug,
            title: item.slug,
            fieldData: {
                [CollectionFieldIds.content]: item.html,
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
