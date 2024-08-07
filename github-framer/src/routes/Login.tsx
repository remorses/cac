import { Button } from 'template-rewrite-framer/src/components/Button'
import { notifyError } from '@/lib/errors'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import { Paths, pluginApiClient, PluginDataKeys, withMode } from '@/lib/utils'
import { framer } from 'framer-plugin'
import { useState } from 'react'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useNavigation,
    useRevalidator,
} from 'react-router'
import { GithubLoginRequestData } from 'website/src/lib/github.server'
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
    const url = framerLoginUrl({
        key,
        pluginName: PluginNames.github,
        code,
    })
    useRefreshOnVisible({ enabled: !isLoading })
    return (
        <div className='flex flex-col justify-start gap-4'>
            {!isLoading ? (
                <div className='opacity-70'>
                    Login so we can keep your website data and progress
                </div>
            ) : (
                <div className='opacity-70'>
                    This is your login confirmation code, click "confirm code"
                    in your browser
                </div>
            )}
            {isLoading && (
                <div className='flex flex-col gap-4'>
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
                    <div className='opacity-70'>
                        Click{' '}
                        <a href={url} target='_blank'>
                            here
                        </a>{' '}
                        if you are not automatically redirected
                    </div>
                </div>
            )}
            <Button
                onClick={async () => {
                    // if (isLoading) {
                    //     return
                    // }
                    setIsLoading(true)
                    try {
                        await sleep(1_000)
                        window.open(url, '_blank')

                        while (!loginCompleted) {
                            // slow because i already check when the iframe becomes visible
                            await sleep(7_000)
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
                className='bg-framer-secondary'
                isLoading={isLoading || navigation.state !== 'idle'}
            >
                Login With GitHub
            </Button>
        </div>
    )
}

async function loader({}: LoaderFunctionArgs) {
    console.log('login loader')
    const { data, error } =
        await pluginApiClient.api.plugins.getSessionForKey.post({
            key,
        })
    if (error) {
        notifyError(error, 'Error logging in for framer')
        throw error
    }
    if (data.key) {
        console.log('login was completed, got session', data)

        const collection = await framer.getCollection()
        let requestData: GithubLoginRequestData = (data.requestData ||
            {}) as any

        if (requestData.githubAccountLogin) {
            await collection.setPluginData(
                PluginDataKeys.githubAccountLogin,
                requestData.githubAccountLogin,
            )
        }
        await collection.setPluginData(PluginDataKeys.sessionKey, data.key)

        loginCompleted = true
        return redirect(withMode(Paths.chooseRepo))
    } else {
        console.log(data)
    }
    return {}
}

export function LoginPage(): RouteObject {
    return {
        handle: 'Login',
        path: Paths.login,
        loader,
        Component: LoginComponent,
    }
}
