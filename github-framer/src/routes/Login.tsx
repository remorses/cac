import { Button } from '@/components/Button'
import { notifyError } from '@/lib/errors'
import { useRefreshOnVisible } from '@/lib/hooks'
import { supabase } from '@/lib/supabase-framer'
import { Paths, pluginApiClient, PluginDataKeys, withMode } from '@/lib/utils'
import { framer } from 'framer-plugin'
import { useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    redirect,
    useNavigate,
    useRevalidator,
} from 'react-router'
import { GithubLoginRequestData } from 'website/src/lib/github.server'
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
    const navigate = useNavigate()
    useRefreshOnVisible({ enabled: true })
    return (
        <div className='flex flex-col justify-start gap-4'>
            <div className='opacity-70'>
                Login so we can keep your website data and progress
            </div>
            <Button
                onClick={async () => {
                    // if (isLoading) {
                    //     return
                    // }
                    setIsLoading(true)
                    try {
                        const url = framerLoginUrl({
                            key,
                            pluginName: PluginNames.markdown,
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
                className='bg-framer-secondary'
                isLoading={isLoading}
            >
                Login With Github
            </Button>
        </div>
    )
}

async function loader({}: LoaderFunctionArgs) {
    console.log('login loader')
    const { data, error } = await pluginApiClient.api.v1.getSessionForKey.post({
        key,
    })
    if (error) {
        notifyError(error, 'Error logging in for framer')
        throw error
    }
    if (data.session) {
        console.log('login was completed, got session', data)
        // make it smaller
        // data.session.user = undefined as any
        const collection = await framer.getCollection()
        let requestData: GithubLoginRequestData = (data.requestData ||
            {}) as any
        if (!requestData?.githubAccountLogin) {
            console.log('requestData', requestData)
            throw new Error('No github account login found')
        }
        await collection.setPluginData(
            PluginDataKeys.githubAccountLogin,
            requestData.githubAccountLogin,
        )

        const { error } = await supabase.auth.setSession(data.session)
        if (error) {
            throw error
        }
        loginCompleted = true
        return redirect(withMode(Paths.chooseRepo))
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
