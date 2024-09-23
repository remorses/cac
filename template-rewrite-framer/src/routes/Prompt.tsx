import { Button } from 'template-rewrite-framer/src/components/Button'
import { notifyError } from 'template-rewrite-framer/src/lib/errors'
import {
    useLatestFunction,
    useRefreshOnVisible,
} from 'template-rewrite-framer/src/lib/hooks'

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
    withMode,
} from 'template-rewrite-framer/src/lib/utils'

import { motion } from 'framer-motion'
import {
    AnyNode,
    ComponentInstanceNode,
    ComponentNode,
    framer,
    isComponentInstanceNode,
    isComponentNode,
    isFrameNode,
    isTextNode,
    supportsBackgroundColor,
    supportsVisible,
} from 'framer-plugin'
import { useEffect, useRef, useState } from 'react'
import {
    LoaderFunctionArgs,
    RouteObject,
    useLoaderData,
    useNavigate,
    useRevalidator,
} from 'react-router'

import { RewriteSchema } from 'website/src/lib/rewrite'

import { sleep } from 'website/src/lib/utils'

let abortController = new AbortController()

let instanceNodes = new Map<
    string,
    { node: ComponentInstanceNode; controlKey: string }
>()

function SimplePromptComponent({}) {
    const { buyMoreCreditsUrl, credits } = useLoaderData() as LoaderReturnType<
        typeof loader
    >
    const [description, setDescription] = useState(
        globalState.extractedDescription || '',
    )
    const [isLoading, setIsLoading] = useState(false)
    const [oldNodes, setOldNodes] = useState<
        Array<RewriteSchema['textToReplace'][number] & { node: AnyNode }>
    >([])

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

        function addText({ node, nodeId, text, name }) {
            const textData: RewriteSchema['textToReplace'][number] = {
                // index: i,
                nodeId,
                content: text,
                name,
            }
            setOldNodes((oldNodes) => [...oldNodes, { ...textData, node }])
            oldText.push(textData)
        }

        async function handleNode(node: AnyNode) {
            // console.log('node', node.constructor.name)
            if (isTextNode(node)) {
                const isVisible = await isNodeVisible(node)
                if (!isVisible) {
                    // console.log('node not visible', node.id)
                    return
                }
                const text = await node.getText()
                let nodeId = node.id
                if (!text) {
                    console.log('no text found for node', node.id)
                    return
                }
                if (text) {
                    addText({
                        nodeId,
                        text,
                        name: await getNodePath(node),
                        node,
                    })
                }
            }
            if (isComponentInstanceNode(node)) {
                const isVisible = await isNodeVisible(node)
                if (!isVisible) {
                    console.log('node not visible', node.id)
                    return
                }
                const _component = await getInstanceComponent(node)
                if (!_component) {
                    return
                }
                const controls = Object.entries(node.controls)
                // let updatedControls = { ...node.controls }

                for (let [key, value] of controls) {
                    if (
                        typeof value === 'string' &&
                        // TODO check type when framer supports it
                        possibleInstanceTextFields.includes(
                            key.toLocaleLowerCase(),
                        )
                    ) {
                        let name = (await getNodePath(node)) + '/' + key
                        let nodeId = nineCharsRandomString()
                        instanceNodes.set(nodeId, {
                            node,
                            controlKey: key,
                        })
                        addText({
                            nodeId,
                            text: value,
                            name,
                            node,
                        })
                    }
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

        // console.log('oldText', JSON.stringify(oldText, null, 2))

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
                    sourceHtml: globalState.sourceHtml,
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
        let lastTimeZoomed = Date.now()
        let minTimeOnNode = credits.free ? 900 : 200
        try {
            for await (let {
                partialItem: chunk,
                object: completeObj,
                nextItemId,
            } of eventSource!) {
                if (nextItemId) {
                    let node =
                        instanceNodes.get(nextItemId)?.node ||
                        (await framer.getNode(nextItemId))

                    if (!node) {
                        console.log('no node to zoom found for id', nextItemId)

                        continue
                    }

                    await prevNode?.setAttributes({
                        backgroundColor: prevBackground,
                    })
                    let currentParent = (await node.getParent()) || undefined
                    const isVisible = await isNodeZoomable(node)
                    if (!isVisible) {
                        console.log('node not visible, skipping zoom')
                        continue
                    }
                    lastTimeZoomed = Date.now()
                    await node.zoomIntoView({ maxZoom: 0.9 })
                    if (isTextNode(node)) {
                        // await node.setText('')
                    }

                    if (
                        !currentParent ||
                        !supportsBackgroundColor(currentParent)
                    ) {
                        continue
                    }

                    prevBackground = currentParent?.backgroundColor || null
                    await currentParent?.setAttributes({ backgroundColor })

                    prevNode = currentParent
                }
                if (!chunk) {
                    continue
                }

                // Process each chunk (value)

                if (chunk.nodeId == null) {
                    console.log(`no nodeId found: ${chunk}`)
                    continue
                }

                const node =
                    instanceNodes.get(chunk.nodeId)?.node ||
                    (await framer.getNode(chunk.nodeId))

                if (!node) {
                    console.log(`no node found for id ${chunk.nodeId}`)
                    continue
                }
                const old = oldText.find(
                    (x) => x.nodeId === chunk.nodeId,
                )?.content
                if (!old) {
                    console.log(`no old text found for node ${chunk.nodeId}`)
                    continue
                }
                // console.log(
                //     `replacing text from\nbefore: ${JSON.stringify(old)}\nafter:${JSON.stringify(chunk.content)}`,
                // )

                if (Date.now() - lastTimeZoomed < minTimeOnNode) {
                    let time = minTimeOnNode - (Date.now() - lastTimeZoomed)
                    console.log('waiting before zooming', time)
                    await sleep(time)
                }

                if (!chunk.content) {
                    console.log('no text found in chunk', chunk)
                    continue
                }
                if (isTextNode(node)) {
                    await node.setText(chunk.content)
                }
                if (isComponentInstanceNode(node)) {
                    const instance = instanceNodes.get(chunk.nodeId)
                    if (!instance) {
                        console.log('no instance found for node', chunk.nodeId)
                        continue
                    }
                    let key = instance.controlKey
                    let controls = { ...node.controls }
                    controls[key] = chunk.content
                    console.log('setting node control', key)
                    await node.setAttributes({ controls })
                }

                if (completeObj?.content) {
                    let words = completeObj.content.split(/\s+/).length
                    setRemainingCredits(Math.max(0, credits.remaining - words))
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

    const discard = useLatestFunction(async () => {
        if (isLoading) {
            console.log('aborting')
            abortController.abort()
            return
        }
        if (!oldNodes.length) {
            console.log('no old nodes to discard')
            return
        }
        const promises = oldNodes.map((oldNodeObj) => {
            const { nodeId, content: oldContent, node } = oldNodeObj
            if (!oldContent || !nodeId) {
                console.log('no old content or node id found')
                return Promise.resolve()
            }

            if (isTextNode(node)) {
                // console.log('setting text', oldContent)
                return node.setText(oldContent)
            }
            let instance = instanceNodes.get(nodeId)
            if (instance) {
                const { node, controlKey } = instance
                let controls = { ...node.controls }
                controls[controlKey] = oldContent
                return node.setAttributes({
                    controls,
                })
            }
        })

        await Promise.all(promises)
        setOldNodes([])
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

    const [remainingCredits, setRemainingCredits] = useState(credits.remaining)
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
            className='flex grow flex-col items-start w-full justify-start gap-3'
        >
            <div className='flex flex-col items-center w-full py-[50px] shrink-0 justify-center grow gap-3 text-center text-balance'>
                <div className='font-semibold'>Add a description</div>
                <div className='opacity-70'>
                    The plugin will use this description to replace content on
                    your page.
                </div>
            </div>
            <div className='w-full'>
                <textarea
                    ref={textareaRef}
                    value={description}
                    disabled={buyCreditsInstead}
                    required
                    onChange={(e) => {
                        setDescription(e.target.value)
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
            {oldNodes.length > 0 && (
                <Button
                    // className='bg-transparent'
                    onClick={discard}
                    type='button'
                >
                    {isLoading ? 'Cancel' : 'Discard Replacement'}
                </Button>
            )}
            {/* <div className='text-[11px] opacity-70'>
                <span className='font-mono tracking-wider font-semibold'>
                    {formatLargeNumber(remainingCredits)}
                </span>{' '}
                credits remaining
            </div> */}
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

async function getInstanceComponent(componentInstance: AnyNode) {
    if (!isComponentInstanceNode(componentInstance)) {
        return
    }
    // console.log('controls', componentInstance.controls)
    if (!componentInstance.componentIdentifier.startsWith('local-module:')) {
        console.log(
            `component ${componentInstance.componentIdentifier} is not a local module`,
        )
        return
    }
    const regex = /local-module:.*\/(.*):.*/
    const match = componentInstance.componentIdentifier.match(regex)
    if (!match) {
        console.log(
            `component ${componentInstance.componentIdentifier} does not match regex to get component id`,
        )
        return
    }

    const componentId = match[1]
    const componentNode = await framer.getNode(componentId)
    if (!componentNode || !isComponentNode(componentNode)) {
        console.log(`could not find component node for ${componentId}`)
        return
    }

    return componentNode
}

export async function getComponentCodeUrl(componentNode?: AnyNode) {
    // example is https://framer.com/m/FAQ-Row-Copy-FR9A9RBHB.js
    // https://framer.com/m/AccordionOne-V8Wz.js@FR9A9RBHB
    if (isComponentInstanceNode(componentNode)) {
        return await getComponentCodeUrl(
            await getInstanceComponent(componentNode),
        )
    }
    if (isComponentNode(componentNode)) {
        let nameEncoding = componentNode.name || ''
        if (!nameEncoding) {
            return
        }

        // turn FAQ Row Copy into FAQ-Row-Copy, replace space with -
        nameEncoding = nameEncoding.replace(/ +/g, '-')
        nameEncoding = encodeURIComponent(nameEncoding)
        let id = componentNode.id
        return `https://framer.com/m/${nameEncoding}-${id}.js`
    }
    // console.log('not a component node', componentNode?.constructor?.name)
}
Object.assign(globalThis, { getComponentCodeUrl })

async function* recurseIntoComponent(componentInstance: AnyNode) {
    const componentNode = await getInstanceComponent(componentInstance)
    if (!componentNode) {
        return
    }
    const primary = (await componentNode.getChildren()).find(
        (x) => isFrameNode(x) && !x.isReplica,
    )
    if (!primary) {
        console.log('no primary child for component found')
        return
    }

    for await (let child of primary.walk()) {
        yield child
        yield* recurseIntoComponent(child)
    }
    // const nonPrimary = (await componentNode.getChildren()).filter(
    //     (x) => isFrameNode(x) && x.isReplica,
    // )

    // for (let child of nonPrimary) {
    //     for await (let grandChild of child.walk()) {
    //         if (isTextNode(grandChild)) {
    //             const primaryText = nodeIdToText.get(grandChild.id)
    //             console.log('primaryText', primaryText)
    //             const text = await grandChild.getText()
    //             if (primaryText !== text) {
    //                 console.log('text mismatch', text, primaryText)
    //                 yield grandChild
    //             }
    //         }
    //         if (!grandChild.isReplica) {
    //             console.log('non primary child', grandChild)
    //             yield grandChild
    //         }
    //     }
    // }
}

async function isNodeVisible(node: AnyNode) {
    const parents = await collectGenerator(getParentNodes(node))
    const isVisible = parents.every((parent) => {
        if (supportsVisible(parent)) {
            return parent.visible
        }
        return true
    })
    return isVisible && (!supportsVisible(node) || node.visible)
}
async function isNodeZoomable(node: AnyNode) {
    if (!(await isNodeVisible(node))) {
        return false
    }
    const parents = await collectGenerator(getParentNodes(node))
    const componentChild = parents.some((parent) => {
        if (isComponentNode(parent)) {
            return true
        }
        return false
    })
    return !componentChild
}

const possibleInstanceTextFields = [
    'text',
    'placeholder',
    'label',
    'title',
    'description',
    'hint',
    'question',
    'buttontext',
    'content',
]

function nineCharsRandomString() {
    return Math.random().toString(36).substring(2, 10)
}
