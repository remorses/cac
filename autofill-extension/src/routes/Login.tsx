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
    const [fileName, setFileName] = useState(null as string | null)

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            setFileName(file.name)
        }
    }
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    const [inputs, setInputs] = useState([] as string[])
    useEffect(() => {
        const callback = async (message, sender, sendResponse) => {
            console.log('message', message)
            if (message.action === ChromeMessages.formInputFound) {
                let text = message.data.description
                if (message.data.value) {
                    text = `filling ${text} with ${message.data.value}`
                }
                setInputs((inputs) => [...inputs, text])
                sendResponse({ ok: true })
            }
        }
        chrome.runtime.onMessage.addListener(callback)
        return () => {
            chrome.runtime.onMessage.removeListener(callback)
        }
    }, [])

    return (
        <Form
            encType='multipart/form-data'
            method='POST'
            className='flex flex-col justify-start gap-4'
        >
            <Button
                type='submit'
                className='bg-framer-secondary'
                isLoading={isLoading || navigation.state !== 'idle'}
            >
                Screenshot
            </Button>
            <div>
                <input
                    type='file'
                    name='fileInput'
                    onChange={handleFileChange}
                />
                {fileName && (
                    <div>
                        <p>File Data URL:</p>
                        <textarea
                            value={fileName}
                            readOnly
                            rows={10}
                            cols={50}
                        />
                    </div>
                )}
            </div>
            <pre>{JSON.stringify(inputs, null, 2)}</pre>
        </Form>
    )
}

async function loader({}: LoaderFunctionArgs) {
    console.log('login loader')

    return {}
}
async function action({ request }: LoaderFunctionArgs) {
    const formData = await request.formData()
    const file = formData.get('fileInput') as File
    const dataUrl = await getFileDataUrl(file)
    const image: ImageActionData = {
        name: file.name,
        dataUrl,
    }
    await chrome.runtime.sendMessage({
        action: ChromeMessages.start,
        files: [image],
    })
    return {}
}

export type ImageActionData = {
    name: string
    dataUrl: string
}

const getFileDataUrl = (file) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e: any) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsDataURL(file)
    })
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
