import { Button } from 'plugin-migrate/src/components/Button'
// @ts-ignore
import logo from 'plugin-migrate/public/gradient-icon@2x.png'
import { notifyError } from 'plugin-mcp'
import { useRefreshOnVisible } from 'plugin-migrate/src/lib/hooks'
import {
    LoaderReturnType,
    Paths,
    pluginApiClient,
    PluginDataKeys,
    withMode,
} from 'plugin-migrate/src/lib/utils'
import { framer } from 'framer-plugin'
import { useState } from 'react'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useLoaderData,
    useNavigation,
    useRevalidator,
} from 'react-router'
import {
    framerLoginUrl,
    generateSecurePassword,
    generateShortOtpCode,
    PluginNames,
    sleep,
} from 'website/src/lib/utils'

const key = generateSecurePassword()
let code = generateShortOtpCode()

let loginCompleted = false

function LoginComponent() {
    const [isLoading, setIsLoading] = useState(false)
    const revalidator = useRevalidator()
    const navigation = useNavigation()
    const data = useLoaderData() as LoaderReturnType<typeof loader>
    const url = framerLoginUrl({
        key,
        pluginName: PluginNames.migrate,
        projectId: data?.projectId,
        projectName: data?.projectName,
        code,
    })
    useRefreshOnVisible({ enabled: true })
    let containerStyle: React.CSSProperties = {}
    if (isLoading) {
        return (
            <div style={containerStyle} className='flex flex-col grow gap-4'>
                <div className='flex grow shrink-0 justify-center h-full flex-col gap-4 items-center'>
                    <div className='flex font-mono flex-row gap-2 text-xl'>
                        {code.split('').map((char, i) => {
                            return (
                                <div
                                    key={i}
                                    className='p-px rounded-md bg-framer-tertiary px-2'
                                >
                                    {char}
                                </div>
                            )
                        })}
                    </div>
                    <div className='opacity-70 text-balance text-center'>
                        This is your login confirmation code. Click{' '}
                        <a href={url} target='_blank'>
                            here
                        </a>{' '}
                        if you’re not automatically redirected. Confirm in your
                        browser.
                    </div>
                </div>

                <Button variant='primary' disabled>
                    Loading...
                </Button>
            </div>
        )
    }
    return (
        <div
            style={containerStyle}
            className='flex flex-col justify-end grow gap-8'
        >
            <div className='h-[180px] flex flex-col items-center justify-center'>
                <img
                    src={logo}
                    className='mx-auto select-none shrink-0 size-[230px]'
                />
            </div>
            <div className='text-center  mx-auto items-center gap-2 flex flex-col max-w-xs'>
                <div className='font-semibold'>Connect to Migrate</div>
                <div className='opacity-70 text-balance'>
                    Add your website content to your project in a single click.
                </div>
            </div>

            <Button
                onClick={async () => {
                    setIsLoading(true)
                    try {
                        window.open(url, '_blank')

                        while (!loginCompleted) {
                            // slow because i already check when the iframe becomes visible
                            await sleep(3000)
                            console.log('checking if login was completed')
                            revalidator.revalidate()
                        }
                    } catch (e) {
                        notifyError(e, 'failed to login')
                    } finally {
                        setIsLoading(false)
                        // revalidator.revalidate()
                    }
                }}
                variant='primary'
                isLoading={isLoading || navigation.state !== 'idle'}
            >
                Login with Google
            </Button>
        </div>
    )
}

async function loader({}: LoaderFunctionArgs) {
    const { id: projectId, name: projectName } = await framer.getProjectInfo()
    const { data, error } =
        await pluginApiClient.api.plugins.getSessionForKey.post({
            key: key,
            projectId: projectId,
        })
    if (error) {
        notifyError(error, 'Error logging in for framer')
        throw error
    }
    // if (loginCompleted) {
    //     return redirect(withMode(Paths.doYouAlreadyHaveAWebsite))
    // }
    if (data.key) {
        await framer.setPluginData(PluginDataKeys.sessionKey, data.key)

        loginCompleted = true
        throw redirect(withMode(Paths.doYouAlreadyHaveAWebsite))
    } else {
        console.log(data)
    }
    return { projectId, projectName }
}

export function LoginPage(): RouteObject {
    return {
        handle: 'Login',
        path: Paths.login,
        loader,
        Component: LoginComponent,
    }
}
