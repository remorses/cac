import { Button } from '@/components/Button'
import { renderPageAsImage } from 'unpdf'
import {
    ChromeMessageType,
    PRESET_ID_LEN,
    debounce,
    ExtensionStorage,
    generateRandomString,
    LoaderReturnType,
    Paths,
    PopupLoaderData,
    truncateString,
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
    const { canUndo, presets, lastUsedPresetId } =
        useLoaderData() as LoaderReturnType<typeof loader>
    console.log('presets', presets)
    let [presetId, setPresetId] = useState(() => {
        if (
            lastUsedPresetId &&
            presets?.find((x) => x.id === lastUsedPresetId)
        ) {
            return lastUsedPresetId
        }
        return generateRandomString(PRESET_ID_LEN)
    })
    console.log('presetId', presetId)
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    const [inputs, setInputs] = useState([] as string[])
    const currentPreset = presets?.find((x) => x.id === presetId)

    useEffect(() => {
        if (!currentPreset) {
            return
        }
        Promise.resolve().then(async () => {
            const files = currentPreset.files.filter(Boolean)

            const fileInput: HTMLInputElement =
                formRef.current?.elements.namedItem(
                    FormFields.filesInput,
                ) as any
            if (!fileInput) {
                return
            }
            const dataTransfer = new DataTransfer()

            // TODO this returns the wrong data url, need to fix it
            for (const file of files) {
                if (!file.type) {
                    continue
                }
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
                    new File([blob], file.name, { type: file.type }),
                )
            }
            fileInput.files = dataTransfer.files
        })
    }, [currentPreset])
    useEffect(() => {
        const callback = (request: ChromeMessageType, sender, sendResponse) => {
            console.log('message', request)
            Promise.resolve()
                .then(async () => {
                    switch (request.action) {
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

    useEffect(() => {
        if (!textareaRef.current) {
            return
        }
        adjustHeight(textareaRef.current)
    }, [])

    const revalidator = useRevalidator()
    const formRef = useRef<HTMLFormElement>(null)

    async function updatePreset({ presetId, presets }) {
        const shouldSave = presets?.find((x) => x.id === presetId)
        if (!shouldSave) {
            console.log('preset not found, not saving')
            return
        }
        const prompt = textareaRef.current?.value || 'Empty prompt'
        const filesInput: HTMLInputElement =
            formRef.current?.elements.namedItem(FormFields.filesInput) as any

        await chrome.storage.local.set({
            lastUsedPresetId: presetId,
            presets: [
                ...(presets.filter((x) => x.id !== presetId) || []),
                {
                    prompt,
                    id: presetId,
                    files: await Promise.all(
                        [...(filesInput?.files || [])].map(async (file) => ({
                            name: file.name,
                            type: file.type,
                            dataUrl: await getFileDataUrl(file),
                        })),
                    ),
                },
            ],
        } satisfies ExtensionStorage)
        revalidator.revalidate()
    }
    const debouncedUpdatePreset = useRef(debounce(updatePreset, 100))
    return (
        <div className='flex flex-col '>
            <Form
                encType='multipart/form-data'
                method='POST'
                key={presetId}
                ref={formRef}
                className='flex flex-col justify-start gap-3'
            >
                <div className='flex items-center'>
                    <div className='grow'></div>
                    <select
                        onChange={async (e) => {
                            if (e.target.value === 'deleteAll') {
                                await chrome.storage.local.remove('presets')
                                setPresetId(generateRandomString(PRESET_ID_LEN))
                                revalidator.revalidate()
                                return
                            }
                            if (e.target.value === 'addNew') {
                                const id = generateRandomString(PRESET_ID_LEN)
                                await chrome.storage.local.set({
                                    presets: [
                                        ...(presets || []),
                                        {
                                            prompt: '',
                                            id,
                                            files: [],
                                        },
                                    ],
                                    lastUsedPresetId: id,
                                })
                                setPresetId(id)
                                revalidator.revalidate()
                                return
                            }
                            if (!e.target.value) {
                                return
                            }
                            setPresetId(e.target.value)
                        }}
                        value={presetId}
                        name='preset'
                    >
                        {(!presets || presets?.length === 0) && (
                            <option value=''>Choose a preset</option>
                        )}
                        {presets?.map((preset, index) => (
                            <option key={preset.id} value={preset.id}>
                                {truncateString(preset.prompt)
                                    .replace(/\n/g, ' ')
                                    .replace(/\s+/g, ' ')}
                            </option>
                        ))}
                        {presets?.length && presets?.length > 0 && (
                            <>
                                <option value='deleteAll'>
                                    Delete All Presets
                                </option>
                            </>
                        )}
                        <option value='addNew'>Add New Preset</option>
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
                        defaultValue={currentPreset?.prompt || ''}
                        onChange={(e) => {
                            // setDescription(e.target.value)
                            adjustHeight(e.target)
                            debouncedUpdatePreset.current({ presetId, presets })
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
                        accept='image/*, application/pdf, application/json, text/*'
                        onChange={(e) => {
                            debouncedUpdatePreset.current({ presetId, presets })
                        }}
                        name={FormFields.filesInput}
                        multiple
                    />
                </div>
                {/* <div className=''>
                    <div className='flex items-center'>
                        <input
                            defaultChecked={
                                !!presets?.find((x) => x.id === presetId)
                            }
                            key={presetId}
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
                </div> */}
                <Button
                    type='submit'
                    variant='primary'
                    isLoading={isLoading || navigation.state !== 'idle'}
                >
                    Start Filling Form
                </Button>
                {canUndo && !isLoading && (
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
    if (res?.action === 'popupLoader' && res.data) {
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
                console.log('file type', file.type)
                if (file.type.startsWith('application/pdf')) {
                    console.log('converting pdf to image')
                    const arrayBuffer = await file.arrayBuffer()
                    const res = await renderPageAsImage(arrayBuffer, 0)
                    const type = 'image/png'
                    const dataUrl = await getFileDataUrl(
                        new File([res], file.name, { type }),
                    )
                    return {
                        name: file.name,
                        type,
                        dataUrl,
                    }
                }
                const dataUrl = await getFileDataUrl(file)
                return {
                    name: file.name,
                    type: file.type,
                    dataUrl,
                }
            }),
    )

    console.log('files', files)
    const description = formData.get(FormFields.description)?.toString() || ''

    await chrome.runtime.sendMessage({
        action: 'start',
        files,
        description,
    } satisfies ChromeMessageType)
    return {}
}

const getFileDataUrl = (file: File) => {
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
