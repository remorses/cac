import { Button } from '@/components/Button'
import { notifyError } from '@/lib/errors'
import {
    LoaderReturnType,
    Paths,
    buyMoreCreditsUrl,
    getDesktop,
    getNodePath,
    pluginApiClient,
} from '@/lib/utils'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import {
    framer,
    isTextNode,
    AnyNode,
    isFrameNode,
    isComponentNode,
} from 'framer-plugin'
import { useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useLoaderData,
    useRevalidator,
} from 'react-router'

import {
    RephraseSchema,
    RephraseResultItem,
} from 'website/src/lib/elysia.server'

import { sleep } from 'website/src/lib/utils'

let abortController = new AbortController()

function SimplePromptComponent({}) {
    const { shouldShowProgress, credits } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [oldNodes, setOldNodes] = useState<RephraseSchema['textToReplace']>(
        [],
    )
    const revalidator = useRevalidator()

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
        framer.setPluginData('usedThePlugin', 'true')
        try {
            await Promise.all([
                // replaceImagesClient(), //
                replaceTextClient(),
            ])
        } catch (e) {
            notifyError(e, 'submitting rewrite prompt')
        } finally {
            revalidator.revalidate()
            setIsLoading(false)
        }
    }

    async function replaceTextClient() {
        setOldNodes([])
        const root = await framer.getCanvasRoot()

        const desktop = await getDesktop()

        if (!desktop) {
            throw new Error('No desktop found')
        }
        let oldText = [] as RephraseSchema['textToReplace']
        let i = 0

        for await (let node of desktop.walk()) {
            i += 1
            if (isTextNode(node)) {
                const text = await node.getText()
                let nodeId = node.id
                if (text) {
                    const textData: RephraseSchema['textToReplace'][number] = {
                        index: i,
                        nodeId,
                        text,
                        name: await getNodePath(node),
                    }
                    setOldNodes((oldNodes) => [...oldNodes, textData])
                    oldText.push(textData)
                }
            }
        }

        // console.log('oldText', JSON.stringify(oldText, null, 2))
        // return

        const { data: eventSource, error } =
            await pluginApiClient.api.v1.rephrase.post(
                {
                    description,
                    textToReplace: oldText,
                    exampleTextToMigrate: [],
                },
                {
                    fetch: {
                        signal: abortController.signal,
                    },
                },
            )
        if (error) {
            notifyError(error, 'error getting prompt')
            return
        }

        // a red background showing we are changing this text, with 0.7 opacity
        const backgroundColor = 'rgba(255, 0, 0, 0.3)'
        let prevNode: AnyNode | undefined

        let prevBackground = null as string | null

        try {
            for await (let chunk of eventSource!) {
                console.log('chunk', chunk)
                await prevNode?.setAttributes({
                    backgroundColor: prevBackground,
                })
                // Process each chunk (value)

                const { text, nodeId } = chunk as RephraseResultItem
                if (nodeId == null) {
                    console.log(`no nodeId found: ${chunk}`)
                    return
                }

                const node = await framer.getNode(nodeId)
                if (!isTextNode(node)) {
                    console.log(`no text node found for id ${nodeId}`)
                    continue
                }
                if (!node) {
                    console.log(`no node found for id ${name}`)
                    continue
                }
                const old = oldText.find((x) => x.nodeId === nodeId)?.text
                if (!old) {
                    console.log(`no old text found for node ${nodeId}`)
                    continue
                }
                console.log(
                    `replacing text from\nbefore: ${JSON.stringify(old)}\nafter:${JSON.stringify(text)}`,
                )
                let currentParent = (await node.getParent()) || undefined
                await node.zoomIntoView({ maxZoom: 0.9 })
                if (currentParent && isFrameNode(currentParent)) {
                    prevBackground = currentParent?.backgroundColor || null

                    await currentParent?.setAttributes({ backgroundColor })
                    prevNode = currentParent
                } else {
                    prevBackground = null
                    prevNode = undefined
                }

                await node.setText(text)
            }
            await sleep(200)
            await desktop.zoomIntoView({ maxZoom: 0.7 })
        } catch (e) {
            console.log('error processing chatgpt', e)
        } finally {
            await prevNode?.setAttributes({ backgroundColor: prevBackground })
        }
    }

    return (
        <motion.form
            layoutId='content'
            // exit={{
            //     opacity: 0,
            // }}
            // initial={{
            //     opacity: 0,
            // }}
            // animate={{
            //     opacity: 1,
            // }}
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
            }}
            className='flex flex-col items-start w-full justify-start gap-4'
        >
            <div className='opacity-70'>
                Describe what your new website is about. The plugin will use
                this description to replace content on teh page.
            </div>
            <div className='w-full'>
                <textarea
                    value={description}
                    // isRequired
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            onSubmit()
                        }
                        const textarea = e.target as HTMLTextAreaElement
                        // textarea.style.height = '26px'
                        textarea.style.height = `${textarea.scrollHeight}px`
                    }}
                    onChange={(e) => setDescription(e.target.value)}
                    className='p-2 pb-3 shrink-0 leading-relaxed py-1 w-full min-h-[80px]'
                    autoFocus
                    placeholder='A landing page for the everything app X. Use casual language and a friendly tone.'
                />
            </div>

            <Button
                // submit on enter
                isLoading={isLoading}
                // startContent={
                //     !isLoading && <MaterialSymbolsMagicButton className='w-4' />
                // }
                disabled={isLoading || !description}
                // isLoading={isLoading}
                type='submit'
                className='framer-button-primary'
            >
                Replace Text On The Page
            </Button>
            {oldNodes.length > 0 && (
                <Button
                    // isLoading={isLoading}
                    // disabled={isLoading}
                    onClick={async () => {
                        if (isLoading) {
                            abortController.abort()
                            return
                        }
                        await Promise.all(
                            oldNodes.map(async (node) => {
                                const { nodeId, text } = node
                                try {
                                    const framerNode =
                                        await framer.getNode(nodeId)
                                    if (isTextNode(framerNode)) {
                                        await framerNode.setText(text)
                                    }
                                } catch (e) {
                                    console.log(
                                        'error undoing text for ',
                                        text,
                                        e,
                                    )
                                }
                            }),
                        )
                        setOldNodes([])
                    }}
                    type='button'
                >
                    {isLoading ? 'Cancel' : 'Undo Replacement'}
                </Button>
            )}
            {shouldShowProgress && (
                <div className='flex group flex-col hover:opacity-100 transition-opacity duration-100 opacity-60 self-stretch gap-2'>
                    <div className='flex flex-row-reverse items-center text-[11px] '>
                        <a target='_blank' href={buyMoreCreditsUrl}>
                            <button className='group-hover:bg-framer-secondary w-auto text-[11px]  bg-transparent'>
                                Buy More Credits
                            </button>
                        </a>
                        <div className='grow'></div>
                        <div className=''>
                            {credits.remaining} credits remaining
                        </div>
                    </div>

                    <ProgressBar
                        className=''
                        progress={credits.used / credits.total}
                    />
                </div>
            )}
        </motion.form>
    )
}

async function loader({}: LoaderFunctionArgs) {
    const [shouldShowProgress, credits] = await Promise.all([
        framer.getPluginData('usedThePlugin').then(Boolean),
        pluginApiClient.api.v1.getCredits.post({}).then(({ data, error }) => {
            if (error) {
                throw error
            }
            return data
        }),
    ])

    return {
        shouldShowProgress,
        credits,
    }
}

export function SimplePrompt(): RouteObject {
    return {
        Component: SimplePromptComponent,
        handle: 'Describe what your new website is about',
        path: Paths.prompt,
        loader,
    }
}

async function replaceTextInCurrentPage() {
    const desktop = await getDesktop()

    if (!desktop) {
        throw new Error('No desktop found')
    }

    // components in the current page
    const componentInstances = await desktop.getNodesWithType(
        'ComponentInstanceNode',
    )

    let componentNodesInThePage = new Set<string>()
    console.log('components', componentInstances)
    for (let componentInstance of componentInstances) {
        if (
            !componentInstance.componentIdentifier.startsWith('local-module:')
        ) {
            console.log(
                `component ${componentInstance.componentIdentifier} is not a local module`,
            )
            continue
        }
        // regex to extract lWUcIJP0H from "local-module:canvasComponent/lWUcIJP0H:default"
        const regex = /local-module:.*\/(.*):.*/
        const match = componentInstance.componentIdentifier.match(regex)
        if (!match) {
            console.log(
                `component ${componentInstance.componentIdentifier} does not match regex to get component id`,
            )
            continue
        }
        const componentId = match[1]
        const componentNode = await framer.getNode(componentId)
        if (!componentNode || !isComponentNode(componentNode)) {
            console.log(`could not find component node for ${componentId}`)
            continue
        }
        componentNodesInThePage.add(componentId)
        // console.log('-----')
        // console.log('componentNode', componentNode)

        // for await (let child of componentNode.walk()) {
        //     console.log(await getNodePath(child), child)
        // }
    }
    // TODO change text inside the components too when you can access children of them
    // const allTextNodes = await framer.getNodesWithType('TextNode')
    // for (let textNode of allTextNodes) {
    //     const rootParentId = await getRootParentId(textNode)
    //     console.log(rootParentId)
    //     if (!componentNodesInThePage.has(rootParentId)) {
    //         // console.log(
    //         //     `text node ${textNode.id} is not in local components`,
    //         // )
    //         continue
    //     }
    //     console.log('component text:', await textNode.getText())
    // }

    // recurse inside the components on the page
    // for (let componentId of componentNodesInThePage) {
    //     const componentNode = await framer.getNode(componentId)
    //     if (!componentNode || !isComponentNode(componentNode)) {
    //         console.log(`could not find component node for ${componentId}`)
    //         continue
    //     }
    //     for await (let child of componentNode.walk()) {

    //     }
    // }
}

function ProgressBar({ progress, className = '' }) {
    const backgroundColor = (() => {
        if (progress > 0.9) {
            return 'bg-orange-500'
        }
        if (progress > 0.6) {
            return 'bg-yellow-400'
        }

        return 'bg-green-500'
    })()
    if (progress < 0.03) {
        progress = 0.03
    }
    // progress= 0.5
    return (
        <div
            // style={{ backgroundColor }}
            className={classNames(
                'relative rounded-md overflow-hidden w-full bg-gray-700 flex h-[8px]',
                className,
            )}
        >
            <motion.div
                // layout
                transition={{ duration: 0.4 }}
                animate={{
                    width: Number(Math.min(progress, 1) * 100).toFixed(1) + '%',
                }}
                className={classNames(
                    'h-full bg-gray-200 rounded overflow-hidden',
                    backgroundColor,
                )}
            ></motion.div>
        </div>
    )
}
