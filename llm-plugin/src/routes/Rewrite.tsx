import { Button } from 'template-rewrite-framer/src/components/Button'
import { flushSync } from 'react-dom'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import {
    useHistoryNavigation,
    useLatestFunction,
    useRefreshOnVisible,
} from 'template-rewrite-framer/src/lib/hooks'

import {
    getDesktop,
    isTruthy,
    LoaderReturnType,
    withMode,
} from 'template-rewrite-framer/src/lib/utils'

import {
    AnyNode,
    ColorStyle,
    framer,
    isComponentInstanceNode,
    isTextNode,
    supportsBackgroundColor,
} from 'framer-plugin'
import { useEffect, useRef, useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useLoaderData,
    useNavigate,
    useRevalidator,
} from 'react-router'

import { OldTextTree } from 'website/src/lib/rewrite'

import { Paths, pluginApiClient } from '@/lib/utils'
import { StarReview } from 'template-rewrite-framer/src/components/StarReview'
import {
    discardFramerChanges,
    getFramerTree,
    isNodeZoomable,
} from 'template-rewrite-framer/src/lib/framer'
import { getBuyLLMPluginUrl } from 'website/src/lib/env'
import { bfsOldTextTree, oldTextTreeToXml, sleep } from 'website/src/lib/utils'
import { decodeControlAttributes } from 'website/src/lib/xml'

let abortController = new AbortController()

const randomId = makeRandomId()

function makeRandomId() {
    return Math.random().toString(36).substring(2, 15)
}

function SimplePromptComponent({}) {
    const { buyMoreCreditsUrl, projectId, credits } =
        useLoaderData() as LoaderReturnType<typeof loader>

    const [isLoading, setIsLoading] = useState(false)
    const [previousOldText, setPreviousOldText] = useState<OldTextTree>([])

    useEffect(() => {
        // abort when leaving the page
        return () => {
            console.log('leaving the page, aborting')
            abortController.abort()
        }
    }, [])

    const revalidator = useRevalidator()
    const buyCreditsInstead = !credits.remaining
    // console.log('credits', credits)
    const [description, setDescription] = useState('')
    const [generationId, setGenerationId] = useState(0)

    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { onKeyDown, onSubmit: historyOnSubmit } = useHistoryNavigation({
        value: description,
        setValue: setDescription,
    })

    async function onSubmit() {
        if (buyCreditsInstead) {
            window.open(buyMoreCreditsUrl, '_blank')
            return
        }

        if (isLoading) {
            return
        }

        historyOnSubmit()
        return

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

    async function replaceTextClient() {
        reset()
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
        // @ts-ignore
        if (import.meta.env?.DEV) {
            try {
                const xml = oldTextTreeToXml(oldText, {
                    shouldAddNodeIdAlways: true,
                })

                await navigator.clipboard.writeText(
                    JSON.stringify(oldText, null, 2),
                )
                await sleep(400)
                await navigator.clipboard.writeText(xml)
                console.log('Old text copied to clipboard as JSON')
            } catch (error) {
                console.error('Failed to copy old text to clipboard:', error)
            }
        }
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
        let lastTimeZoomed = Date.now()
        let minTimeOnNode = credits.free ? 200 : 200
        const allOldNodes = bfsOldTextTree(oldText).filter((x) => x?.nodeId)

        let currentNodeId = undefined as string | undefined

        async function highlightNextNode(nextItemId) {
            let node = await framer.getNode(nextItemId)

            if (!node) {
                console.log('no node to zoom found for id', nextItemId)

                return
            }
            // console.log(`nextItemId is ${nextItemId} ${node?.name}`)

            await prevNode?.setAttributes({
                backgroundColor: prevBackground,
            })
            // prevNode = undefined
            // prevBackground = null
            let currentParent = (await node.getParent()) || undefined
            const isZoomable = await isNodeZoomable(node)
            if (!isZoomable) {
                console.log('node not visible, skipping zoom')
                return
            }
            lastTimeZoomed = Date.now()
            await node.zoomIntoView({ maxZoom: 0.9 })

            if (isTextNode(node)) {
                // await node.setText('')
            }

            if (!currentParent || !supportsBackgroundColor(currentParent)) {
                return
            }

            prevBackground = currentParent?.backgroundColor || null
            await currentParent?.setAttributes({ backgroundColor })

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
                    try {
                        if (item.toolName === 'delete') {
                            for (let nodeId of item.nodeIds) {
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
                                let cloned = await node.clone()
                                if (!cloned) {
                                    throw new Error('No new node cloned found')
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
                        await node.setText(partialItem.newContent)
                    } else if (isComponentInstanceNode(node)) {
                        const controls = partialItem.attributes
                        if (!controls) {
                            console.log(
                                'no component controls to set found in item',
                                item,
                            )
                            continue
                        }
                        await node.setAttributes({
                            controls: decodeControlAttributes(controls),
                        })
                    } else {
                        console.log(
                            `node type for id ${partialItem.nodeId} ${node?.['name']} not supported: ${node?.constructor.name}`,
                        )
                    }
                }
            }
            console.log('done')
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
        if (!selectedNodes.length) {
            return 'Select to Edit'
        }
        return 'Edit Selection'
    })()

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
            <div className='w-full'>
                <textarea
                    ref={textareaRef}
                    disabled={buyCreditsInstead}
                    required
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height = `${target.scrollHeight}px`
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
                    placeholder='Add a new pricing plan with a higher price...'
                />
            </div>

            {error && (
                <div className='text-red-300 text-[11px] font-mono'>
                    {error}
                </div>
            )}
            <div className='flex justify-stretch w-full gap-3'>
                <Button
                    className='w-auto block grow'
                    onClick={() => {
                        navigate(withMode(Paths.settings))
                    }}
                    type='button'
                >
                    Settings
                </Button>
                <Button
                    isLoading={isLoading}
                    disabled={
                        !description ||
                        !selectedNodes.length ||
                        buyCreditsInstead
                    }
                    type='submit'
                    variant='primary'
                    className='w-auto block grow'
                >
                    {buttonText}
                </Button>
            </div>
            {Boolean(isLoading) && (
                <Button
                    // className='bg-transparent'
                    onClick={() => {
                        if (isLoading) {
                            console.log('aborting')
                            abortController.abort()
                            return
                        }
                    }}
                    type='button'
                >
                    Cancel
                </Button>
            )}
        </form>
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
    let [credits, { email, orgId }, info] = await Promise.all([
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
        framer.getProjectInfo(),
    ])
    const { id: projectId } = info

    const buyMoreCreditsUrl = getBuyLLMPluginUrl({
        email,
        orgId,
        projectId,
    })

    return {
        credits,
        projectId,
        buyMoreCreditsUrl,
    }
}
