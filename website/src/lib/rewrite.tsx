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

function generateMigrationPrompt({
    description,
    exampleTextToMigrate,
}): string {
    return `
You are an AI assistant tasked with migrating content from one website to a new template. Your goal is to preserve the structure and feel of the template while incorporating relevant content from the website being migrated.

Website Owner's Description and Instructions:
\`\`\`
${description || 'No specific instructions provided'}
\`\`\`

Content from Website Being Migrated:
${convertExamplesToMarkdownList(exampleTextToMigrate)}

Instructions:
* Replace the content of each item in the template with text that aligns with the website owner's description and the migrated content.
* Maintain similar content length and structure to the original template where appropriate.
* Preserve UI-specific text (e.g., "Accept Cookies", "Privacy Policy").
* Update href values if present and relevant to the new content.
* Use content from the website being migrated if it fits well within the template structure.
* If the migrated content doesn't fit perfectly, create new content that matches the style and intent of the website being migrated.

Output: Provide a JSON object with two main fields:

* "${RephraseObjectFields.stepByStepReasoning}": An array of strings explaining your thought process for converting the text, what the new website should look like, and why.

* "${RephraseObjectFields.convertedItems}": An array of objects, each representing a piece of content from the template that has been updated. Each object should include:
  - "previousContent": The content from the template now being replaced, this field should come first in the object
  - "content": The new or migrated content, should have similar length to the template content
  - "nodeId": The identifier from the original template item
  - "href": Updated link if applicable (optional)

Remember:
* Aim for a similar text length to the original template items. If you can't find an example content from the examples rephrase it or invent a new one
* Ensure all items from the template are represented in the output.
* Balance between using migrated content and creating new content that fits the template and owner's description.
* Maintain the overall tone and style of the website being migrated.

Please provide a well-structured and valid JSON object as your response, adhering to the schema defined.

Provide a new text replacement for all the current template text items.

"${RephraseObjectFields.stepByStepReasoning}" should come before "${RephraseObjectFields.convertedItems}" in the JSON object.

`
}

export function convertExamplesToMarkdownList(
    examples: RewriteSchema['exampleTextToMigrate'],
) {
    if (!examples?.length) {
        return 'No example content provided'
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
    return markdown
}

enum RephraseObjectFields {
    convertedItems = 'convertedItems',
    stepByStepReasoning = 'stepByStepReasoning',
}

const ITEMS_PER_ITERATION = 25

function splitArrayInChunks(arr: any[], chunkSize: number) {
    let result = [] as any[][]
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize))
    }
    return result
}

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
    let schema = z.object({
        [RephraseObjectFields.stepByStepReasoning]: z.array(z.string()),
        [RephraseObjectFields.convertedItems]: z.array(
            z.object({
                content: z.string(),
                nodeId: z.string(),
                href: z.string().nullable().optional(),
            }),
        ),
    })

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
            arrayField: RephraseObjectFields.convertedItems,
            stream: yieldObjectStream({
                stream: stream1.fullStream,
                ms: 700,
                onToken,
            }),
        })

        for await (let object of objectStream) {
            yield {
                object: object,
            }
        }

        const iterationObject = await stream1.object

        if (
            iterationObject[RephraseObjectFields.convertedItems].length !==
            currentChunk.length
        ) {
            console.log(
                `LLM returned different number of items than we asked for: ${currentChunk.length} vs ${iterationObject[RephraseObjectFields.convertedItems].length}`,
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

    yield {
        finalObject,
    }
}
