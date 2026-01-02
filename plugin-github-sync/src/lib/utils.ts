import { env } from 'website/src/lib/env'

import { SpiceflowClient, createSpiceflowClient } from 'spiceflow/client'

import {
    ManagedCollectionField as CollectionField,
    framer,
} from 'framer-plugin'
import type { RouteType } from 'website/src/lib/spiceflow-plugins.server'

import { safeJsonParse } from 'website/src/lib/utils'
import { redirect } from 'react-router'
import { withMode } from 'plugin-migrate/src/lib/utils'

export {
    withMode,
    formatLargeNumber,
    getDesktop,
} from 'plugin-migrate/src/lib/utils'
export type { LoaderReturnType } from 'plugin-migrate/src/lib/utils'

export const pluginApiClient: SpiceflowClient.Create<RouteType> =
    createSpiceflowClient<RouteType>(env.PUBLIC_URL!, {
        async onResponse(response) {
            if (response.status === 401) {
                const collection = await framer.getActiveManagedCollection()
                console.log('clearing session because api returned 401')
                await collection.setPluginData(PluginDataKeys.sessionKey, null)
                throw redirect(withMode(Paths.login))
            }
            if (response?.status === 402) {
                throw redirect(withMode(Paths.buy))
            }
        },
        async onRequest() {
            const { sessionKey } = await getMarkdownPluginData()
            return {
                headers: {
                    sessionKey,
                },
            }
        },
    })

export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export const noop: any = () => {}

export function isTruthy<T>(val: T | undefined | null | false): val is T {
    return Boolean(val)
}

export enum Paths {
    login = '/login',
    chooseRepo = '/choose-repo',
    mapFields = '/map-fields',
    sync = '/sync',
    settings = '/settings',
    buy = '/buy',
}

export enum RouteIds {
    root = 'root',
}

export const globalState = {}

export enum PluginDataKeys {
    sessionKey = 'sessionKey',
    githubRepoSlug = 'repoSlug',
    mapFieldsConfig = 'mapFieldsConfig',
    githubAccountLogin = 'githubAccountLogin',
    basePath = 'basePath',
    enablePartialUpdate = 'disablePartialUpdate',
}

export async function getMarkdownPluginData() {
    const collection = await framer.getActiveManagedCollection()
    const collectionId = collection.id

    const [
        repoSlug,
        mapFieldsConfigJson,
        basePath,
        githubAccountLogin,
        sessionKey,
        project,
        enablePartialUpdate = false,
    ] = await Promise.all([
        collection.getPluginData(PluginDataKeys.githubRepoSlug),
        collection.getPluginData(PluginDataKeys.mapFieldsConfig),
        collection.getPluginData(PluginDataKeys.basePath) || '',
        collection.getPluginData(PluginDataKeys.githubAccountLogin) || '',
        collection.getPluginData(PluginDataKeys.sessionKey) || '',
        framer.getProjectInfo(),
        collection.getPluginData(PluginDataKeys.enablePartialUpdate) || '',
    ])
    const [owner, repo = ''] = repoSlug?.split('/') || ''
    const mapFieldsConfig: CollectionField[] =
        safeJsonParse(mapFieldsConfigJson || '[]') || []
    console.log(
        `[GitHub Sync] Collection ${collectionId}: repoSlug=${repoSlug}, owner=${owner}, repo=${repo}`,
    )
    return {
        collectionId,
        owner,
        repo,
        mapFieldsConfig,
        basePath: basePath || '',
        githubAccountLogin: githubAccountLogin || '',
        sessionKey: sessionKey || '',
        projectId: project.id,
        projectName: project.name,
        enablePartialUpdate: Boolean(enablePartialUpdate),
    }
}
