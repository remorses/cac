import { Button } from 'template-rewrite-framer/src/components/Button'
import {
    globalState,
    Paths,
    pluginApiClient,
    withMode,
    LoaderReturnType,
} from 'template-rewrite-framer/src/lib/utils'

import {
    Form,
    redirect,
    useNavigate,
    useNavigation,
    useActionData,
} from 'react-router-dom'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'

export function WebsiteInfo() {
    return {
        path: Paths.getWebsiteInfo,
        element: <GetWebsiteInfo />,
        action,
        handle: 'What is your website url?',
    }
}

async function action({ request }) {
    const formData = await request.formData()
    const domain = formData.get('domain')?.toString()

    if (!domain) {
        return { error: 'Domain is required' }
    }

    try {
        const { error, data } =
            await pluginApiClient.api.plugins.rewritePlugin.getWebsiteHtml.post(
                {
                    domain,
                },
                { fetch: { signal: request.signal } },
            )
        if (error) {
            throw error
        }
        globalState.sourceHtml = data.html
        globalState.sourceUrl = domain
        globalState.extractedDescription = data.extractedDescription || ''
        throw redirect(withMode(Paths.prompt))
    } catch (error) {
        if (error instanceof Response) {
            throw error
        }
        notifyError(error, 'Error processing domain')
        return { error: error.message }
    }
}

function GetWebsiteInfo() {
    const navigate = useNavigate()
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    const actionData = useActionData() as LoaderReturnType<typeof action>

    const handleContinueWithoutContent = () => {
        navigate(withMode(Paths.prompt))
    }

    return (
        <Form method='post' className='flex flex-col grow justify-start gap-4'>
            <div className='flex grow flex-col  justify-start gap-3'>
                <div className='grow flex justify-center flex-col text-balance text-center gap-2'>
                    <div className='font-semibold'>Add your website</div>
                    <div className='opacity-70'>
                        The plugin will apply your content to the current page,
                        or add new text based on your website.
                    </div>
                </div>
                {actionData?.error && (
                    <>
                        <div className='opacity-70 text-red-500 text-center'>
                            {actionData?.error}
                        </div>
                    </>
                )}
                <input
                    placeholder='www.framer.com/home'
                    type='text'
                    autoFocus
                    required
                    name='domain'
                    className='rounded-md p-2 w-full bg-framer-tertiary'
                />
                <Button type='submit' variant='primary' isLoading={isLoading}>
                    Get Content
                </Button>
                {actionData?.error && (
                    <Button onClick={handleContinueWithoutContent}>
                        Continue without content
                    </Button>
                )}
            </div>
        </Form>
    )
}
