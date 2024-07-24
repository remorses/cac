import { Button } from '@/components/Button'
import { notifyError } from '@/lib/errors'
import { useRefreshOnVisible } from '@/lib/hooks'
import { supabase } from '@/lib/supabase-framer'
import {
    LoaderReturnType,
    Paths,
    collectGenerator,
    createBuyLink,
    exampleTextToMigrate,
    getDesktop,
    getNodePath,
    getParentNodes,
    isTruthy,
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
    supportsVisible,
    supportsName,
} from 'framer-plugin'
import { useEffect, useState } from 'react'
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
    const { shouldShowProgress, buyMoreCreditsUrl, credits } =
        useLoaderData() as LoaderReturnType<typeof loader>
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [oldNodes, setOldNodes] = useState<RephraseSchema['textToReplace']>(
        [],
    )

    useEffect(() => {
        // abort when leaving the page
        return () => {
            console.log('leaving the page, aborting')
            abortController.abort()
        }
    }, [])

    const revalidator = useRevalidator()
    const buyCreditsInstead = !credits.remaining
    const disabled = buyCreditsInstead ? false : isLoading || !description
    // console.log('credits', credits)
    async function onSubmit() {
        if (buyCreditsInstead) {
            // setIsLoading(true)
            window.open(buyMoreCreditsUrl, '_blank')
            return
        }
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
    let [error, setError] = useState('')

    const [selectedNodes, setSelectedNodes] = useState<AnyNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection((selection) => {
            setSelectedNodes(selection.filter((x) => x))
        })
    }, [])

    async function replaceTextClient() {
        setOldNodes([])
        setError('')
        // const root = await framer.getCanvasRoot()

        let desktop = await getDesktop()
        if (selectedNodes.length) {
            console.log(`using selected nodes`, selectedNodes)
        } else {
            console.log(`using desktop page`, desktop)
        }
        let rootNodes = selectedNodes.length
            ? selectedNodes.filter(isTruthy)
            : [desktop].filter(isTruthy)

        if (!rootNodes.length) {
            setError('No root nodes found')
            return
        }

        if (!rootNodes?.length) {
            throw new Error('No desktop found')
        }
        let oldText = [] as RephraseSchema['textToReplace']
        let i = 0

        for (let rootNode of rootNodes) {
            if (!rootNode) {
                continue
            }
            for await (let node of rootNode.walk()) {
                i += 1
                if (isTextNode(node)) {
                    const text = await node.getText()
                    let nodeId = node.id
                    if (text) {
                        const textData: RephraseSchema['textToReplace'][number] =
                            {
                                // index: i,
                                nodeId,
                                text,
                                name: await getNodePath(node),
                            }
                        setOldNodes((oldNodes) => [...oldNodes, textData])
                        oldText.push(textData)
                    }
                }
            }
        }
        console.log('oldText', JSON.stringify(oldText, null, 2))

        if (!oldText.length) {
            setError('No text found to replace')
            return
        }
        // console.log('oldText', JSON.stringify(oldText, null, 2))
        // return

        const { data: eventSource, error } =
            await pluginApiClient.api.v1.rephrase.post(
                {
                    description,
                    textToReplace: oldText,
                    exampleTextToMigrate,
                },
                {
                    fetch: {
                        signal: abortController.signal,
                    },
                },
            )
        if (error) {
            notifyError(error, 'error getting prompt')
            setError(String(error))
            return
        }

        // a red background showing we are changing this text, with 0.7 opacity
        const backgroundColor = 'rgba(255, 255, 0, 0.5)'
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
                // const parents = await collectGenerator(getParentNodes(node))
                if (node.visible) {
                    await node.zoomIntoView({ maxZoom: 0.9 })
                }

                if (currentParent && isFrameNode(currentParent)) {
                    prevBackground = currentParent?.backgroundColor || null

                    await currentParent?.setAttributes({ backgroundColor })
                    prevNode = currentParent
                } else {
                    prevBackground = null
                    prevNode = undefined
                }

                if (!text) {
                    continue
                }
                await node.setText(text)
            }
            await sleep(200)
            await rootNodes[0]?.zoomIntoView({ maxZoom: 0.7 })
        } finally {
            await prevNode?.setAttributes({ backgroundColor: prevBackground })
        }
    }
    useRefreshOnVisible({ enabled: !isLoading })

    const buttonText = (() => {
        if (!credits.remaining) {
            return 'Buy More Credits'
        }
        if (selectedNodes.length) {
            return 'Replace Text On Selected Layers'
        }
        return 'Replace Text On The Page'
    })()

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
                    disabled={buyCreditsInstead}
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

            {error && <div className='text-red-300 '>{error}</div>}
            <Button
                // submit on enter
                isLoading={isLoading}
                // startContent={
                //     !isLoading && <MaterialSymbolsMagicButton className='w-4' />
                // }
                disabled={disabled}
                // isLoading={isLoading}
                type='submit'
                className='framer-button-primary'
            >
                {buttonText}
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
                                if (!text || !nodeId) {
                                    return
                                }

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
                            <button
                                type='button'
                                className='group-hover:bg-framer-secondary w-auto text-[11px]  bg-transparent'
                            >
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
                        progress={credits.used / credits.total || 0}
                    />
                </div>
            )}
        </motion.form>
    )
}

export function SimplePrompt(): RouteObject {
    return {
        Component: SimplePromptComponent,
        handle: 'Describe what your new website is about',
        path: Paths.prompt,
        loader,
        shouldRevalidate: () => true,
    }
}

async function loader({}: LoaderFunctionArgs) {
    let [shouldShowProgress, credits, session] = await Promise.all([
        framer.getPluginData('usedThePlugin').then(Boolean),
        pluginApiClient.api.v1.getCredits.post({}).then(({ data, error }) => {
            if (error) {
                throw error
            }
            return data
        }),
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                throw error
            }
            return data.session
        }),
    ])

    const buyMoreCreditsUrl = createBuyLink({
        email: session?.user?.email,
        orgId: session?.user?.id,
    })

    // credits = {
    //     remaining: 0,
    //     total: 100,
    //     used: 100,
    //     free: true,
    // }
    return {
        shouldShowProgress,
        credits,
        buyMoreCreditsUrl,
    }
}

async function replaceTextInComponents() {
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
            return 'bg-red-400'
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
