import { Button } from 'plugin-migrate/src/components/Button'
import { notifyError } from 'plugin-migrate/src/lib/errors'
import {
    useHistoryNavigation,
    useRefreshOnVisible,
} from 'plugin-migrate/src/lib/hooks'

import {
    getDesktop,
    isTruthy,
    LoaderReturnType,
    withMode,
} from 'plugin-migrate/src/lib/utils'

import {
    AnyNode,
    ColorStyle,
    framer,
    isComponentInstanceNode,
    isTextNode,
    supportsBackgroundColor,
} from 'framer-plugin'
import { Suspense, use, useEffect, useMemo, useRef, useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useLoaderData,
    useNavigate,
    useRevalidator,
} from 'react-router'

import { FramerLayersTree } from 'website/src/lib/rewrite'

import { Paths, pluginApiClient } from '@/lib/utils'
import { StarReview } from 'plugin-migrate/src/components/StarReview'
import { applyAttributes, getFramerTree, isNodeZoomable } from 'plugin-mcp'
import { getBuyLLMPluginUrl } from 'website/src/lib/env'
import { bfsFramerLayersTree, framerLayersTreeToXml, sleep } from 'website/src/lib/utils'
import { flushSync } from 'react-dom'

let abortController = new AbortController()

const randomId = makeRandomId()

function makeRandomId() {
    return Math.random().toString(36).substring(2, 15)
}

function SimplePromptComponent({}) {
    const { deferred } = useLoaderData() as LoaderReturnType<typeof loader>

    const [isLoading, setIsLoading] = useState(false)
    const [currentTool, setCurrentTool] = useState('')
    const [previousOldText, setPreviousOldText] = useState<FramerLayersTree>([])

    useEffect(() => {
        // abort when leaving the page
        return () => {
            console.log('leaving the page, aborting')
            abortController.abort()
        }
    }, [])

    const revalidator = useRevalidator()

    // console.log('credits', credits)
    const [description, setDescription] = useState('')
    const [generationId, setGenerationId] = useState(0)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { onKeyDown, onSubmit: historyOnSubmit } = useHistoryNavigation({
        value: description,
        setValue: (x) => {
            flushSync(() => {
                setDescription(x)
            })
            fixTexareaSize()
        },
    })

    async function onSubmit() {
        const { buyMoreCreditsUrl, credits } = await deferred
        if (!credits.remaining) {
            window.open(buyMoreCreditsUrl, '_blank')
            return
        }

        if (isLoading) {
            return
        }

        historyOnSubmit()

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
        } catch (e) {
            notifyError(e, 'submitting rewrite prompt')
        } finally {
            revalidator.revalidate()
            // setShouldShowStars(true)
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

    function reset() {
        setPreviousOldText([])

        setGenerationId(0)
        // setDescription('')
        setError('')
        setShouldShowStars(false)
        setStars(0)
    }

    async function copyToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text)
            return true
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            return false
        }
    }

    async function copyXml() {
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

        let oldText = await getFramerTree({
            rootNodes,

            recursive: false,
        })

        try {
            const xml = framerLayersTreeToXml(oldText, {
                shouldAddNodeIdAlways: true,
            })

            await copyToClipboard(JSON.stringify(oldText, null, 2))
            await sleep(400)
            await copyToClipboard(xml)
            console.log('Old text copied to clipboard as JSON')
        } catch (error) {
            console.error('Failed to copy old text to clipboard:', error)
        }
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'x') {
                copyXml()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [selectedNodes])
    async function replaceTextClient() {
        reset()
        const { buyMoreCreditsUrl, credits, projectId, projectName } =
            await deferred
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

        let oldText = await getFramerTree({
            rootNodes,

            recursive: false,
        })

        // return
        if (!oldText.length) {
            setError('No text found to replace')
            return
        }
        setPreviousOldText([...oldText])

        const { data: eventSource, error } =
            await pluginApiClient.api.plugins.llm.generate.post(
                {
                    description,
                    tree: oldText,
                    projectId,
                    randomId,
                    projectName,
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
        const backgroundColor = 'rgba(1, 153, 255, 0.3)'
        let prevNode: AnyNode | undefined

        let prevBackground = null as string | ColorStyle | null

        async function highlightNextNode(nextItemId) {
            let node = await framer.getNode(nextItemId)

            if (!node) {
                console.log('no node to zoom found for id', nextItemId)

                return
            }
            // console.log(`nextItemId is ${nextItemId} ${node?.name}`)

            // Check permission before setting attributes
            if (prevNode && framer.isAllowedTo('setAttributes')) {
                await prevNode.setAttributes({
                    backgroundColor: prevBackground,
                })
            }
            // prevNode = undefined
            // prevBackground = null
            let currentParent = (await node.getParent()) || undefined
            const isZoomable = await isNodeZoomable(node)
            if (!isZoomable) {
                console.log('node not visible, skipping zoom')
                return
            }

            await node.zoomIntoView({ maxZoom: 0.9 })

            if (isTextNode(node)) {
                // await node.setText('')
            }

            if (!currentParent || !supportsBackgroundColor(currentParent)) {
                return
            }

            prevBackground = currentParent?.backgroundColor || null
            // Check permission before setting attributes
            if (currentParent && framer.isAllowedTo('setAttributes')) {
                await currentParent.setAttributes({ backgroundColor })
            }

            prevNode = currentParent
        }

        try {
            for await (let item of eventSource!) {
                console.log(item.type, JSON.stringify(item, null, 2))

                if (!item) {
                    console.log('no item found')
                    continue
                }

                if (item.type === 'tool-call') {
                    setCurrentTool(`calling tool ${item.toolName}`)
                } else {
                    setCurrentTool('rewriting layers...')
                }

                if (item.type === 'tool-call') {
                    try {
                        if (item.toolName === 'delete') {
                            for (let nodeId of item.nodeIds) {
                                // Check permission before removing node
                                if (!framer.isAllowedTo('removeNode')) {
                                    throw new Error('Permission denied: cannot remove nodes')
                                }
                                await framer.removeNode(nodeId)
                            }
                        } else if (item.toolName === 'duplicate') {
                            for (let nodeId of item.nodeIds) {
                                const node = await framer.getNode(nodeId)
                                if (!node) {
                                    console.warn(
                                        `no node found for tool call ${item.toolName}`,
                                    )
                                    continue
                                }
                                const parent = await node.getParent()
                                if (!parent) {
                                    throw new Error('No parent found for node')
                                }
                                // Check permission before cloning node
                                if (!framer.isAllowedTo('cloneNode')) {
                                    throw new Error('Permission denied: cannot clone nodes')
                                }
                                let cloned = await node.clone()
                                if (!cloned) {
                                    throw new Error('No new node cloned found')
                                }
                                // Check permission before setting parent
                                if (!framer.isAllowedTo('setParent')) {
                                    throw new Error('Permission denied: cannot set parent')
                                }
                                await framer.setParent(cloned.id, parent?.id)
                            }
                        }
                    } finally {
                        console.log(`publishing tree change`)
                        const tree = await getFramerTree({
                            rootNodes,
                            recursive: false,
                        })
                        const { error } =
                            await pluginApiClient.api.plugins.llm.publish.post({
                                randomId,
                                callId: item.callId,
                                tree,
                            })
                        if (error) {
                            throw error
                        }
                        continue
                    }
                }
                const node = await framer.getNode(item.nodeId)

                if (!node) {
                    console.log(`no node found for id ${item.nodeId}`)
                    continue
                }
                if (item.type === 'fullItem') {
                    let partialItem = item.fullItem

                    if (isTextNode(node)) {
                        if (!partialItem.newContent) {
                            console.log('no text found in chunk', partialItem)
                            continue
                        }
                        // Check permission before setting text
                        if (!framer.isAllowedTo('setText')) {
                            throw new Error('Permission denied: cannot set text')
                        }
                        await node.setText(partialItem.newContent)
                    } else if (isComponentInstanceNode(node)) {
                    } else {
                        console.log(
                            `node type for id ${partialItem.nodeId} ${node?.['name']} not supported: ${node?.constructor.name}`,
                        )
                    }

                    await applyAttributes(node, partialItem.attributes).catch(
                        (e) => {
                            console.error('applyAttributes', e)
                            framer.notify(e.message, { variant: 'error' })
                        },
                    )
                }
            }
            console.log('done')

            await rootNodes[0]?.zoomIntoView({ maxZoom: 1 })
        } finally {
            // Check permission before setting attributes
            if (prevNode && framer.isAllowedTo('setAttributes')) {
                await prevNode.setAttributes({ backgroundColor: prevBackground })
            }
        }
    }
    useRefreshOnVisible({ enabled: !isLoading })

    const navigate = useNavigate()

    const [stars, setStars] = useState(0)

    useEffect(() => {
        if (!generationId) {
            return
        }
        const debounceTimeout = setTimeout(() => {
            if (stars > 0) {
                pluginApiClient.api.plugins.llm.submitReview
                    .post({
                        stars,
                        generationId,
                    })
                    .catch((error) => {
                        console.error('Failed to submit review:', error)
                    })
            }
        }, 700)

        return () => {
            clearTimeout(debounceTimeout)
        }
    }, [stars, generationId])

    const [shouldShowStars, setShouldShowStars] = useState(
        !!previousOldText.length && !isLoading,
    )

    function fixTexareaSize() {
        const target = textareaRef.current
        if (!target) return
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
            }}
            className='flex grow flex-col min-h-[320px] items-start w-full justify-start gap-3'
        >
            <div className='flex flex-col grow w-full py-2'>
                {!shouldShowStars && (
                    <div className='flex flex-col items-center w-full shrink-0 justify-center grow gap-3 text-center text-balance'>
                        <div className='font-semibold'>Add a prompt</div>
                        <div className='opacity-70'>
                            The plugin can duplicate, delete and rewrite
                            elements on the page
                        </div>
                    </div>
                )}
                {shouldShowStars && (
                    <div className='flex grow justify-center w-full gap-3 flex-col items-center'>
                        <div className='opacity-70'>
                            How good was the result?
                        </div>
                        <StarReview
                            value={stars}
                            onChange={(value) => {
                                setStars(value)
                                setTimeout(() => {
                                    setShouldShowStars(false)
                                }, 1000)
                            }}
                        />
                    </div>
                )}
            </div>
            <div className='w-full '>
                {/* <div className="text-[12px] opacity-70">Press arrow keys to go get previous prompts</div> */}
                {isLoading && currentTool && (
                    <div className='text-[10px] opacity-80 text-center'>
                        {currentTool}
                    </div>
                )}
                <textarea
                    ref={textareaRef}
                    // disabled={buyCreditsInstead}
                    required
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                    }}
                    onInput={(e) => {
                        fixTexareaSize()
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault()
                            onSubmit()
                        }
                        onKeyDown(e)
                    }}
                    className='p-2 py-2 shrink-0 leading-relaxed mt-1 w-full min-h-[80px]'
                    autoFocus
                    placeholder='describe your changes, mention urls to reuse content from the web...'
                />
            </div>

            {error && (
                <div className='text-red-300 text-[11px] font-mono'>
                    {error}
                </div>
            )}
            <div className='flex justify-stretch w-full gap-3'>
                {isLoading ? (
                    <Button
                        className='w-auto block grow'
                        onClick={() => {
                            console.log('aborting')
                            abortController.abort()
                        }}
                        type='button'
                    >
                        Cancel
                    </Button>
                ) : (
                    <Button
                        className='w-auto block grow'
                        onClick={() => {
                            navigate(withMode(Paths.settings))
                        }}
                        type='button'
                    >
                        Settings
                    </Button>
                )}
                <SubmitButton
                    selectedNodes={selectedNodes}
                    isLoading={isLoading}
                    description={description}
                />
            </div>
        </form>
    )
}

function SubmitButton({ isLoading, description, selectedNodes }) {
    const { deferred } = useLoaderData() as LoaderReturnType<typeof loader>
    const { credits } = use(deferred)
    const [buttonText, disabled] = (() => {
        if (!credits.remaining) {
            return ['Buy More Credits', true]
        }
        if (!selectedNodes.length) {
            return ['Select to Edit', true]
        }
        if (!description) {
            return ['Add a Prompt', true]
        }
        return ['Edit Selection', false]
    })()
    return (
        <Button
            isLoading={isLoading}
            disabled={disabled}
            type='submit'
            variant='primary'
            className='w-auto block grow'
        >
            <Suspense fallback={<div>Edit Selection</div>}>
                {buttonText}
            </Suspense>
        </Button>
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
    const deferred = async () => {
        let [credits, { email, orgId }, info] = await Promise.all([
            pluginApiClient.api.plugins.llm.getCredits
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
            framer.getProjectInfo(),
        ])
        const { id: projectId, name: projectName } = info

        const buyMoreCreditsUrl = getBuyLLMPluginUrl({
            email,
            orgId,
            projectId,
        })

        return {
            credits,
            projectId,
            projectName,
            buyMoreCreditsUrl,
        }
    }

    return {
        deferred: deferred(),
    }
}
