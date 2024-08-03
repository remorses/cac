import { Button } from '@/components/Button'
import { streamText } from 'ai'
import { useChat } from 'ai/react'
import { notifyError } from '@/lib/errors'
import { ChromeMessages, Paths } from '@/lib/utils'

import { useEffect, useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useNavigation,
    useRevalidator,
} from 'react-router'
import { Form } from 'react-router-dom'

import {
    framerLoginUrl,
    generateSecurePassword,
    generateShortOtpCode,
    PluginNames,
    sleep,
} from 'website/src/lib/utils'

function LoginComponent() {
    const revalidator = useRevalidator()
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    const [inputs, setInputs] = useState([] as string[])
    useEffect(() => {
        const callback = async (message, sender, sendResponse) => {
            console.log('message', message)
            if (message.action === ChromeMessages.formInputFound) {
                setInputs((inputs) => [...inputs, message.data.description])
                sendResponse({ ok: true })
            }
        }
        chrome.runtime.onMessage.addListener(callback)
        return () => {
            chrome.runtime.onMessage.removeListener(callback)
        }
    }, [])

    return (
        <Form method='POST' className='flex flex-col justify-start gap-4'>
            <Button
                type='submit'
                className='bg-framer-secondary'
                isLoading={isLoading || navigation.state !== 'idle'}
            >
                Screenshot
            </Button>
            <pre>{JSON.stringify(inputs, null, 2)}</pre>
        </Form>
    )
}

async function loader({}: LoaderFunctionArgs) {
    console.log('login loader')

    return {}
}
async function action({}: LoaderFunctionArgs) {
    await chrome.runtime.sendMessage({ action: ChromeMessages.start })
    return {}
}

export function LoginPage(): RouteObject {
    return {
        handle: 'Login',
        path: Paths.login,
        loader,
        action,
        Component: LoginComponent,
    }
}
