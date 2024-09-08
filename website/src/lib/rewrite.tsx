import { z } from 'zod'

import { openai } from '@ai-sdk/openai'
import { CoreMessage, streamObject } from 'ai'

import { yieldNewArrayItems, yieldObjectStream } from 'website/src/lib/ndjson'

export const RewriteSchema = z.object({
    description: z.string().optional().nullable(),
    textToReplace: z.array(
        z.object({
            name: z.string().optional().nullable(),
            content: z.string().optional().nullable(),
            nodeId: z.string().optional().nullable(),
            href: z.string().optional().nullable(),
            // index: z.number(),
        }),
    ),
    sourceHtml: z.string().nullable(),
    exampleTextToMigrate: z.array(
        z.object({
            hierarchy: z.string().optional().nullable(), // for example "hero/heading" or "features/paragraph"
            content: z.string().optional().nullable(),
            href: z.string().optional().nullable(),
            // other possible fields like price for price plans, etc
        }),
    ),
})

export type RewriteSchema = z.infer<typeof RewriteSchema>

const STEP_BY_STEP_REASONING = 'stepByStepReasoning'
const CONVERTED_ITEMS = 'convertedItems'
const framerIdLen = 9

function renderHtmlSnippet(sourceHtml: string = ''): string {
    if (!sourceHtml) {
        return ''
    }
    return `
Original HTML Content from existing website, you can use this as inspiration:
\`\`\`html
${sourceHtml}
\`\`\`
`
}

let schema = z.object({
    [STEP_BY_STEP_REASONING]: z
        .array(z.string())
        .describe(
            'Chain of thoughts, think step by step. This field should come first.',
        ),
    [CONVERTED_ITEMS]: z.array(
        z.object({
            nodeId: z
                .string()
                .describe(
                    'The original node id, this field should come first.',
                ),
            previousContent: z
                .string()
                .describe(
                    'The previous content of the node, from the template, this field should come second.',
                ),
            content: z
                .string()
                .describe(
                    'The new content to apply to this node, based on user provided data and with similar length and phrasing as previous template node.',
                ),
            href: z.string().nullable().optional(),
        }),
    ),
})

function generateMigrationPrompt({
    description,
    sourceHtml = '',
    exampleTextToMigrate,
}): string {
    return `
You are an expert copywriter tasked with migrating content from one website to a new template. Your goal is to preserve the structure and feel of the template while incorporating relevant content from the website being migrated.

${convertExamplesToMarkdownList(exampleTextToMigrate)}

${renderHtmlSnippet(sourceHtml)}

Instructions:
* Replace the content of each item in the template with text that aligns with the website owner's description and the migrated website.
* Maintain similar content length and structure to the original template where appropriate.
* Preserve UI-specific text (e.g., "Accept Cookies", "Privacy Policy").
* Update href values if present and relevant to the new content.
* Use content from the website being migrated if it fits well within the template structure.
* If the migrated content doesn't fit perfectly, create new content that matches the style and intent of the website being migrated.
* remove anything related to templates or lorem ipsum, such as "Get This Template", those are default text that should not be always replaced.
* never add asterisks * at the end of the text, these would be used to add a note at the bottom of the page, but you can't add notes.
* if the text to replace contains new lines \\n or special characters you should mimic them too and try to keep the same structure

Remember:
* Aim for a similar text length to the original template items. If you can't find an example content from the examples rephrase it or invent a new one
* Ensure all items from the template are represented in the output.
* Balance between using migrated content and creating new content that fits the template and owner's description.
* Maintain the overall tone and style of the website being migrated.

Please provide a well-structured and valid JSON object as your response, adhering to the schema defined.

Provide a new text replacement for all the template text items.

Website Owner's Description and Instructions:
<description>
${description || 'No specific instructions provided'}
</description>

`
}

export function convertExamplesToMarkdownList(
    examples: RewriteSchema['exampleTextToMigrate'],
) {
    if (!examples?.length) {
        return ''
    }
    let markdown = ''

    for (let example of examples) {
        const { content, hierarchy, ...attributes } = example
        markdown += `- section ${example.hierarchy}: ${JSON.stringify(example.content)}`
        if (Object.keys(attributes).length) {
            markdown += `, attributes: ${JSON.stringify(attributes)}`
        }
        markdown += '\n'
    }

    return 'Content from Website Being Migrated:\n' + markdown
}

const ITEMS_PER_ITERATION = 25

function splitArrayInChunks(arr: any[], chunkSize: number) {
    let result = [] as any[][]
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize))
    }
    return result
}

type YieldType = ReturnType<typeof rewriteTemplateContent>

export async function* rewriteTemplateContent({
    exampleTextToMigrate,
    description,
    textToReplace: oldText = [],
    signal,
    onToken,
}: RewriteSchema & {
    signal: AbortSignal
    onToken?: (token: string) => void
}) {
    let finalObject: z.infer<typeof schema> | undefined
    let missedItems: any[] = []
    let iterationsCount = 0

    let messages: CoreMessage[] = [
        {
            role: 'user',
            content: generateMigrationPrompt({
                description,
                exampleTextToMigrate,
            }),
        },
    ]

    const chunkedOldText = splitArrayInChunks(
        oldText || [],
        ITEMS_PER_ITERATION,
    )

    while (iterationsCount < chunkedOldText.length || missedItems.length > 0) {
        console.log('iterationsCount', iterationsCount)
        let currentChunk = [] as any[]
        if (iterationsCount < chunkedOldText.length) {
            currentChunk = chunkedOldText[iterationsCount]
            console.log(`asking to convert ${currentChunk.length} items`)
            messages.push({
                role: 'user',
                content: `Please convert the following template items:\n${JSON.stringify(currentChunk, null, 2)}`,
            })
        } else if (missedItems.length > 0) {
            console.log(`asking to convert ${missedItems.length} missing items`)
            currentChunk = missedItems
            messages.push({
                role: 'user',
                content: `You missed ${missedItems.length} items, please convert these remaining template items:\n${JSON.stringify(missedItems, null, 2)}`,
            })
        } else {
            throw new Error('No more items to convert')
        }

        const stream1 = await streamObject({
            messages,
            schema,
            model: openai('gpt-4o'),
            temperature: 0.5,
            abortSignal: signal,
        })

        let objectStream = yieldNewArrayItems({
            arrayField: CONVERTED_ITEMS,

            stream: yieldObjectStream({
                stream: stream1.fullStream,
                ms: 10,
                onToken,
            }),
        })
        let lastId = ''
        for await (let { fullItem, partialItem } of objectStream) {
            if (
                partialItem?.nodeId?.length === framerIdLen &&
                partialItem?.nodeId !== lastId
            ) {
                yield {
                    nextItemId: partialItem.nodeId,
                    finalObject: undefined,
                }
                lastId = partialItem.nodeId
            }
            yield {
                partialItem: partialItem,
                finalObject: undefined,
            }
            if (fullItem) {
                // console.log('fullItem', fullItem)
                yield {
                    object: fullItem,
                    finalObject: undefined,
                }
            }
        }

        const iterationObject = await stream1.object
        if (iterationObject[STEP_BY_STEP_REASONING]) {
            console.log(
                'step by step reasoning',
                iterationObject[STEP_BY_STEP_REASONING],
            )
        }

        if (iterationObject[CONVERTED_ITEMS].length !== currentChunk.length) {
            console.log(
                `LLM returned different number of items than we asked for: ${currentChunk.length} vs ${iterationObject[CONVERTED_ITEMS].length}`,
            )
        }

        if (!finalObject) {
            finalObject = iterationObject
        } else {
            finalObject.stepByStepReasoning.push(
                ...iterationObject.stepByStepReasoning,
            )
            finalObject.convertedItems.push(...iterationObject.convertedItems)
        }

        messages.push({
            role: 'assistant',
            content: JSON.stringify(iterationObject, null, 2),
        })

        iterationsCount++

        // Update missed items
        missedItems =
            oldText?.filter(
                (oldItem) =>
                    !finalObject!.convertedItems.some(
                        (newItem) => newItem.nodeId === oldItem.nodeId,
                    ),
            ) || []
    }
}
