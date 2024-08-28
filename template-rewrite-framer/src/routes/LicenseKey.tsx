import { Button } from 'template-rewrite-framer/src/components/Button'
import {
    Paths,
    formatLargeNumber,
    pluginApiClient,
} from 'template-rewrite-framer/src/lib/utils'
import {
    LoaderFunctionArgs,
    RouteObject,
    useActionData,
    useNavigate,
    useNavigation,
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
                await pluginApiClient.api.plugins.rewritePlugin.activateLicense.post(
                    {
                        licenseKey,
                    },
                )
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

    const actionData = useActionData() as any

    const navigation = useNavigation()
    const isLoading =
        navigation.state !== 'idle' && Boolean(navigation.formData)
    const navigate = useNavigate()
    return (
        <Form
            method='POST'
            className='flex items-start flex-col justify-between gap-2 grow'
        >
            <div className='flex flex-col text-center justify-center items-center text-balance gap-2 grow'>
                <div className='font-semibold'>Redeem credits</div>
                <div className='opacity-60'>
                    Some Framer templates come with a plugin license key, you
                    can redeem them here
                </div>
            </div>

            <input name='formKey' value={'licenseKey'} type='hidden' hidden />

            <div className='flex items-stretch w-full flex-col gap-3'>
                <input
                    required
                    placeholder='License Key'
                    type='text'
                    name='licenseKey'
                    className='rounded-md p-2 w-full bg-framer-tertiary'
                />
                <div className='flex gap-3 w-full'>
                    <Button
                        onClick={() => {
                            navigate(-1)
                        }}
                        type='button'
                        className='grow w-auto'
                    >
                        Go Back
                    </Button>
                    <Button
                        variant='primary'
                        type='submit'
                        // disabled={isLoading}
                        isLoading={isLoading}
                        className='w-auto grow'
                    >
                        Activate Key
                    </Button>
                </div>
                {actionData?.error && (
                    <div className='text-red-400'>{actionData.error}</div>
                )}
                {actionData?.message && (
                    <div className=''>{actionData.message}</div>
                )}
            </div>
        </Form>
    )
}
