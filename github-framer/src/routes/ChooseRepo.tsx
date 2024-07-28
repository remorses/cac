import { Button } from '@/components/Button'
import { MapDatabaseFields } from '@/components/MapFields'
import { notifyError } from '@/lib/errors'
import { useRefreshOnVisible } from '@/lib/hooks'
import {
    LoaderReturnType,
    Paths,
    pluginApiClient,
    PluginDataKeys,
    withMode,
} from '@/lib/utils'
import { framer } from 'framer-plugin'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useLoaderData,
} from 'react-router'
import { Form } from 'react-router-dom'

function Component() {
    const { repos } = useLoaderData() as LoaderReturnType<typeof loader>
    const actionData = useLoaderData() as any
    useRefreshOnVisible({ enabled: true })

    return (
        <MapDatabaseFields
            database={{
                properties: {
                    something: {
                        id: 'something',
                        name: 'Something',
                        values: ['value1', 'value2', 'value3'],
                    },
                    x: {
                        id: 'x',
                        name: 'x',
                        values: [false, true],
                    },
                },
            }}
            isLoading={false}
            onSubmit={async (values) => {
                console.log('values', values)
            }}
            error={null}
            pluginContext={{
                type: 'create',
                collectionFields: [],
                ignoredFieldIds: [],
            }}
        />
    )
    return (
        <Form method='POST' className='flex flex-col justify-start gap-4'>
            {/* <div className='opacity-70'>Choose repo</div> */}
            <select className='w-full' name='repoSlug'>
                <option value=''>Choose a repo</option>
                {repos.map((repo) => (
                    <option key={repo.url} value={repo.repoSlug}>
                        {repo.repoSlug}
                    </option>
                ))}
            </select>
            <Button type='submit'>Import Markdown Files</Button>
            {actionData.error && (
                <div className='text-red-500'>{actionData.error}</div>
            )}
        </Form>
    )
}

async function loader({}: LoaderFunctionArgs) {
    const { data, error } =
        await pluginApiClient.api.v1.markdownPlugin.githubRepoList.get({})
    if (error) {
        notifyError(error, 'Failed to load repos')
        throw error
    }
    const { repos } = data
    console.log('repos', repos)
    return { repos }
}

export function ChooseRepo(): RouteObject {
    return {
        handle: 'Choose GitHub Repo',
        path: Paths.chooseRepo,
        loader,
        Component: Component,
        async action({ request }) {
            const formData = await request.formData()
            const repoSlug = formData.get('repoSlug')?.toString() || ''
            if (!repoSlug) {
                return {
                    error: 'No repo selected',
                }
            }
            await framer.setPluginData(PluginDataKeys.githubRepoSlug, repoSlug)
            return redirect(withMode(Paths.sync))
        },
    }
}
