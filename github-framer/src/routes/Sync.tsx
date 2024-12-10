import classNames from 'classnames'
import {
    getMarkdownPluginData,
    LoaderReturnType,
    Paths,
    pluginApiClient,
    PluginDataKeys,
} from '@/lib/utils'
import { CollectionFieldConfig } from '@/routes/MapFields'
import { CollectionItemData, framer } from 'framer-plugin'
import { LoaderFunctionArgs, RouteObject, useLoaderData } from 'react-router'
import { Sema } from 'sema4'

async function loader({}: LoaderFunctionArgs) {
    const {
        owner,
        repo,
        githubAccountLogin,
        basePath,
        mapFieldsConfig,
        projectId,
        projectName,
        enablePartialUpdate,
    } = await getMarkdownPluginData()
    const collection = await framer.getManagedCollection()

    console.log('syncing', owner, repo, githubAccountLogin, basePath)
    let itemIds = await collection.getItemIds()
    const itemIdsSet = new Set(itemIds)
    const { data, error } =
        await pluginApiClient.api.plugins.markdownPlugin.syncGithub.post({
            owner,
            repo,
            basePath,
            githubAccountLogin,
            projectId,
            projectName,
            mapFieldsConfig,
            enablePartialUpdate: enablePartialUpdate,
            itemIds: [...itemIds],
        })

    if (error) {
        throw error
    }
    const { files = [], idsToDelete = [] } = data

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

    const errorList = [] as { message: string; path: string; kind?: string }[]
    const semaphore = new Sema(1)
    let notImported = 0

    await Promise.all(
        files.map(async (item) => {
            if (item.foundMdx) {
                errorList.push({
                    kind: 'warning' as const,
                    message: `MDX custom components are not currently supported`,
                    path: item.path,
                })
            }

            if (item?.html == null) {
                return
            }

            const id = item.id

            let frontMatterFields = getFieldsForFrontMatter(
                item.frontMatter,
                mapFieldsConfig,
            )

            const collectionItem: CollectionItemData = {
                id,
                slug: item.pagePath,

                fieldData: {
                    // title: item.title,
                    [CollectionFieldIds.content]: item.html,
                    ...frontMatterFields,
                },
            }

            await semaphore.acquire()
            try {
                await collection.addItems([collectionItem])
            } catch (error) {
                notImported++
                console.log('error adding item', collectionItem)
                console.error(
                    `Error adding item with id ${collectionItem.id}:`,
                    error,
                )
                console.log(
                    collectionItem.fieldData[CollectionFieldIds.content],
                )
                errorList.push({
                    kind: 'error',
                    message: error.message,
                    path: item.path,
                })
            } finally {
                semaphore.release()
            }
        }),
    )

    // Remove all the items that weren't in the new feed

    console.log('removing items', idsToDelete)
    try {
        await collection.removeItems(
            idsToDelete.map((id) => id).filter((id) => itemIdsSet.has(id)),
        )
    } catch (error) {
        await framer.notify(`Error removing items: ${error.message}`, {
            variant: 'error',
        })
    }

    // Save the data source ID for future plugin runs
    await framer.notify(
        `Imported ${files.length} files${idsToDelete.length ? `, deleted ${idsToDelete.length} files` : ''}`,
        {
            variant: 'success',
        },
    )
    await collection.setPluginData(PluginDataKeys.enablePartialUpdate, 'true')
    if (errorList.length) {
        return {
            errorList,
            notImported,
        }
    }

    await framer.closePlugin()

    return {}
}

const ErrorIcon = ({ kind = 'error' }) => (
    <svg
        className={`w-4 h-4 mt-1 shrink-0 mr-2 fill-current ${kind === 'warning' ? 'text-orange-500' : 'text-red-500'}`}
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 20 20'
    >
        <path d='M10 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm.93-12.36a1.5 1.5 0 00-2.86 0L3.18 13.5a1.5 1.5 0 001.43 2h10.78a1.5 1.5 0 001.43-2L10.93 2.64zM10 12a1 1 0 110-2 1 1 0 010 2zm0-3a1 1 0 01-1-1V7a1 1 0 112 0v1a1 1 0 01-1 1z' />
    </svg>
)

function Component() {
    const { errorList, notImported } = useLoaderData() as LoaderReturnType<
        typeof loader
    >

    return (
        <div className='flex flex-col shrink-0 gap-2'>
            {/* <Spinner /> */}
            {errorList && errorList.length > 0 && (
                <>
                    <strong className='shrink-0 font-bold'>
                        Errors & Warnings:
                    </strong>
                    {!!notImported && (
                        <div className='mt-2 shrink-0 font-bold text-red-800'>
                            {notImported}{' '}
                            {notImported === 1 ? 'page was' : 'pages were'} not
                            imported
                        </div>
                    )}
                    <ul className='list-disc shrink-0 list-inside mt-2 w-full'>
                        {errorList.map((error, index) => (
                            <li
                                key={index}
                                className={classNames(
                                    'flex items-start mb-2 px-3 py-2 rounded',
                                    error.kind === 'warning'
                                        ? 'bg-orange-100 border-orange-400 text-orange-800'
                                        : 'bg-red-100 border-red-400 text-red-800',
                                )}
                            >
                                <ErrorIcon kind={error.kind} />
                                {error.message} (File: {error.path})
                            </li>
                        ))}
                    </ul>
                </>
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
    return value
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
