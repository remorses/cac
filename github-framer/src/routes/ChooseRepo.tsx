import { Button } from '@/components/Button'
import { notifyError } from '@/lib/errors'
import { useRefreshOnVisible } from '@/lib/hooks'
import {
    getMarkdownPluginData,
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
    useActionData,
    useLoaderData,
    useNavigation,
} from 'react-router'
import { Form } from 'react-router-dom'

function Component() {
    const { repos, owner, repo, basePath } =
        useLoaderData() as LoaderReturnType<typeof loader>
    const actionData = useActionData() as any
    useRefreshOnVisible({ enabled: true })

    let defaultRepoSlug = ''
    if (owner && repo) {
        defaultRepoSlug = `${owner}/${repo}`
    }
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    return (
        <Form method='POST' className='flex flex-col justify-start gap-4'>
            {/* <div className='opacity-70'>Choose repo</div> */}
            <select
                defaultValue={defaultRepoSlug}
                className='w-full'
                name={FormFields.repoSlug}
            >
                {/* <option value=''>Choose a repo</option> */}
                {repos.map((repo) => (
                    <option key={repo.url} value={repo.repoSlug}>
                        {repo.repoSlug}
                    </option>
                ))}
            </select>
            <div className='flex flex-col gap-1'>
                <div className=''>Markdown files base folder</div>
                <div className='opacity-70'>
                    All the markdown files inside this folder will be imported
                </div>
                <input
                    type='text'
                    name={FormFields.basePath}
                    defaultValue={basePath || '/'}
                    placeholder='/path/to/files'
                    className='w-full p-2 mt-1 bg-framer-tertiary rounded-md'
                />
            </div>
            {actionData?.error && (
                <div className='text-red-400'>{actionData.error}</div>
            )}
            <Button isLoading={isLoading} variant='primary' type='submit'>
                Import Markdown Files
            </Button>
        </Form>
    )
}

async function loader({}: LoaderFunctionArgs) {
    const { githubAccountLogin, basePath, owner, repo } =
        await getMarkdownPluginData()
    const { data, error } =
        await pluginApiClient.api.v1.markdownPlugin.githubRepoList.post({
            githubAccountLogin,
        })
    if (error) {
        notifyError(error, 'Failed to load repos')
        throw error
    }
    const { repos } = data
    console.log('repos', repos)
    return { repos, basePath, owner, repo }
}

enum FormFields {
    repoSlug = 'repoSlug',
    basePath = 'basePath',
}

export function ChooseRepo(): RouteObject {
    return {
        handle: 'Choose GitHub Repo',
        path: Paths.chooseRepo,
        loader,
        Component: Component,
        async action({ request }) {
            const formData = await request.formData()
            const { githubAccountLogin } = await getMarkdownPluginData()
            const repoSlug = formData.get(FormFields.repoSlug)?.toString() || ''
            const basePath = formData.get(FormFields.basePath)?.toString() || ''
            if (!repoSlug) {
                return {
                    error: 'No repo selected',
                }
            }
            console.log('basePath', basePath)

            const [owner, repo] = repoSlug.split('/')
            console.log('getting files for ', repoSlug)
            const { data, error } =
                await pluginApiClient.api.v1.markdownPlugin.checkBasePath.post({
                    basePath,
                    owner,
                    repo,
                    githubAccountLogin,
                })
            if (error) {
                return {
                    error: String(error.value),
                }
            }
            if (data.error) {
                return {
                    error: data.error,
                }
            }
            const { formattedBasePath } = data
            const collection = await framer.getCollection()
            await collection.setPluginData(
                PluginDataKeys.githubRepoSlug,
                repoSlug,
            )
            await collection.setPluginData(
                PluginDataKeys.basePath,
                formattedBasePath,
            )
            return redirect(withMode(Paths.mapFields))
        },
    }
}
