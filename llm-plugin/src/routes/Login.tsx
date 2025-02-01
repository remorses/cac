import { Button } from 'template-rewrite-framer/src/components/Button'
// @ts-ignore
import hero from '../../public/code-tailwind.jpeg'

import { notifyError } from '@/lib/errors'
import {
    LoaderReturnType,
    Paths,
    pluginApiClient,
    PluginDataKeys,
    withMode,
} from '@/lib/utils'
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
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'
import {
    framerLoginUrl,
    generateSecurePassword,
    generateShortOtpCode,
    PluginNames,
    sleep,
} from 'website/src/lib/utils'
import image from '../ai_rewrite_image@4x.png'

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
        pluginName: PluginNames.llm,
        code,
        projectId: data?.projectId,
        projectName: data?.projectName,
    })
    useRefreshOnVisible({ enabled: true })
    let containerStyle: React.CSSProperties = {}
    if (isLoading) {
        return (
            <div style={containerStyle} className='flex flex-col grow gap-3'>
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
        <div
            style={containerStyle}
            className='flex flex-col justify-end grow gap-3'
        >
            <div className='flex flex-col '>
                <div className='flex flex-col grow -mt-2 -m-[48px]'>
                    <img
                        src={image}
                        className='grow select-none pointer-events-none invert dark:invert-0 h-[260px] object-contain overflow-hidden w-full rounded-md'
                    />
                </div>
                <div className='text-center mx-auto my-4 grow gap-2 flex flex-col max-w-xs'>
                    {/* <div className='font-semibold'>Connect to Google</div> */}
                    <div className=' dark:text-purple-50 text-sm max-w-[200px] leading-relaxed text-center text-balance'>
                        login with Google to track your progress
                    </div>
                </div>
            </div>
            {/* <hr className='' /> */}
            <Button
                onClick={async () => {
                    setIsLoading(true)
                    try {
                        window.open(url, '_blank')

                        while (!loginCompleted) {
                            await sleep(7_000)
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

        await localStorage.setItem(PluginDataKeys.sessionKey, data.key)
        await framer.setPluginData(PluginDataKeys.sessionKey, data.key)

        loginCompleted = true
        throw redirect(withMode(Paths.prompt))
    } else {
        console.log(data)
    }
    const { id: projectId, name: projectName } = await framer.getProjectInfo()
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
