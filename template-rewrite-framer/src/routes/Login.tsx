import { Button } from 'template-rewrite-framer/src/components/Button'
// @ts-ignore
import logo from 'template-rewrite-framer/public/gradient-icon.png'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import {
    Paths,
    pluginApiClient,
    PluginDataKeys,
    withMode,
} from 'template-rewrite-framer/src/lib/utils'
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
        pluginName: PluginNames.migrate,
        code,
    })
    useRefreshOnVisible({ enabled: !isLoading })
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
                    loading...
                </Button>
            </div>
        )
    }
    return (
        <div
            style={containerStyle}
            className='flex flex-col justify-end grow gap-8'
        >
            <img src={logo} className='mx-auto shrink-0 -my-12 size-[230px]' />
            <div className='text-center  mx-auto items-center gap-2 flex flex-col max-w-xs'>
                <div className=''>Connect to Migrate</div>
                <div className='opacity-70 text-balance'>
                    Add your website content to your project in a single click.
                </div>
            </div>

            <Button
                onClick={async () => {
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
