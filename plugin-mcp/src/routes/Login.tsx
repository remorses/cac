import { notifyError } from 'plugin-mcp/src/lib/errors'
import {
    LoaderReturnType,
    Paths,
    pluginApiClient,
    withMode,
    LocalStorageKeys,
} from 'plugin-mcp/src/lib/utils'
import { framer } from 'framer-plugin'
import { useState, useEffect } from 'react'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useLoaderData,
    useNavigation,
    useRevalidator,
} from 'react-router'
import { useRefreshOnVisible } from 'plugin-mcp/src/lib/hooks'
import { Button } from 'plugin-mcp/src/components/Button'
import {
    framerLoginUrl,
    generateSecurePassword,
    generateShortOtpCode,
    PluginNames,
    sleep,
} from 'website/src/lib/utils'

let key = generateSecurePassword()
let code = generateShortOtpCode()

let loginCompleted = false

function LoginComponent() {
    const [isLoading, setIsLoading] = useState(false)
    const revalidator = useRevalidator()
    const navigation = useNavigation()
    const data = useLoaderData() as LoaderReturnType<typeof loader>
    const url = framerLoginUrl({
        key,
        pluginName: PluginNames.mcp,
        code,
        projectId: data?.projectId,
        projectName: data?.projectName,
        framerUserId: data?.framerUserId,
    })
    useRefreshOnVisible({ enabled: true })
    let containerStyle: React.CSSProperties = {}
    if (isLoading) {
        return (
            <div style={containerStyle} className='flex flex-col gap-3'>
                <div className='flex grow shrink-0 justify-center h-full flex-col gap-3 items-center'>
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
                        if you're not automatically redirected. Confirm in your
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
        <div style={containerStyle} className='flex flex-col justify-end gap-3'>
            <div className='flex flex-col min-h-[140px]'>
                <div className='text-center mx-auto my-8 mt-10 grow gap-2 flex flex-col max-w-xs'>
                    <div className='font-semibold text-balance max-w-[300px] self-center text-center'>
                        Control Framer with MCP
                    </div>
                    <div className='opacity-70 text-center text-balance'></div>
                    <div className='opacity-70 text-center text-balance'>
                        login is necessary to prevent abuse and track usage
                    </div>
                </div>
            </div>
            <Button
                onClick={async () => {
                    setIsLoading(true)
                    loginCompleted = false
                    try {
                        window.open(url, '_blank')

                        while (!loginCompleted) {
                            await sleep(2_000)
                            console.log('checking if login was completed')
                            revalidator.revalidate()
                        }
                    } catch (e) {
                        notifyError(e, 'failed to login')
                    } finally {
                        setIsLoading(false)
                    }
                }}
                variant='primary'
                isLoading={isLoading || navigation.state !== 'idle'}
            >
                Login With Google
            </Button>
        </div>
    )
}

async function loader({}: LoaderFunctionArgs) {
    console.log('login loader, checking session')

    console.time('login loader')
    const [user, sessionResponse, projectInfo] = await Promise.all([
        framer.getCurrentUser(),
        pluginApiClient.api.plugins.getSessionForKey.post({ key }),
        framer.getProjectInfo(),
    ])
    console.timeEnd('login loader')

    const framerUserId = user.id
    const { data, error } = sessionResponse

    if (error) {
        notifyError(error, 'Error logging in for framer')
        throw error
    }
    if (data.key) {
        console.log('login was completed, got session', data)

        localStorage.setItem(LocalStorageKeys.sessionId, data.key)

        loginCompleted = true
        key = generateSecurePassword()
        throw redirect(withMode(Paths.main))
    } else {
        console.log(data)
    }
    const { id: projectId, name: projectName } = projectInfo
    return { projectId, projectName, framerUserId }
}

export function LoginPage(): RouteObject {
    return {
        handle: 'Login',
        path: Paths.login,
        loader,
        Component: LoginComponent,
    }
}
