import { anthropic } from '@ai-sdk/anthropic'
import { smoothStream, streamText, tool } from 'ai'
import { createTwoFilesPatch } from 'diff'
import { Evt } from 'evt'
import dedent from 'string-dedent'

import { Spiceflow } from 'spiceflow'

import { openai } from '@ai-sdk/openai'
import { createFallback } from 'ai-fallback'
import { db } from 'db/kysely'
import { prisma } from 'db'
import Stripe from 'stripe'
import { getOrgPluginCredits } from 'website/src/lib/credits'
import { env } from 'website/src/lib/env'
import { createArrayItemsYielder } from 'website/src/lib/ndjson'
import { FramerLayersTree } from 'website/src/lib/rewrite'
import {
    extractObjectsFromXmlContent,
    NewExtractedNode,
    oldTextTreeToXml,
} from 'website/src/lib/xml'
import { z } from 'zod'
import { splitIntoWords } from 'website/src/lib/ssr.server'
import { google } from '@ai-sdk/google'
import { fetchFormattedHtml } from './htmlrewrite.server'

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {})

type FramerEventLLM = {
    type: 'framer-update'
    tree: FramerLayersTree
    callId: string
} //

let projectsEvents = new Map<string, Evt<FramerEventLLM>>()

let model = createFallback({
    models: [
        google('gemini-2.5-pro-preview-05-06'),
        google('gemini-2.0-flash-001'),
        anthropic('claude-3-5-haiku-latest'),
        openai('gpt-4o'), //
    ],
    onError(error, modelId) {
        console.error(error)
    },
})

export const llmPluginApp = new Spiceflow({
    basePath: '/llm',
})
    .state('orgId', Promise.resolve(''))
    .state('userId', Promise.resolve(''))

    .use(async function addGithubUserLogin({ request, state: store }, next) {
        const pathname = new URL(request.url).pathname
        if (!pathname.includes('/llm')) {
            return
        }
        // make publish faster
        if (pathname.includes('/publish')) {
            return
        }

        const res = await next()

        res.headers.set(
            'fly-force-instance-id',
            process.env.FLY_MACHINE_ID || '',
        )

        return res
    })
    .get('/health', () => {
        return 'ok'
    })
    .post(
        '/submitReview',
        async ({ state: store, request }) => {
            const body = await request.json()

            const { stars, generationId } = body
            const userId = await store.userId
            const orgId = await store.orgId

            if (!userId || !orgId) {
                throw unauthorizedResponse
            }

            try {
                await db
                    .updateTable('Generation')
                    .set({ starsReview: stars })
                    .where('id', '=', generationId)
                    .where('orgId', '=', orgId)
                    .execute()

                return { success: true }
            } catch (error) {
                console.error('Failed to submit review:', error)
                return { success: false, error: 'Failed to submit review' }
            }
        },
        {
            body: z.object({
                stars: z.number().int().min(1).max(5),
                generationId: z.number().int().positive(),
            }),
        },
    )
    .post(
        '/publish',
        async ({ request, params }) => {
            const { randomId, callId, tree } = await request.json()

            const emitter = projectsEvents.get(randomId)

            if (!emitter) {
                throw new Error('No emitter found for project')
            }
            console.log('publishing update')
            emitter.post({ tree, callId, type: 'framer-update' })

            return 'ok'
        },
        {
            body: z.object({
                randomId: z.string(),
                callId: z.string(),
                tree: z.custom<FramerLayersTree>(),
            }),
        },
    )
    .post(
        '/getCredits',
        async ({ state: store, request }) => {
            // console.log('cookies', cookie)
            // const { userId } = await getSupabaseSession({ request })
            // if (!userId) {
            //     throw new AppError('No user id')
            // }
            const userId = await store.userId
            if (!userId) {
                throw unauthorizedResponse
            }
            const credits = await getOrgPluginCredits({
                orgId: userId,
                pluginName: 'llm',
            })

            // console.log('credits', credits)
            return credits
        },
        {
            // response: {
            //     200: t.AsyncIterator(t.String()),
            // },
        },
    )
    .post(
        '/generate',
        async function* ({ params, request, state: store }) {
            const orgId = await store.orgId
            request.signal.addEventListener('abort', () => {
                console.log('aborting')
            })
            const body = await request.json()
            console.log('body', body)
            const { projectName, randomId, description, tree, projectId } = body

            const initialXml = oldTextTreeToXml(tree, {
                shouldAddNodeIdAlways: true,
            })
            console.log(initialXml)
            let fullAnswer = ''

            projectsEvents.set(randomId, new Evt())
            const emitter = projectsEvents.get(randomId)!
            let words = 0
            let chars = 0
            try {
                let lastXmlBeforeCall = initialXml
                const generateDiffText = async (toolCallId: string) => {
                    console.log(`waiting for tool result ${toolCallId}`)
                    const result = await emitter.waitFor(
                        (x) => x.callId === toolCallId,
                        1000 * 5,
                    )
                    if (!result) {
                        throw new Error('No result found for project')
                    }
                    console.log('generating diff')
                    const { tree } = result
                    const xml = oldTextTreeToXml(tree, {
                        shouldAddNodeIdAlways: true,
                    })
                    const patch = createTwoFilesPatch(
                        'original',
                        'modified',
                        lastXmlBeforeCall,
                        xml,
                        '',
                        '',
                        { ignoreWhitespace: true },
                    )
                    lastXmlBeforeCall = xml
                    // console.log(patch)
                    return patch
                }

                const result = streamText({
                    model,
                    // toolChoice: 'required',
                    abortSignal: request.signal,
                    maxSteps: 40,
                    experimental_transform: smoothStream({
                        chunking: 'line',
                    }),

                    tools: {
                        fetch: tool({
                            parameters: z.object({
                                url: z.string(),
                            }),
                            description: dedent`
                            fetch an url provdied by the user to get the content of that website page and help get context on how to modify the current elements on the page.
                            `,
                            async execute({ url }, { toolCallId }) {
                                try {
                                    const html = await fetchFormattedHtml({
                                        url,
                                        signal: request.signal,
                                    })
                                    return html
                                } catch (e) {
                                    return {
                                        status: 'error',
                                        message: `Could not fetch that url: ${e.message}`,
                                    }
                                }
                            },
                        }),
                        duplicate: tool({
                            parameters: z.object({
                                nodeIds: z.array(z.string()),
                            }),
                            description: dedent`
                            Clone a subtree you can later edit. Only call if the user requested change requires adding new nodes.
                            Updating the tree directly is preferred, only call this tool if the elements in the tree are not enough to accomplish the user task.
                            Returns the diff of the updated xml tree so you can then act on the new nodeIds.
                            Notice that you can pass multiple nodeIds at the same time to save time.
                            `,
                            async execute({ nodeIds }, { toolCallId }) {
                                try {
                                    console.log('calling duplicate tool')
                                    const diffText =
                                        await generateDiffText(toolCallId)
                                    return dedent`
                                    Here is the diff of the duplication:

                                    ${diffText}

                                    Now you can proceed with more duplications if needed, or deletions, or output the final xml with the content changes.
                                    `
                                } catch (error) {
                                    console.error('Error calling tool', error)
                                    return ''
                                }
                            },
                        }),
                        delete: tool({
                            parameters: z.object({
                                nodeIds: z.array(z.string()),
                            }),
                            description: dedent`
                            Delete subtrees from the xml tree. This tool MUST NOT ever be called on the root xml element.
                            DO NOT delete elements that you later want to update.
                            It's only useful to delete elements in the tree that are no longer needed. After you delete a node you cannot use its nodeId any longer.
                            `,
                            async execute({ nodeIds }, { toolCallId }) {
                                try {
                                    console.log('calling delete tool')
                                    const diffText =
                                        await generateDiffText(toolCallId)
                                    return dedent`
                                    Here is the diff of the deletion:

                                    ${diffText}

                                    Now you can proceed with more deletions if needed, or duplications, or output the final xml with the content changes.
                                    `
                                } catch (error) {
                                    console.error('Error calling tool', error)
                                    return ''
                                }
                            },
                        }),
                    },
                    messages: [
                        {
                            role: 'system',
                            content: `
                            You are an expert copywriter tasked with updating a Framer website content by mutating the website xml tree.

                            You have access to two tools:
                            - "duplicate" - Creates a copy of some specified xml nodes and returns the new nodeIds in the diff
                            - "delete" - Removes some specified xml nodes

                            First, analyze if any duplications or deletions are needed for the requested changes, do this in XML comments above the elements:
                            1. Plan out quickly the needed structural changes first
                            2. Execute the needed "duplicate" call, noting the new nodeIds from the diffs. Group many nodeIds into one call.
                            3. Execute the needed "delete" call. Group many nodeIds into one call.
                            4. Only after completing structural changes, output the final xml with content and attributes changes

                            Important rules for the final xml output:
                            - Do not include any xml tags for deleted nodes or unchanged nodes
                            - The output xml should be partial, no need to include the full xml from the input. Only show the parts you want to rewrite content or attributes for and add comments for skipped sections, like this:
                                \`\`\`xml
                                <!-- skipped nodes -->
                                <text nodeId="Xy01EPyOT" updatedTag="updated">Updated heading text</text>
                                <!-- skipped nodes -->
                                \`\`\`

                            You MUST skip attributes that you do not plan to update, other than nodeId, which is required to identify the node. Feel free to reorder attributes.

                            Do not say anything after returning the code snippet, no need to make a summary.
                            `,
                        },

                        {
                            role: 'user',
                            content: formatUserMessage({
                                initialXml: formatExampleXml({}),
                                description: `add a new faq section for the pricing information, the faq content should tell that pricing is shown in the /pricing page`,
                            }),
                        },

                        {
                            role: 'assistant',
                            content: dedent`


                            \`\`\`xml
                            <!-- Duplicating existing FAQ tag and modifying node ${addedFaqNodeId} to add pricing FAQ section -->
                            ${exampleAddedFaqSection}
                            <-- other tags -->
                            \`\`\`
                            `,
                            toolInvocations: [
                                {
                                    toolCallId: 'exampleFunctionCallId',
                                    toolName: 'duplicate',
                                    args: {
                                        nodeIds: ['UyBbEMyfT'],
                                    },
                                    state: 'result',
                                    result: createTwoFilesPatch(
                                        'original',
                                        'modified',
                                        formatExampleXml({}), // Handle potential undefined
                                        formatExampleXml({
                                            duplicateLatest: true,
                                        }), // Handle potential undefined
                                        '',
                                        '',
                                    ),
                                },
                            ],
                        },

                        {
                            role: 'user',
                            content: formatUserMessage({
                                initialXml,
                                description,
                            }),
                        },
                    ],
                })

                let fullText = ''
                let allObjects: NewExtractedNode[] = []
                const yielder = createArrayItemsYielder<NewExtractedNode>()
                for await (const part of result.fullStream) {
                    if (part.type === 'text-delta') {
                        fullAnswer += part.textDelta
                        fullText += part.textDelta

                        allObjects = extractObjectsFromXmlContent(fullText)
                        for (const obj of yielder.yieldNewItems(allObjects)) {
                            let fullText = obj.fullItem?.newContent
                            if (fullText) {
                                words += splitIntoWords(fullText).length
                                chars += fullText.length
                            }
                            yield {
                                nodeId:
                                    obj.partialItem?.nodeId ||
                                    obj.fullItem?.nodeId ||
                                    '',
                                ...obj,
                            }
                        }
                    }
                    if (part.type === 'tool-call') {
                        yield {
                            type: 'tool-call' as const,
                            id: randomId,
                            toolName: part.toolName,
                            callId: part.toolCallId,
                            nodeIds: [],
                            ...part.args,
                        }
                        fullAnswer += '\n---\n'
                        fullAnswer += `Tool call: ${part.toolName}\n`
                        fullAnswer += `Args: ${JSON.stringify(part.args)}\n`
                        fullAnswer += '\n'
                        fullAnswer += '---\n'
                    }
                    if (part.type === 'tool-result') {
                        fullAnswer += '\nresult ---\n'
                        fullAnswer += part.result
                        fullAnswer += '\n---\n'
                    }
                }
                for (const obj of yielder.yieldRemaining()) {
                    yield {
                        nodeId:
                            obj.partialItem?.nodeId ||
                            obj.fullItem?.nodeId ||
                            '',
                        ...obj,
                    }
                }

                const [gen] = await Promise.all([
                    prisma.generation.create({
                        data: {
                            words,
                            orgId,
                            description,
                            status: request.signal.aborted
                                ? 'cancelled'
                                : 'accepted',
                            chars,
                            initialXml,
                            resultXml: fullAnswer,
                            projectName,
                            pluginName: 'llm',
                            createdAt: new Date(),
                        },
                    }),
                ])

                return { fullXml: fullText }
                // yield { type: 'fullXml' as const, fullXml: fullText }
            } finally {
                console.log(fullAnswer)
                emitter.detach()
                projectsEvents.delete(randomId)
            }
        },
        {
            body: z.object({
                projectId: z.string().optional(),
                projectName: z.string().optional(),
                randomId: z.string(),
                description: z.string(),
                tree: z.custom<FramerLayersTree>(),
            }),
        },
    )
    .get(
        '/subscriptions',
        async ({ request, state: store, query }) => {
            if (!(await store.orgId)) {
                throw unauthorizedResponse
            }
            const { projectId } = query
            const activeSub = await getLlmSub({
                orgId: await store.orgId,
                projectId,
            })

            let manageSubUrl: string | undefined
            // const activeSub = subs.find((sub) => sub)
            if (activeSub?.customerId) {
                const portalSession =
                    await stripe.billingPortal.sessions.create({
                        customer: activeSub.customerId,

                        return_url: new URL(
                            '/after-framer-payment',
                            env.PUBLIC_URL,
                        ).toString(),
                    })
                manageSubUrl = portalSession.url
            }

            return {
                subs: [activeSub],
                activeSub,
                manageSubUrl,
            }
        },
        {
            query: z.object({
                projectId: z.string(),
            }),
        },
    )

async function getLlmSub({ orgId, projectId }) {
    if (!projectId) {
        throw new Error('projectId missing, cannot get subscription')
    }
    return await prisma.subscription.findFirst({
        where: {
            orgId: orgId,
            status: {
                in: ['active', 'trialing'],
            },
            pluginName: 'llm',
            metadata: {
                path: ['projectId'],
                equals: projectId,
            },
        },
    })
}

export function nineCharsRandomString() {
    return Math.random().toString(36).substring(2, 11)
}

function formatUserMessage({ initialXml, description }) {
    return dedent`
    Here is the current Framer website xml tree, it is a subsection of a website, each node in the xml corresponds to a Framer element.

    The tags with a nodeId attribute are the ones you can modify.

    ${initialXml}


    Here is the task the user asked you to perform:
    \`\`\`
    ${description}
    \`\`\`

    First analyze and list any needed duplications or deletions.
    Then make all necessary "duplicate" and "delete" tool calls, keeping track of new nodeIds.
    Only after completing ALL structural changes, output the final xml with the updated tags.
    `
}

const addedFaqNodeId = 'Uy00EPyfT'

const exampleAddedFaqSection = `
<Faq
    nodeId="${addedFaqNodeId}"
    question="What is the pricing?"
    answer="To see the full pricing you can go to the /pricing page."
    <-- other attributes are the same, skip them -->
>
</Faq>
`

function formatExampleXml({ duplicateLatest = false }) {
    return dedent`
    <FaqDay nodeId="lBeDFDDMZ">
        <Stack nodeId="BFwoQf9Cp">
            <Faq
                nodeId="xnkzgcSiY"
                <!-- variant is of type 'Open' | 'Closed' -->
                variant="T5CrfWy_o"
                color="rgb(0, 0, 0)"
                question="What payment methods do you accept?"
                answer="We accept all major credit cards, PayPal, and various other payment methods depending on your location. Please contact our support team for more information on accepted payment methods in your region."
            >
            </Faq>
            <Faq
                nodeId="lHXf24eBJ"
                <!-- variant is of type 'Open' | 'Closed' -->
                variant="yPX8xspWY"
                color="rgb(0, 0, 0)"
                question="How does the pricing work for teams?"
                answer="Our pricing is per user, per month. This means you only pay for the number of team members you have on your account. Discounts are available for larger teams and annual subscriptions."
            >
            </Faq>
            <Faq
                nodeId="S10j0vkLp"
                <!-- variant is of type 'Open' | 'Closed' -->
                variant="yPX8xspWY"
                color="rgb(0, 0, 0)"
                question="Can I change my plan later?"
                answer="Yes, you can upgrade or downgrade your plan at any time. Changes to your plan will be prorated and reflected in your next billing cycle."
            >
            </Faq>
            ${dedent`
            <Faq
                nodeId="UyBbEMyfT"
                <!-- variant is of type 'Open' | 'Closed' -->
                variant="yPX8xspWY"
                color="rgb(0, 0, 0)"
                question="Is my data secure?"
                answer="Security is our top priority. We use state-of-the-art encryption and comply with the best industry practices to ensure that your data is stored securely and accessed only by authorized users."
            >
            </Faq>
            `
                .repeat(duplicateLatest ? 2 : 1)
                .replace('UyBbEMyfT', addedFaqNodeId)}
        </Stack>
    </FaqDay>
    `
}
