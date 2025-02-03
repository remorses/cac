import { Button } from 'template-rewrite-framer/src/components/Button'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import {
    useHistoryNavigation,
    useLatestFunction,
    useRefreshOnVisible,
} from 'template-rewrite-framer/src/lib/hooks'

import {
    getDesktop,
    globalState,
    isTruthy,
    LoaderReturnType,
    Paths,
    pluginApiClient,
    PluginDataKeys,
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
import { Suspense, use, useEffect, useRef, useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useLoaderData,
    useNavigate,
    useRevalidator,
} from 'react-router'

import { FramerLayersTree } from 'website/src/lib/rewrite'

import { StarReview } from 'template-rewrite-framer/src/components/StarReview'
import {
    applyAttributes,
    discardFramerChanges,
    getFramerTree,
    isNodeZoomable,
} from 'template-rewrite-framer/src/lib/framer'
import { bfsOldTextTree, oldTextTreeToXml, sleep } from 'website/src/lib/utils'
import { createBuyMigrateUrl } from 'website/src/lib/env'

let abortController = new AbortController()

function SimplePromptComponent({}) {
    const { deferred } = useLoaderData() as LoaderReturnType<typeof loader>

    const [description, setDescription] = useState(
        globalState.extractedDescription || '',
    )

    const [isLoading, setIsLoading] = useState(false)
    const [previousOldText, setPreviousOldText] = useState<FramerLayersTree>([])
    const { onKeyDown, onSubmit: historyOnSubmit } = useHistoryNavigation({
        value: description,
        setValue: setDescription,
    })

    useEffect(() => {
        // abort when leaving the page
        return () => {
            console.log('leaving the page, aborting')
            abortController.abort()
        }
    }, [])

    const revalidator = useRevalidator()

    // console.log('credits', credits)
    async function onSubmit() {
        const { buyMoreCreditsUrl, credits } = await deferred

        if (!credits.remaining) {
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
        historyOnSubmit()

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

        let oldText = await getFramerTree({ rootNodes })
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

                const node = await framer.getNode(partialItem.nodeId)

                if (!node) {
                    console.log(`no node found for id ${partialItem.nodeId}`)
                    continue
                }

                if (isTextNode(node)) {
                    if (!partialItem.newContent) {
                        console.log('no text found in chunk', partialItem)
                        continue
                    }
                    await node.setText(partialItem.newContent)
                } else if (isComponentInstanceNode(node)) {
                } else {
                    console.log(
                        `node type for id ${partialItem.nodeId} ${node?.['name']} not supported: ${node?.constructor.name}`,
                    )
                }
                await applyAttributes(node, partialItem.attributes)

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
                discardFramerChanges({ previousOldText }),
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
            className='flex grow flex-col min-h-[320px] items-start w-full justify-start gap-3'
        >
            <div className='flex flex-col w-full grow justify-center py-2'>
                {!shouldShowStars && (
                    <div className='flex flex-col items-center w-full shrink-0 justify-center grow gap-3 text-center text-balance'>
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
                    value={description}
                    // disabled={buyCreditsInstead}
                    required
                    onChange={(e) => {
                        setDescription(e.target.value)
                    }}
                    onInput={(e) => {
                        adjustHeight(e.target)
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
                    placeholder='Framer is a web design tool...'
                />
            </div>

            {error && (
                <div className='text-red-300 text-[11px] font-mono'>
                    {error}
                </div>
            )}
            <div className='flex justify-stretch w-full gap-3'>
                {Boolean(isLoading || previousOldText.length) ? (
                    <Button
                        // className='bg-transparent'
                        onClick={discard}
                        isLoading={isDiscarding}
                        type='button'
                    >
                        {isLoading ? 'Cancel' : 'Discard Replacement'}
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
                    disabled={!description}
                    selectedNodes={selectedNodes}
                    isLoading={isLoading}
                />
            </div>
        </form>
    )
}

function SubmitButton({ selectedNodes, isLoading, disabled }) {
    const { deferred } = useLoaderData() as LoaderReturnType<typeof loader>
    const { credits } = use(deferred)
    const buttonText = (() => {
        if (!credits.remaining) {
            return 'Buy More Credits'
        }
        if (selectedNodes.length) {
            return 'Replace Selection'
        }
        return 'Replace'
    })()
    return (
        <Button
            isLoading={isLoading}
            disabled={disabled}
            type='submit'
            variant='primary'
            className='w-auto block grow'
        >
            <Suspense fallback={<div>Replace</div>}>{buttonText}</Suspense>
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
        let [credits, { email, orgId }, { id: projectId }] = await Promise.all([
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

        const buyMoreCreditsUrl = createBuyMigrateUrl({
            email,
            projectId,
            orgId,
        })

        return {
            credits,
            buyMoreCreditsUrl,
        }
    }

    return { deferred: deferred() }
}
