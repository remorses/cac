import { Button } from '@/components/Button'
import {
    ChromeMessageType,
    ExtensionStorage,
    generateRandomString,
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
const FormFields = {
    description: 'description',
    filesInput: 'filesInput',
    saveAsPreset: 'saveAsPreset',
} as const

function LoginComponent() {
    const { canUndo, presets } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    console.log('presets', presets)
    let [presetId, setPresetId] = useState(() => generateRandomString(10))
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

    async function updatePreset() {
        const prompt = textareaRef.current?.value || 'Empty prompt'
        const filesInput: HTMLInputElement =
            formRef.current?.elements.namedItem(FormFields.filesInput) as any

        await chrome.storage.local.set({
            presets: [
                ...(presets || []),
                {
                    prompt,
                    id: presetId,
                    files: [...(filesInput?.files || [])].map((file) => ({
                        name: file.name,
                        dataUrl: URL.createObjectURL(file),
                    })),
                },
            ],
        } satisfies ExtensionStorage)
    }
    return (
        <div className='flex flex-col '>
            <Form
                encType='multipart/form-data'
                method='POST'
                ref={formRef}
                className='flex flex-col justify-start gap-3'
            >
                <div className='flex items-center'>
                    <div className='grow'></div>
                    <select
                        onChange={async (e) => {
                            setPresetId(e.target.value)
                            const preset = presets?.find(
                                (x) => x.id === e.target.value,
                            )
                            if (!preset) {
                                return
                            }
                            const promptInput: HTMLInputElement =
                                formRef.current?.elements.namedItem(
                                    FormFields.description,
                                ) as any
                            if (promptInput) {
                                promptInput.value = preset.prompt
                            }
                            const files = preset.files.filter(Boolean)

                            const fileInput: HTMLInputElement =
                                formRef.current?.elements.namedItem(
                                    FormFields.filesInput,
                                ) as any
                            if (!fileInput) {
                                return
                            }
                            const dataTransfer = new DataTransfer()
                            for (const file of files) {
                                const response = await fetch(file.dataUrl)
                                if (!response.ok) {
                                    console.error(
                                        'cannot fetch file',
                                        file.dataUrl.slice(0, 100),
                                    )
                                    continue
                                }
                                const blob = await response.blob()

                                dataTransfer.items.add(
                                    new File([blob], file.name),
                                )
                            }
                            fileInput.files = dataTransfer.files
                        }}
                        value={presetId}
                        name='preset'
                    >
                        <option value=''>Choose a preset</option>
                        {presets?.map((preset, index) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.prompt
                                    .slice(0, 100)
                                    .replace(/\n/g, ' ')
                                    .replace(/\s+/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='flex flex-col gap-1'>
                    <div className=''>
                        Write here the content that should be submitted in the
                        form.
                    </div>
                    <textarea
                        name={FormFields.description}
                        ref={textareaRef}
                        required
                        onChange={(e) => {
                            // setDescription(e.target.value)
                            adjustHeight(e.target)
                            // updatePreset()
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
                    <input
                        type='file'
                        className='max-w-max'
                        name={FormFields.filesInput}
                        multiple
                    />
                </div>
                <div className=''>
                    <div className='flex items-center'>
                        <input
                            checked={!!presets?.find((x) => x.id === presetId)}
                            onChange={async (e) => {
                                if (!e.target.checked) {
                                    await chrome.storage.local.set({
                                        presets:
                                            presets?.filter(
                                                (x) => x.id !== presetId,
                                            ) || [],
                                    } satisfies ExtensionStorage)
                                } else {
                                    await updatePreset()
                                }
                                revalidator.revalidate()
                            }}
                            type='checkbox'
                            id={FormFields.saveAsPreset}
                            name={FormFields.saveAsPreset}
                        />
                        <label
                            htmlFor={FormFields.saveAsPreset}
                            className='ml-2'
                        >
                            Save as preset
                        </label>
                    </div>
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
    const data: ExtensionStorage = (await chrome.storage.local.get()) as any
    if (res.action === 'popupLoader' && res.data) {
        return { ...data, ...res.data! }
    }
    return { ...data, canUndo: false } satisfies PopupLoaderData
}
async function action({ request, context }: LoaderFunctionArgs) {
    const formData = await request.formData()
    const filesInputs = formData.getAll(FormFields.filesInput) as File[]
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
