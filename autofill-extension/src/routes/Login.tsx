import { Button } from '@/components/Button'
import { notifyError } from '@/lib/errors'
import { ChromeMessages, Paths } from '@/lib/utils'

import { useState } from 'react'
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

const key = generateSecurePassword()
let code = generateShortOtpCode()

let loginCompleted = false

function LoginComponent() {
    const revalidator = useRevalidator()
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'

    return (
        <Form method='POST' className='flex flex-col justify-start gap-4'>
            <Button
                type='submit'
                className='bg-framer-secondary'
                isLoading={isLoading || navigation.state !== 'idle'}
            >
                Screenshot
            </Button>
        </Form>
    )
}

async function loader({}: LoaderFunctionArgs) {
    console.log('login loader')

    return {}
}
async function action({}: LoaderFunctionArgs) {
    console.log('login action')
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const activeTab = tabs[0]
    if (!activeTab.id) {
        console.error('No active tab')
        return
    }
    console.log('sending message to screenshot')
    await chrome.tabs.sendMessage(activeTab.id, {
        action: ChromeMessages.beforeScreenshot,
        options: { format: 'png' },
    })
    return {}
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === ChromeMessages.captureScreenshot) {
        chrome.tabs.captureVisibleTab(request.options, (dataUrl) => {
            const link = document.createElement('a')
            link.download = 'screenshot.png'
            link.href = dataUrl
            // link.click()
            console.log('screenshot captured')
            return {
                ok: true,
            }
        })
    }
})

export function LoginPage(): RouteObject {
    return {
        handle: 'Login',
        path: Paths.login,
        loader,
        action,
        Component: LoginComponent,
    }
}
