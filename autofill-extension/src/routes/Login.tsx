import { Button } from '@/components/Button'
import {
    ChromeMessageType,
    LoaderReturnType,
    Paths,
    PopupLoaderData,
} from '@/lib/utils'

import { useEffect, useRef, useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useLoaderData,
    useNavigation,
    useRevalidator,
} from 'react-router'
import { Form } from 'react-router-dom'

function LoginComponent() {
    const { canUndo } = useLoaderData() as LoaderReturnType<typeof loader>

    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    const [inputs, setInputs] = useState([] as string[])
    useEffect(() => {
        const callback = (request: ChromeMessageType, sender, sendResponse) => {
            console.log('message', request)
            Promise.resolve()
                .then(async () => {
                    switch (request.action) {
                        case 'formInputFound': {
                            let text = request.data.description
                            // if (request.data.value) {
                            //     text = `filling ${text} with ${request.data.value}`
                            // }
                            setInputs((inputs) => [...inputs, text])
                            return { ok: true }
                        }
                        case 'setHintValue': {
                            let text = request.data.description
                            // if (request.data.value) {
                            //     text = `filling ${text} with ${request.data.value}`
                            // }
                            setInputs((inputs) => [...inputs, text])
                            revalidator.revalidate()
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
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustHeight = (element) => {
        element.style.height = 'auto'
        element.style.height = `${element.scrollHeight}px`
    }

    const revalidator = useRevalidator()
    const formRef = useRef<HTMLFormElement>(null)

    return (
        <div className='flex flex-col '>
            <Form
                encType='multipart/form-data'
                method='POST'
                ref={formRef}
                className='flex flex-col justify-start gap-3'
            >
                <div className='flex flex-col gap-1'>
                    <div className=''>
                        Write here the content that should be submitted in the
                        form.
                    </div>
                    <textarea
                        name='description'
                        ref={textareaRef}
                        required
                        onChange={(e) => {
                            // setDescription(e.target.value)
                            adjustHeight(e.target)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault()
                                formRef.current?.submit()
                            }
                        }}
                        className='p-2 py-2 shrink-0 leading-relaxed mt-1 w-full min-h-[80px]'
                        autoFocus
                        placeholder={`Company name: x \nTwitter url: https://twitter.com/x\nLinkedin url: https://linkedin.com/x`}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <div className=''>Add files for AI to use</div>
                    <input type='file' name='fileInput' multiple />
                </div>
                <Button
                    type='submit'
                    variant='primary'
                    isLoading={isLoading || navigation.state !== 'idle'}
                >
                    Start Filling Form
                </Button>
                {canUndo && (
                    <Button
                        type='button'
                        onClick={async () => {
                            await chrome.runtime.sendMessage({
                                action: 'undoFilling',
                            } satisfies ChromeMessageType)
                            revalidator.revalidate()
                        }}
                        isLoading={isLoading || navigation.state !== 'idle'}
                    >
                        Undo Filling
                    </Button>
                )}
            </Form>
        </div>
    )
}

async function loader({}: LoaderFunctionArgs) {
    const res: ChromeMessageType = await chrome.runtime.sendMessage({
        action: 'popupLoader',
    } satisfies ChromeMessageType)
    if (res.action === 'popupLoader' && res.data) {
        return res.data!
    }
    return { canUndo: false } satisfies PopupLoaderData
}
async function action({ request, context }: LoaderFunctionArgs) {
    const formData = await request.formData()
    const filesInputs = formData.getAll('fileInput') as File[]
    const files = await Promise.all(
        filesInputs
            .filter((file) => {
                // skip empty files
                return file.size > 0
            })
            .map(async (file) => {
                const dataUrl = await getFileDataUrl(file)
                return {
                    name: file.name,
                    dataUrl,
                }
            }),
    )
    console.log('files', files)

    await chrome.runtime.sendMessage({
        action: 'start',
        files,
    } satisfies ChromeMessageType)
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
