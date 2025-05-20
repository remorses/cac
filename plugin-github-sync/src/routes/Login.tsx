import { Button } from 'plugin-migrate/src/components/Button'
// @ts-ignore
import githubHero from '../../public/github-hero.jpeg'

import { notifyError } from '@/lib/errors'
import { useRefreshOnVisible } from 'plugin-migrate/src/lib/hooks'
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
    const data = useLoaderData() as LoaderReturnType<typeof loader>
    const url = framerLoginUrl({
        key,
        pluginName: PluginNames.github,
        code,
        projectId: data?.projectId,
        projectName: data?.projectName,
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
            className='flex flex-col justify-end grow gap-4'
        >
            <div className='flex flex-col items-center gap-6 min-h-[180px]'>
                <div className='flex flex-col '>
                    <img
                        src={githubHero}
                        className='grow object-cover h-[130px] rounded-lg'
                    />
                </div>
                <div className='text-center mx-auto items-center gap-2 flex flex-col max-w-xs'>
                    <div className='font-semibold'>Connect to GitHub</div>
                    <div className='opacity-70 max-w-[200px] text-center text-balance'>
                        Login to sync your GitHub content with Framer
                    </div>
                </div>
            </div>
            <hr className='' />
            <Button
                onClick={async () => {
                    setIsLoading(true)
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

        const collection = await framer.getManagedCollection()
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
        throw redirect(withMode(Paths.chooseRepo))
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

function GithubIcon() {
    return (
        <svg
            viewBox='0 0 98 96'
            className='mx-auto select-none shrink-0 size-[60px]'
        >
            <path
                fill='currentColor'
                d='M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z'
            />
        </svg>
    )
}

export function AntDesignBranchesOutlined(props) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 1024 1024'
            {...props}
        >
            <path
                fill='currentColor'
                d='M740 161c-61.8 0-112 50.2-112 112c0 50.1 33.1 92.6 78.5 106.9v95.9L320 602.4V318.1c44.2-15 76-56.9 76-106.1c0-61.8-50.2-112-112-112s-112 50.2-112 112c0 49.2 31.8 91 76 106.1V706c-44.2 15-76 56.9-76 106.1c0 61.8 50.2 112 112 112s112-50.2 112-112c0-49.2-31.8-91-76-106.1v-27.8l423.5-138.7a50.52 50.52 0 0 0 34.9-48.2V378.2c42.9-15.8 73.6-57 73.6-105.2c0-61.8-50.2-112-112-112m-504 51a48.01 48.01 0 0 1 96 0a48.01 48.01 0 0 1-96 0m96 600a48.01 48.01 0 0 1-96 0a48.01 48.01 0 0 1 96 0m408-491a48.01 48.01 0 0 1 0-96a48.01 48.01 0 0 1 0 96'
            ></path>
        </svg>
    )
}
