import { Button } from 'template-rewrite-framer/src/components/Button'
import { Paths, formatLargeNumber, pluginApiClient } from 'template-rewrite-framer/src/lib/utils'
import {
    LoaderFunctionArgs,
    RouteObject,
    useActionData,
    useNavigate,
} from 'react-router'
import { Form } from 'react-router-dom'

import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import {} from 'react-router'

async function loader({}: LoaderFunctionArgs) {
    return {}
}

export function LicenseKey(): RouteObject {
    return {
        handle: 'Redeem License Key',
        path: Paths.licenseKey,

        Component,
        async action({ request }) {
            const formData = await request.formData()
            const licenseKey = formData.get('licenseKey')?.toString()
            console.log(`validating license key ${licenseKey}`)
            if (!licenseKey) {
                return {
                    error: 'No license key provided',
                }
            }
            const { data, error } =
                await pluginApiClient.api.plugins.rewritePlugin.activateLicense.post({
                    licenseKey,
                })
            if (error) {
                return {
                    error: error.value,
                }
            }
            const { credits, valid } = data
            return {
                credits,
                valid,
                message: `License key activated, ${formatLargeNumber(credits)} credits added`,
            }
        },
    }
}

function Component() {
    useRefreshOnVisible({ enabled: true })
    // const {} = useLoaderData() as LoaderReturnType<typeof loader>
    const actionData = useActionData() as any

    // const isDocumentVisible = useIsDocumentVisibile()

    const navigate = useNavigate()
    return (
        <div className='flex flex-col justify-start gap-4'>
            <Form
                method='POST'
                className='flex items-start flex-col justify-between gap-2'
            >
                <div className=''>Redeem credits</div>
                <div className='opacity-60'>
                    Some Framer templates comes with a plugin license key, you
                    can redeem them here
                </div>

                <input
                    name='formKey'
                    value={'licenseKey'}
                    type='hidden'
                    hidden
                />

                <div className='flex grow items-stretch w-full flex-col gap-2'>
                    <input
                        required
                        placeholder='38b1460a-5104-4067-a91d-77b872934d51'
                        type='text'
                        name='licenseKey'
                        className='rounded-md p-2 w-full bg-framer-tertiary'
                    />
                    <Button type='submit' className='w-auto'>
                        Activate License Key
                    </Button>
                    {actionData?.error && (
                        <div className='text-red-400'>{actionData.error}</div>
                    )}
                    {actionData?.message && (
                        <div className=''>{actionData.message}</div>
                    )}
                </div>
            </Form>
        </div>
    )
}
