import { Button } from '@/components/Button'
import { ChromeMessages, ChromeMessageType, Paths } from '@/lib/utils'

import { useEffect, useState } from 'react'
import { LoaderFunctionArgs, RouteObject, useNavigation } from 'react-router'
import { Form } from 'react-router-dom'

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
        const callback = (request: ChromeMessageType, sender, sendResponse) => {
            console.log('message', request)
            Promise.resolve()
                .then(async () => {
                    switch (request.action) {
                        case ChromeMessages.formInputFound: {
                            let text = request.data.description
                            if (request.data.value) {
                                text = `filling ${text} with ${request.data.value}`
                            }
                            setInputs((inputs) => [...inputs, text])
                            return { ok: true }
                        }
                    }
                })
                .then((response) => sendResponse(response))
                .catch((error) => {
                    console.error('Error processing message', error)
                    sendResponse({ status: 'error', error: error.message })
                })

            return true
        }
        return () => {
            chrome.runtime.onMessage.removeListener(callback)
        }
    }, [])

    return (
        <div className='flex flex-col '>
            <Form
                encType='multipart/form-data'
                method='POST'
                className='flex flex-col p-4 justify-start gap-4'
            >
                <Button
                    type='submit'
                    variant='primary'
                    isLoading={isLoading || navigation.state !== 'idle'}
                >
                    Screenshot
                </Button>
                <div>
                    <input
                        type='file'
                        name='fileInput'
                        multiple
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
        </div>
    )
}

async function loader({}: LoaderFunctionArgs) {
    console.log('login loader')

    return {}
}
async function action({ request, context }: LoaderFunctionArgs) {
    const formData = await request.formData()
    const files = formData.getAll('fileInput') as File[]

    await chrome.runtime.sendMessage({
        action: ChromeMessages.start,
        files: await Promise.all(
            files.map(async (file) => {
                const dataUrl = await getFileDataUrl(file)
                return {
                    name: file.name,
                    dataUrl,
                }
            }),
        ),
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
