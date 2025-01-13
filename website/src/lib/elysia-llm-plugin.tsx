import { Evt } from 'evt'
import { diffJson } from 'diff'
import dedent from 'string-dedent'
import { streamText, tool } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

import { Spiceflow } from 'spiceflow'

import { prisma, ReactExportComponent } from 'db/prisma'
import Stripe from 'stripe'
import { env } from 'website/src/lib/env'
import { z } from 'zod'
import { OldTextTree } from 'website/src/lib/rewrite'
import { openai } from '@ai-sdk/openai'
import { createFallback } from 'ai-fallback'
import { oldTextTreeToXml } from 'website/src/lib/xml'
import { sleep } from 'website/src/lib/utils'
import { db } from 'db/kysely'
import { getOrgCredits } from 'website/src/lib/credits'

const unauthorizedResponse = new Response('Unauthorized', {
    status: 401,
})

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {})

type FramerEventLLM = {
    type: 'framer-update'
    tree: OldTextTree
    callId: string
} //

let projectsEvents = new Map<string, Evt<FramerEventLLM>>()

let model = createFallback({
    models: [
        anthropic('claude-3-5-haiku-latest'),
        openai('gpt-4o-mini'), //
    ],
})

export const llmPluginApp = new Spiceflow({
    basePath: '/llm',
})
    .state('orgId', '')
    .state('userId', '')

    .use(async function addGithubUserLogin({ request, state: store }) {
        const pathname = new URL(request.url).pathname
        if (!pathname.includes('/llm')) {
            return
        }
        // make publish faster
        if (pathname.includes('/publish')) {
            return
        }
        const orgId = store.orgId
        if (!orgId) {
            return
        }
        const userId = store.userId
        if (!userId) {
            return
        }
    })
    .get('/health', () => {
        return 'ok'
    })
    .post(
        '/submitReview',
        async ({ state: store, request }) => {
            const body = await request.json()

            const { stars, generationId } = body
            const userId = store.userId
            const orgId = store.orgId

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
                tree: z.custom<OldTextTree>(),
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
            const userId = store.userId
            if (!userId) {
                throw unauthorizedResponse
            }
            const credits = await getOrgCredits({ orgId: userId })

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
            request.signal.addEventListener('abort', () => {
                console.log('aborting')
            })
            const body = await request.json()
            console.log('body', body)
            const { randomId, description, tree, projectId } = body

            const initialXml = oldTextTreeToXml(tree, {
                shouldAddNodeIdAlways: true,
            })
            let fullAnswer = ''

            projectsEvents.set(randomId, new Evt())
            const emitter = projectsEvents.get(randomId)!
            try {
                const result = streamText({
                    model,
                    // toolChoice: 'required',
                    abortSignal: request.signal,
                    maxSteps: 40,
                    // experimental_toolCallStreaming: true,
                    tools: {
                        edit: tool({
                            parameters: z.object({
                                kind: z
                                    .enum(['rewrite', 'delete', 'duplicate'])
                                    .describe(
                                        'The kind of edit to make to the Framer xml document',
                                    ),
                                nodeId: z.string(),
                                newContent: z
                                    .string()
                                    .optional()
                                    .describe(
                                        'This field is only useful when kind is "rewrite", put here the new text content for the node if any. Should only be used with leaf tags.',
                                    ),
                                newAttributes: z
                                    .record(z.string(), z.string())
                                    .optional()
                                    .describe(
                                        dedent`
                                        This field is only useful when kind is "rewrite", put here the new text content for the node attributes, can be partially updated with only the attributes to update. 
                                        It's better if you do one attribute at a time instead of grouping many attributes at the same time, so the user does not need to wait too much time to see the tag changes.
                                        `,
                                    ),
                            }),
                            description: dedent`
                        Edit a tag in the Framer xml tree, you can make 3 kinds of edits:
                        - rewrite: change the text of a leaf tag
                        - delete: delete a whole subtree or leaf
                        - duplicate: clone a whole subtree or leaf whose you can later edit again with this tool

                        Notice that this tool will return the diff of the updated xml tree so you can then act on the result nodeIds

                        For example when using duplicate you can then act on the new nodeIds returned by the tool call.
                        `,

                            async execute(
                                { nodeId, kind, newContent },
                                { toolCallId },
                            ) {
                                try {
                                    console.log(`calling tool ${kind}`)

                                    console.log(
                                        `waiting for tool result ${toolCallId}: ${kind}`,
                                    )
                                    const result = await emitter.waitFor(
                                        (x) => x.callId === toolCallId,
                                        1000 * 5,
                                    )
                                    if (!result) {
                                        throw new Error(
                                            'No result found for project',
                                        )
                                    }
                                    console.log(`generating diff for ${kind}`)
                                    const { tree } = result
                                    const xml = oldTextTreeToXml(tree, {
                                        shouldAddNodeIdAlways: true,
                                    })
                                    const diff = diffJson(initialXml, xml)
                                    const diffText = diff
                                        .map((part) => {
                                            const prefix = part.added
                                                ? '+'
                                                : part.removed
                                                  ? '-'
                                                  : ' '
                                            return part.value
                                                .split('\n')
                                                .map((line) =>
                                                    line.trim()
                                                        ? prefix + ' ' + line
                                                        : line,
                                                )
                                                .join('\n')
                                        })
                                        .join('')

                                    return dedent`
                                Here is the diff of the change to the xml document:
                                
                                ${diffText}

                                Now please call the "edit" tool again if the user task is not complete.
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
                            You are an expert copywriter tasked with updating a Framer website content by mutating the website xml tree by using the "edit" tool.

                            Do not output the xml in the message. Instead, use the function "edit" and use the returned xml diff to understand the updates to the website content.

                            Before each tool call to edit reason step by step on the new changes to make.

                            After each function call, reason step by step on the changes and plan the next steps. Try to understand the changes to the xml document, what the new node ids are and what the next steps should be.

                            **Important:** You must call "edit" multiple times to accomplish complex tasks. For example:
                            - To create a node 3 times you will have to call edit with kind "duplicate" 3 times
                            - To delete a node 3 times you will have to call edit with kind "delete" 3 times  
                            - Then you will have to call edit with kind "rewrite" at least 3 times to make the cloned content unique
                            - To duplicate the last card 3 times, call "edit" with kind "duplicate" three times
                            - To rewrite content, call "edit" with kind "rewrite" as needed

                            Ensure all necessary tool calls are made to complete the user's task.
                            `,
                        },
                        {
                            role: 'user',
                            content: dedent`
                        Here is the current Framer website xml tree, it is a subsection of a website, each node in the xml corresponds to a Framer element. 

                        The tags with a nodeId attribute are the ones you can rewrite, delete or duplicate.

                        
                        ${initialXml}
                        

                        Here is the task the user asked you to perform:
                        \`\`\`
                        ${description}
                        \`\`\`

                        call edit function many times to accomplish your task
                        `,
                        },
                    ],
                })

                for await (const part of result.fullStream) {
                    if (part.type === 'text-delta') {
                        fullAnswer += part.textDelta
                    }
                    if (part.type === 'tool-call') {
                        fullAnswer += '\n---\n'

                        fullAnswer += `Tool call: ${part.toolName}\n`
                        fullAnswer += `Args: ${JSON.stringify(part.args)}\n`
                        fullAnswer += '\n'

                        fullAnswer += '---\n'
                        yield {
                            type: 'tool-call' as const,
                            id: randomId,
                            toolName: part.toolName,
                            callId: part.toolCallId,
                            ...part.args,
                        }
                    }
                    if (part.type === 'tool-result') {
                        fullAnswer += '\nresult ---\n'
                        fullAnswer += part.result
                        fullAnswer += '\n---\n'
                    }
                    // process.stdout.write('\x1Bc')
                }
            } finally {
                console.log(fullAnswer)
                emitter.detach()
                projectsEvents.delete(randomId)
            }
        },
        {
            body: z.object({
                projectId: z.string().optional(),
                randomId: z.string(),
                description: z.string(),
                tree: z.custom<OldTextTree>(),
            }),
        },
    )
    .get(
        '/subscriptions',
        async ({ request, state: store, query }) => {
            if (!store.orgId) {
                throw unauthorizedResponse
            }
            const { projectId } = query
            const activeSub = await getLlmSub({
                orgId: store.orgId,
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
