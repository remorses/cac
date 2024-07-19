import { Textarea } from '@nextui-org/react'
import create from 'zustand'

import {
    AnyNode,
    FrameNode,
    TextNode,
    framer,
    isFrameNode,
    isTextNode,
} from 'framer-plugin'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { apiClient } from '@/lib/utils'
import { RouterProvider } from 'react-router'
import { Link, createBrowserRouter } from 'react-router-dom'

type OldText = { id: number; text: string }

function showFramer() {
    const [height, setHeight] = useState(500)

    if (typeof window !== 'undefined')
        framer.showUI({
            title: '',
            position: 'top left',
            width: 600,
            height: height,
        })
    const ref = useRef<any>(null)
    useLayoutEffect(() => {
        if (ref.current) {
            setHeight(ref.current.clientHeight)
        }
        // listen for ref height changes, and update height
        // window.addEventListener('resize', () => {
        //     if (ref.current) {
        //         setHeight(ref.current.clientHeight)
        //     }
        // })
    })
    return {
        ref,
        setHeight,
    }
}

let abortController: AbortController

function SimplePrompt() {
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit() {
        if (!description) {
            return
        }
        if (isLoading) {
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
        let prevBackground = null as string | null
        for await (let chunk of eventSource!) {
            console.log('chunk', chunk)
            await prevNode?.setAttributes({ backgroundColor: prevBackground })
            // Process each chunk (value)

            try {
                const { text, id } = chunk as any
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
                if (currentParent && isFrameNode(currentParent)) {
                    prevBackground = currentParent?.backgroundColor || null
                    await currentParent?.setAttributes({ backgroundColor })
                    prevNode = currentParent
                } else {
                    prevBackground = null
                    prevNode = undefined
                }

                await node.setText(text)
            } catch (e) {
                console.log('error processing chatgpt', e)
            }
        }
        await prevNode?.setAttributes({ backgroundColor: prevBackground })
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
                <textarea
                    value={description}
                    // isRequired
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            onSubmit()
                        }
                    }}
                    onChange={(e) => setDescription(e.target.value)}
                    className='p-2 w-full'
                    autoFocus
                    placeholder='a shoes shop'
                    onMouseUp={(e) => {
                        refreshHeight()
                    }}
                />
            </div>

            <button
                // submit on enter

                // startContent={
                //     !isLoading && <MaterialSymbolsMagicButton className='w-4' />
                // }
                disabled={isLoading}
                // isLoading={isLoading}
                type='submit'
                className='framer-button-primary'
            >
                Replace Text
            </button>
        </form>
    )
}

function AlreadyHaveWebsite() {
    async function onSubmit() {}

    return (
        <div className='flex flex-col justify-start gap-6'>
            <div className=''>Do you already have an existing website?</div>
            <div className='flex gap-4 '>
                <Link
                    className='flex items-center grow gap-2 px-4 py-2 rounded-md border cursor-pointer'
                    to={'/prompt?mode=default'}
                >
                    <input
                        type='radio'
                        name='alreadyHasWebsite'
                        value='yes'
                        className='cursor-pointer'
                    />
                    Yes
                </Link>
                <Link
                    className='flex items-center grow gap-2 px-4 py-2 rounded-md border border-gray-300 cursor-pointer'
                    to={'/prompt?mode=default'}
                >
                    <input
                        type='radio'
                        name='alreadyHasWebsite'
                        value='no'
                        className='cursor-pointer !text-xs'
                    />
                    No
                </Link>
            </div>
        </div>
    )
}

function StructuredPrompt() {
    const [isLoading, setIsLoading] = useState(false)
    async function onSubmit() {
        if (isLoading) {
            return
        }

        if (abortController) {
            abortController.abort()
        }
        abortController = new AbortController()

        setIsLoading(true)
        try {
            // console.log('component', [
            //     ...(await framer.getNodesWithType('ComponentNode')),
            // ])

            await Promise.all([
                // replaceImagesClient(), //
                findSchema(),
            ])
        } catch (e) {
            framer.notify(String(e), { variant: 'error' })
        } finally {
            setIsLoading(false)
        }
    }
    let [schema, setSchema] = useState<any>({})

    async function findSchema() {
        const root = await framer.getCanvasRoot()
        const publishInfo = await framer.getPublishInfo()
        if (!publishInfo) {
            throw new Error('Publish your website first')
        }
        const url = publishInfo.staging?.currentPageUrl

        const desktop = await getDesktop()

        if (!desktop) {
            throw new Error('No desktop found')
        }

        let oldText = [] as Array<OldText>
        let i = 0
        const nodes = [] as TextNode[]
        for await (let node of desktop.walk()) {
            console.log('node', node)
            if (isTextNode(node)) {
                const text = await node.getText()
                node.isReplica

                if (text) oldText.push({ id: i, text })
                nodes.push(node)
                i += 1
            }
        }

        setSchema(oldText)
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
            }}
            className='flex flex-col items-start justify-start gap-3'
        >
            <pre className=''>{JSON.stringify(schema, null, 2)}</pre>

            <button
                // submit on enter

                // startContent={
                //     !isLoading && <MaterialSymbolsMagicButton className='w-4' />
                // }
                disabled={isLoading}
                // isLoading={isLoading}
                type='submit'
                className='framer-button-primary'
            >
                do it
            </button>
        </form>
    )
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <AlreadyHaveWebsite />,
    },
    {
        path: '/prompt',
        element: <StructuredPrompt />,
    },
    {
        path: '/x',
        element: <SimplePrompt />,
    },
])

let refreshHeight = () => {}
export default function Page() {
    const { ref, setHeight } = showFramer()
    refreshHeight = () => {
        setHeight(ref.current?.clientHeight)
    }

    return (
        <div
            ref={ref}
            className='flex flex-col p-4 pt-0 grow  w-full justify-start gap-3'
        >
            <RouterProvider router={router} />
        </div>
    )
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

async function getDesktop() {
    // const node = await Promise.all(
    //     [...(await framer.getNodesWithType('WebPageNode'))].map(
    //         async (node) => {
    //             return node
    //         },
    //     ),
    // )
    const root = await framer.getCanvasRoot()
    const children = await root.getChildren()
    const desktop = children.find((node) => {
        if (isFrameNode(node)) {
            return node.name === 'Desktop'
        }
    })
    return desktop
}
