import {
    getMarkdownPluginData,
    LoaderReturnType,
    Paths,
    pluginApiClient,
    PluginDataKeys,
} from '@/lib/utils'
import { CollectionFieldConfig } from '@/routes/MapFields'
import classNames from 'classnames'
import { framer } from 'framer-plugin'
import { LoaderFunctionArgs, RouteObject, useLoaderData } from 'react-router'
import { syncItemsToCollection, SyncFileItem } from '@/lib/sync-items'

async function loader({}: LoaderFunctionArgs) {
    const pluginData = await getMarkdownPluginData()
    const {
        collectionId,
        owner,
        repo,
        githubAccountLogin,
        basePath,
        mapFieldsConfig,
        projectId,
        projectName,
        enablePartialUpdate,
    } = pluginData
    const collection = await framer.getActiveManagedCollection()

    if (collection.id !== collectionId) {
        console.error(
            `[GitHub Sync] Collection mismatch! Expected ${collectionId}, got ${collection.id}`,
        )
    }

    console.log(
        `[GitHub Sync] Syncing collection ${collection.id}: ${owner}/${repo}`,
    )
    const itemIds = await collection.getItemIds()
    const existingItemIds = new Set(itemIds)
    
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

    // Use shared sync logic
    const result = await syncItemsToCollection({
        collection,
        files: files as SyncFileItem[],
        idsToDelete,
        mapFieldsConfig,
        existingItemIds,
    })

    // Plugin-specific: show notification
    await framer.notify(
        `Imported ${result.imported} files${result.deleted ? `, deleted ${result.deleted} files` : ''}`,
        { variant: 'success' },
    )
    
    await collection.setPluginData(PluginDataKeys.enablePartialUpdate, 'true')
    
    if (result.errors.length) {
        return {
            errorList: result.errors,
            notImported: result.notImported,
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
            {errorList && errorList.length > 0 && (
                <>
                    <strong className='shrink-0 font-bold'>
                        Errors & Warnings:
                    </strong>
                    {!!notImported && (
                        <div className='mt-2 shrink-0 font-bold '>
                            {notImported}{' '}
                            {notImported === 1 ? 'page was' : 'pages were'} not
                            imported
                        </div>
                    )}
                    <ul className='list-disc shrink-0 list-inside mt-2 w-full'>
                        {errorList.map((error, index) => {
                            if (!error?.message) {
                                return null
                            }
                            return (
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
                            )
                        })}
                    </ul>
                </>
            )}
        </div>
    )
}

export function Sync(): RouteObject {
    return {
        handle: 'Syncing Github Repo',
        path: Paths.sync,
        loader,
        Component: Component,
    }
}
