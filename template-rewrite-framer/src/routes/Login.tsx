import { Button } from 'template-rewrite-framer/src/components/Button'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import { Paths, pluginApiClient, PluginDataKeys, withMode } from 'template-rewrite-framer/src/lib/utils'
import { framer } from 'framer-plugin'
import { useState } from 'react'
import {
    LoaderFunctionArgs,
    redirect,
    RouteObject,
    useNavigation,
    useRevalidator,
} from 'react-router'
import {
    framerLoginUrl,
    generateSecurePassword,
    PluginNames,
    sleep,
} from 'website/src/lib/utils'

const key = generateSecurePassword()

let loginCompleted = false

function LoginComponent() {
    const [isLoading, setIsLoading] = useState(false)
    const revalidator = useRevalidator()
    const navigation = useNavigation()
    useRefreshOnVisible({ enabled: true })
    return (
        <div className='flex flex-col justify-start gap-4'>
            <div className='opacity-70'>
                Login so we can keep your website data and progress
            </div>
            <Button
                onClick={async () => {
                    setIsLoading(true)
                    try {
                        const url = framerLoginUrl({
                            key,
                            pluginName: PluginNames.migrate,
                        })
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
                variant='primary'
                isLoading={isLoading || navigation.state !== 'idle'}
            >
                Login With Google
            </Button>
        </div>
    )
}

async function loader({}: LoaderFunctionArgs) {
    console.log('login loader')
    const { data, error } = await pluginApiClient.api.plugins.getSessionForKey.post({
        key,
    })
    if (error) {
        notifyError(error, 'Error logging in for framer')
        throw error
    }
    if (data.key) {
        console.log('login was completed, got session', data)

        let requestData: any = (data.requestData || {}) as any

        await framer.setPluginData(PluginDataKeys.sessionKey, data.key)

        loginCompleted = true
        return redirect(withMode(Paths.doYouAlreadyHaveAWebsite))
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
