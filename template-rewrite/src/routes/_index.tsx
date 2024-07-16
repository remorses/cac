import type { MetaFunction } from '@remix-run/node'
import { EventSourceParserStream } from 'eventsource-parser/stream'

export const meta: MetaFunction = () => {
    return [
        { title: 'New Remix App' },
        { name: 'description', content: 'Welcome to Remix!' },
    ]
}

import { Button, Textarea } from '@nextui-org/react'
import {
    AnyNode,
    FrameNode,
    TextNode,
    framer,
    isFrameNode,
    isTextNode,
} from 'framer-plugin'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { OldImage, OldText, ReplaceTextInput } from '@/lib/types'
import { apiClient } from '@/lib/utils'

let abortController: AbortController
function Home() {
    useEffect(() => {
        framer.showUI({
            title: '',
            position: 'top left',
            width: 400,
            height: 180,
        })
        return framer.subscribeToCanvasRoot((root) => {
            console.log('root', root)
        })
    }, [])

    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit() {
        if (!description) {
            return
        }

        if (abortController) {
            abortController.abort()
        }
        abortController = new AbortController()
        setIsLoading(true)
        try {
            await Promise.all([
                // replaceImagesClient(), //
                replaceTextClient(),
            ])
        } finally {
            setIsLoading(false)
        }
    }

    async function replaceTextClient() {
        const root = await framer.getCanvasRoot()

        const [desktop] = await root.getChildren()

        let oldText = [] as Array<OldText>
        let i = 0
        const nodes = [] as TextNode[]
        for await (let node of desktop.walk()) {
            if (isTextNode(node)) {
                const text = await node.getText()
                if (text) oldText.push({ id: i, text })
                nodes.push(node)
                i += 1
            }
        }

        const { data: eventSource, error } =
            await apiClient.api.v1.rephrase.post({
                description,
                oldText,
            })
        if (error) {
            framer.notify(String(error.value), { variant: 'error' })
            return
        }

        // a red background showing we are changing this text, with 0.7 opacity
        const backgroundColor = 'rgba(255, 0, 0, 0.3)'
        let prevNode: AnyNode | undefined

        let minTime = 100
        for await (let chunk of eventSource!) {
            await prevNode?.setAttributes({ backgroundColor: null })
            // Process each chunk (value)

            try {
                const { text, id } = JSON.parse(chunk)
                if (id == null) {
                    console.log(`no id found: ${chunk}`)
                    return
                }

                const node = nodes[id]
                if (!node) {
                    console.log(`no node found for id ${id}`)
                    return
                }
                const old = oldText[id]?.text
                console.log(
                    `replacing text from\nbefore: ${JSON.stringify(old)}\nafter:${JSON.stringify(text)}`,
                )
                let currentParent = (await node.getParent()) || undefined

                await currentParent?.setAttributes({ backgroundColor })
                prevNode = currentParent

                await node.setText(text)
            } catch (e) {
                console.log('error processing chatgpt', e)
            }
        }
    }

    async function replaceImagesClient() {
        const root = await framer.getCanvasRoot()
        const [desktop] = await root.getChildren()

        let oldImages = [] as Array<OldImage>
        let i = 0
        const nodes = [] as FrameNode[]
        for await (let node of desktop.walk()) {
            if (isFrameNode(node)) {
                const image = await node.backgroundImage
                if (!image) continue

                if (!image.url) {
                    console.log(`no url found for image ${image}`)
                    continue
                }
            }
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
            }}
            className='flex flex-col items-start w-full justify-start gap-3'
        >
            <div className='w-full'>
                <Textarea
                    value={description}
                    // isRequired
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            onSubmit()
                        }
                    }}
                    onValueChange={setDescription}
                    label={
                        <div className='w-fit mb-1 text-sm'>
                            What is the new landing page about?
                        </div>
                    }
                    labelPlacement='outside'
                    placeholder='a shoes shop'
                />
            </div>

            <Button
                // submit on enter
                size='sm'
                startContent={
                    !isLoading && <MaterialSymbolsMagicButton className='w-4' />
                }
                isDisabled={isLoading}
                isLoading={isLoading}
                type='submit'
            >
                Replace Text
            </Button>
        </form>
    )
}
let noop: any = () => {}
export default function Page() {
    return <Home />
}

// show toasts on success and failure and manages loading state
// you can skip showing the toast on failure putting a field skipToast: true in the error
export function useThrowingFn({
    fn: fnToWrap,

    immediate = false,
}) {
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        if (immediate) {
            fn()
        }
    }, [immediate])
    const fn = async function wrappedThrowingFn(...args) {
        try {
            setIsLoading(true)
            const result = await fnToWrap(...args)
            if (result?.skipToast) {
                return result
            }

            return result
        } catch (err) {
            console.error(err)
            // how to handle unreadable errors? simply don't return them from APIs, just return something went wrong

            return err
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        fn,
    }
}

export function MaterialSymbolsMagicButton(props) {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' {...props}>
            <path
                fill='currentColor'
                d='m10 19l-2.5-5.5L2 11l5.5-2.5L10 3l2.5 5.5L18 11l-5.5 2.5L10 19Zm8 2l-1.25-2.75L14 17l2.75-1.25L18 13l1.25 2.75L22 17l-2.75 1.25L18 21Z'
            ></path>
        </svg>
    )
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
