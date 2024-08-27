import { Button } from 'template-rewrite-framer/src/components/Button'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import { useRefreshOnVisible } from 'template-rewrite-framer/src/lib/hooks'

import {
    LoaderReturnType,
    Paths,
    PluginDataKeys,
    collectGenerator,
    createBuyLink,
    formatLargeNumber,
    getDesktop,
    getNodePath,
    getParentNodes,
    globalState,
    isTruthy,
    pluginApiClient,
} from 'template-rewrite-framer/src/lib/utils'

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
    ComponentInstanceNode,
    isComponentInstanceNode,
} from 'framer-plugin'
import { useEffect, useRef, useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useLoaderData,
    useRevalidator,
} from 'react-router'

import { RewriteSchema } from 'website/src/lib/rewrite'

import { sleep } from 'website/src/lib/utils'

let abortController = new AbortController()

function SimplePromptComponent({}) {
    const { shouldShowProgress, buyMoreCreditsUrl, credits } =
        useLoaderData() as LoaderReturnType<typeof loader>
    const [description, setDescription] = useState(
        globalState.extractedDescription || '',
    )
    const [isLoading, setIsLoading] = useState(false)
    const [oldNodes, setOldNodes] = useState<RewriteSchema['textToReplace']>([])

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
        framer.setPluginData(PluginDataKeys.usedThePlugin, 'true')
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
            setError('No desktop found')
            return
        }
        let oldText = [] as RewriteSchema['textToReplace']
        let i = 0

        async function handleNode(node: AnyNode) {
            if (isTextNode(node)) {
                const parents = await collectGenerator(getParentNodes(node))
                const isVisible = parents.every(
                    (x) => !supportsVisible(x) || x.visible,
                )
                if (!isVisible) {
                    return
                }
                const text = await node.getText()
                let nodeId = node.id
                if (text) {
                    const textData: RewriteSchema['textToReplace'][number] = {
                        // index: i,
                        nodeId,
                        content: text,
                        name: await getNodePath(node),
                    }
                    setOldNodes((oldNodes) => [...oldNodes, textData])
                    oldText.push(textData)
                }
            }
        }

        for (let rootNode of rootNodes) {
            if (!rootNode) {
                continue
            }
            for await (let node of rootNode.walk()) {
                i += 1

                for await (let child of recurseIntoComponent(node)) {
                    await handleNode(child)
                }
                await handleNode(node)
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
            await pluginApiClient.api.plugins.rewritePlugin.rephrase.post(
                {
                    description,
                    textToReplace: oldText,
                    exampleTextToMigrate: globalState.exampleTextToMigrate,
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
        const backgroundColor = 'rgba(128, 0, 128, 0.3)'
        let prevNode: AnyNode | undefined

        let prevBackground = null as string | null

        try {
            for await (let chunk of eventSource!) {
                if (!chunk) {
                    console.log('one chunk is null')
                    continue
                }

                console.log('chunk', chunk)
                await prevNode?.setAttributes({
                    backgroundColor: prevBackground,
                })
                // Process each chunk (value)

                if (chunk.nodeId == null) {
                    console.log(`no nodeId found: ${chunk}`)
                    return
                }

                const node = await framer.getNode(chunk.nodeId)
                if (!isTextNode(node)) {
                    console.log(`no text node found for id ${chunk.nodeId}`)
                    continue
                }
                if (!node) {
                    console.log(`no node found for id ${name}`)
                    continue
                }
                const old = oldText.find(
                    (x) => x.nodeId === chunk.nodeId,
                )?.content
                if (!old) {
                    console.log(`no old text found for node ${chunk.nodeId}`)
                    continue
                }
                console.log(
                    `replacing text from\nbefore: ${JSON.stringify(old)}\nafter:${JSON.stringify(chunk.content)}`,
                )
                let currentParent = (await node.getParent()) || undefined
                const parents = await collectGenerator(getParentNodes(node))
                const isVisible = parents.every((parent) => {
                    // TODO remove this hack, now component children cannot be zoomed, later they will be zoomed
                    if (isComponentNode(parent)) {
                        return false
                    }
                    if (supportsVisible(parent)) {
                        return parent.visible
                    }
                    return true
                })
                if (node.visible && isVisible) {
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

                if (chunk.content) {
                    let words = chunk.content.split(/\s+/).length
                    await node.setText(chunk.content)
                    setRemainingCredits(Math.max(0, credits.remaining - words))
                } else {
                    console.log('no text found in chunk', chunk)
                }

                // TODO change href when framer supports it
                // if (chunk.href) {
                //     // if (!supports)
                // }
            }
            await sleep(200)
            await rootNodes[0]?.zoomIntoView({ maxZoom: 1 })
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

    const [remainingCredits, setRemainingCredits] = useState(credits.remaining)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight(textareaRef.current)
        }
    }, [])

    const adjustHeight = (element) => {
        element.style.height = 'auto'
        element.style.height = `${element.scrollHeight}px`
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
            className='flex flex-col items-start w-full justify-start gap-3'
        >
            <div className='opacity-70'>
                Describe what your new website is about. The plugin will use
                this description to replace content on teh page.
            </div>
            <div className='w-full'>
                <textarea
                    ref={textareaRef}
                    value={description}
                    disabled={buyCreditsInstead}
                    // isRequired

                    onChange={(e) => {
                        setDescription(e.target.value)
                        adjustHeight(e.target)
                    }}
                    className='p-2 py-2 shrink-0 leading-relaxed mt-1 w-full min-h-[80px]'
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
                                const { nodeId, content } = node
                                if (!content || !nodeId) {
                                    return
                                }

                                try {
                                    const framerNode =
                                        await framer.getNode(nodeId)
                                    if (isTextNode(framerNode)) {
                                        await framerNode.setText(content)
                                    }
                                } catch (e) {
                                    console.log(
                                        'error undoing text for ',
                                        content,
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
            <div className='text-[11px] opacity-70'>
                <span className='font-mono tracking-wider font-semibold'>
                    {formatLargeNumber(remainingCredits)}
                </span>{' '}
                credits remaining
            </div>
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
    let [shouldShowProgress, credits, { email, orgId }] = await Promise.all([
        framer.getPluginData(PluginDataKeys.usedThePlugin).then(Boolean),
        pluginApiClient.api.plugins.rewritePlugin.getCredits
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
        pluginApiClient.api.plugins.currentOrg
            .post({})
            .then(({ data, error }) => {
                if (error) {
                    throw error
                }
                return data
            }),
    ])

    const buyMoreCreditsUrl = createBuyLink({
        email,
        orgId,
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

async function* recurseIntoComponent(componentInstance: AnyNode) {
    if (!isComponentInstanceNode(componentInstance)) {
        console.log('not a component instance node', componentInstance)
        return
    }
    if (!componentInstance.componentIdentifier.startsWith('local-module:')) {
        console.log(
            `component ${componentInstance.componentIdentifier} is not a local module`,
        )
        return false
    }
    const regex = /local-module:.*\/(.*):.*/
    const match = componentInstance.componentIdentifier.match(regex)
    if (!match) {
        console.log(
            `component ${componentInstance.componentIdentifier} does not match regex to get component id`,
        )
        return false
    }
    const componentId = match[1]
    const componentNode = await framer.getNode(componentId)
    if (!componentNode || !isComponentNode(componentNode)) {
        console.log(`could not find component node for ${componentId}`)
        return false
    }
    console.log('found component node', await componentNode.getChildren())
    const primary = (await componentNode.getChildren()).find(
        (x) => isFrameNode(x) && !x.isReplica,
    )
    if (!primary) {
        console.log('no primary child for component found')
        return false
    }
    for await (let child of primary.walk()) {
        yield child
    }
}
