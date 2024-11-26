import {
    getMarkdownPluginData,
    LoaderReturnType,
    Paths,
    pluginApiClient,
    simpleHash,
} from '@/lib/utils'
import { CollectionFieldConfig } from '@/routes/MapFields'
import { CollectionItemData, framer } from 'framer-plugin'
import { LoaderFunctionArgs, RouteObject, useLoaderData } from 'react-router'
import { Spinner } from 'template-rewrite-framer/src/components/Spinner'

const ErrorIcon = () => (
    <svg
        className='w-5 h-5 mr-2 fill-current text-red-500'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 20 20'
    >
        <path d='M10 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm.93-12.36a1.5 1.5 0 00-2.86 0L3.18 13.5a1.5 1.5 0 001.43 2h10.78a1.5 1.5 0 001.43-2L10.93 2.64zM10 12a1 1 0 110-2 1 1 0 010 2zm0-3a1 1 0 01-1-1V7a1 1 0 112 0v1a1 1 0 01-1 1z' />
    </svg>
)

function Component() {
    const { errorList } = useLoaderData() as LoaderReturnType<typeof loader>

    return (
        <div className='flex flex-col justify-center items-center min-h-[200px] gap-4'>
            {/* <Spinner /> */}
            {errorList && errorList.length > 0 && (
                <div
                    className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
                    role='alert'
                >
                    <strong className='font-bold'>Error(s) occurred:</strong>
                    <div className='mt-2 font-bold'>
                        {errorList.length} pages were not imported
                    </div>
                    <ul className='list-disc list-inside mt-2'>
                        {errorList.map((error, index) => (
                            <li key={index} className='flex items-start mb-2'>
                                <ErrorIcon />
                                {error.message} (Slug: {error.slug})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
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
            return value || null
            // TODO should i validate the Date or Framer?
            return new Date(Date.parse(value)).toUTCString()
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
    const collection = await framer.getManagedCollection()

    await collection.setFields([
        {
            type: 'formattedText' as const,
            name: 'Content',
            id: CollectionFieldIds.content,
        },
        ...(mapFieldsConfig
            .filter((field) => field?.type && field.id)
            .filter((x) => x.id !== CollectionFieldIds.content) as any[]),
    ])

    const unseenItemIds = new Set(await collection.getItemIds())

    const itemsToAdd: CollectionItemData[] = []

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

            fieldData: {
                // title: item.title,
                [CollectionFieldIds.content]: item.html,
                ...frontMatterFields,
            },
        })
    }

    console.log(itemsToAdd)

    const errorList = [] as { message: string; slug: string }[]

    for (const item of itemsToAdd) {
        try {
            await collection.addItems([item])
        } catch (error) {
            console.log('error adding item', item)
            console.error(`Error adding item with id ${item.id}:`, error)
            console.log(item.fieldData[CollectionFieldIds.content])
            errorList.push({ message: error.message, slug: item.slug })
        }
    }

    // Remove all the items that weren't in the new feed
    const itemsToDelete = Array.from(unseenItemIds)
    await collection.removeItems(itemsToDelete)

    // Save the data source ID for future plugin runs
    await framer.notify(`Imported ${itemsToAdd.length} files`, {
        variant: 'success',
    })
    if (errorList.length) {
        return {
            errorList,
        }
    }
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
