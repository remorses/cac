import { Button } from 'template-rewrite-framer/src/components/Button'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import {
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
    isComponentNode,
    isTextNode,
    isWebPageNode,
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

import { StarReview } from 'template-rewrite-framer/src/components/StarReview'
import {
    discardFramerChanges,
    getFramerTree,
    isNodeZoomable,
    NodeWithControl,
} from 'template-rewrite-framer/src/lib/framer'
import { bfsOldTextTree, oldTextTreeToXml, sleep } from 'website/src/lib/utils'
import { Paths, pluginApiClient, PluginDataKeys } from '@/lib/utils'
import { getBuyLLMPluginUrl } from 'website/src/lib/env'

let abortController = new AbortController()

let instanceNodes = new Map<string, NodeWithControl>()

function SimplePromptComponent({}) {
    const { buyMoreCreditsUrl, credits } = useLoaderData() as LoaderReturnType<
        typeof loader
    >

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
    async function onSubmit() {
        if (buyCreditsInstead) {
            // setIsLoading(true)
            window.open(buyMoreCreditsUrl, '_blank')
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
        } catch (e) {
            notifyError(e, 'submitting rewrite prompt')
        } finally {
            revalidator.revalidate()
            setShouldShowStars(true)
            setIsLoading(false)
        }
    }
    let [error, setError] = useState('')

    const [generationId, setGenerationId] = useState(0)
    const [selectedNodes, setSelectedNodes] = useState<AnyNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection((selection) => {
            setSelectedNodes(selection.filter((x) => x))
        })
    }, [])

    function reset() {
        setPreviousOldText([])
        instanceNodes.clear()
        setGenerationId(0)
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

        let oldText = await getFramerTree({ rootNodes, instanceNodes })
        // @ts-ignore
        if (import.meta.env?.DEV) {
            try {
                const xml = oldTextTreeToXml(oldText)

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

        if (!oldText.length) {
            setError('No text found to replace')
            return
        }
        setPreviousOldText([...oldText])

        const { name: projectName } = await framer.getProjectInfo()
        let pagePath = ''
        const root = await framer.getCanvasRoot()
        if (isWebPageNode(root)) {
            pagePath = root.path || ''
        } else if (isComponentNode(root)) {
            pagePath = '/__component/' + root.componentName || ''
        }

        const { data: eventSource, error } =
            await pluginApiClient.api.plugins.rewritePlugin.rephrase.post(
                {
                    description,
                    oldText: oldText,
                    // exampleTextToMigrate: globalState.exampleTextToMigrate,
                    sourceHtml: globalState.sourceHtml,
                    url: globalState.sourceUrl,
                    pagePath,
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
        let lastTimeZoomed = Date.now()
        let minTimeOnNode = credits.free ? 200 : 200
        const allOldNodes = bfsOldTextTree(oldText).filter((x) => x?.nodeId)

        let currentNodeId = undefined as string | undefined

        async function highlightNextNode(nextItemId) {
            let node =
                instanceNodes.get(nextItemId)?.node ||
                (await framer.getNode(nextItemId))

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
            for await (let streamPart of eventSource!) {
                // console.log('partialItem', streamPart)

                if (streamPart.type === 'generation') {
                    setGenerationId(streamPart.generationId)
                    continue
                }
                if (streamPart.type !== 'chunk') {
                    continue
                }
                const { completeObj, partialItem } = streamPart

                if (partialItem && currentNodeId !== partialItem.nodeId) {
                    await highlightNextNode(partialItem.nodeId)
                }
                currentNodeId = partialItem?.nodeId
                if (completeObj?.newContent) {
                    // let words = completeObj.newContent.split(/\s+/).length
                    console.log(
                        'new text',
                        JSON.stringify(completeObj, null, 2),
                    )
                }

                if (!partialItem) {
                    continue
                }

                // Process each chunk (value)

                if (partialItem.nodeId == null) {
                    console.log(
                        `no nodeId found: ${JSON.stringify(partialItem)}`,
                    )
                    continue
                }

                const node =
                    instanceNodes.get(partialItem.nodeId)?.node ||
                    (await framer.getNode(partialItem.nodeId))

                if (!node) {
                    console.log(`no node found for id ${partialItem.nodeId}`)
                    continue
                }
                const old = allOldNodes.find(
                    (x) => x.nodeId === partialItem.nodeId,
                )?.content
                if (!old) {
                    console.log(
                        `no old text found for node ${partialItem.nodeId}`,
                    )
                    continue
                }
                // console.log(
                //     `replacing text from\nbefore: ${JSON.stringify(old)}\nafter:${JSON.stringify(chunk.content)}`,
                // )

                if (Date.now() - lastTimeZoomed < minTimeOnNode) {
                    let time = minTimeOnNode - (Date.now() - lastTimeZoomed)
                    // console.log('waiting before zooming', time)
                    await sleep(time)
                }

                if (!partialItem.newContent) {
                    // console.log('no text found in chunk', chunk)
                    continue
                }
                if (isTextNode(node)) {
                    await node.setText(partialItem.newContent)
                } else if (isComponentInstanceNode(node)) {
                    const instance = instanceNodes.get(partialItem.nodeId)
                    if (!instance) {
                        console.log(
                            'no instance found for node',
                            partialItem.nodeId,
                        )
                        continue
                    }

                    let controls = {
                        // ...node.controls,
                        [instance.controlKey]: partialItem.newContent,
                    }

                    console.log('setting node control', instance.controlKey)
                    await node.setAttributes({ controls })
                } else {
                    console.log(
                        `node type for id ${partialItem.nodeId} ${node?.['name']} not supported: ${node?.constructor.name}`,
                    )
                }

                // TODO add links
                // if (supportsLink(node) && chunk.href) {
                //     console.log('setting link', chunk.href)
                //     await node.setAttributes({ link: chunk.href })
                // }
            }
            await sleep(200)
            await rootNodes[0]?.zoomIntoView({ maxZoom: 1 })
        } finally {
            await prevNode?.setAttributes({ backgroundColor: prevBackground })
        }
    }
    useRefreshOnVisible({ enabled: !isLoading })

    const discard = useLatestFunction(async () => {
        if (isLoading) {
            console.log('aborting')
            abortController.abort()
            return
        }
        if (!previousOldText.length) {
            console.log('no old nodes to discard')
            return
        }
        setIsDiscarding(true)
        try {
            await Promise.all([
                discardFramerChanges({ previousOldText, instanceNodes }),
                pluginApiClient.api.plugins.rewritePlugin.discardGeneration.post(
                    {
                        id: generationId,
                    },
                ),
            ])
            reset()
        } finally {
            setIsDiscarding(false)
        }
    })

    const buttonText = (() => {
        if (!credits.remaining) {
            return 'Buy More Credits'
        }
        if (selectedNodes.length) {
            return 'Replace Selection'
        }
        return 'Replace'
    })()

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    useEffect(() => {
        if (textareaRef.current) {
            adjustHeight(textareaRef.current)
        }
    }, [])
    const navigate = useNavigate()

    const adjustHeight = (element) => {
        element.style.height = 'auto'
        element.style.height = `${element.scrollHeight}px`
    }
    const [stars, setStars] = useState(0)

    useEffect(() => {
        if (!generationId) {
            return
        }
        const debounceTimeout = setTimeout(() => {
            if (stars > 0) {
                pluginApiClient.api.plugins.rewritePlugin.submitReview
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

    const [isDiscarding, setIsDiscarding] = useState(false)
    const [shouldShowStars, setShouldShowStars] = useState(
        !!previousOldText.length && !isLoading,
    )

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
            }}
            className='flex grow flex-col items-start w-full justify-start gap-3'
        >
            <div className='flex flex-col w-full min-h-[160px]'>
                {!shouldShowStars && (
                    <div className='flex flex-col items-center w-full py-[50px] shrink-0 justify-center grow gap-3 text-center text-balance'>
                        <div className='font-semibold'>Add a description</div>
                        <div className='opacity-70'>
                            The plugin will use this description to replace
                            content on your page.
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
                    onChange={(e) => {
                        adjustHeight(e.target)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault()
                            onSubmit()
                        }
                    }}
                    className='p-2 py-2 shrink-0 leading-relaxed mt-1 w-full min-h-[80px]'
                    autoFocus
                    placeholder='Framer is a web design tool...'
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
                    // disabled={disabled}
                    type='submit'
                    variant='primary'
                    className='w-auto block grow'
                >
                    {buttonText}
                </Button>
            </div>
            {Boolean(isLoading || previousOldText.length) && (
                <Button
                    // className='bg-transparent'
                    onClick={discard}
                    isLoading={isDiscarding}
                    type='button'
                >
                    {isLoading ? 'Cancel' : 'Discard Replacement'}
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
        buyMoreCreditsUrl,
    }
}
