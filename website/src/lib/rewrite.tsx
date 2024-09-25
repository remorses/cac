import dedent from 'string-dedent'
import { z } from 'zod'

import { openai } from '@ai-sdk/openai'
import { CoreMessage, generateObject, streamObject } from 'ai'

import { yieldNewArrayItems, yieldObjectStream } from 'website/src/lib/ndjson'
import { bfsOldTextTree, oldTextTreeToXml } from 'website/src/lib/utils'

export type OldTextTree = Array<{
    name?: string | null
    content?: string | null
    nodeId?: string | null
    attributes?: {
        fontSize?: string
        controlKey?: string
        href?: string | null
    }
    children?: OldTextTree
    // index: number;
}>

export const RewriteSchema = z.object({
    description: z.string().optional().nullable(),
    oldText: z.custom<OldTextTree>(),
    sourceHtml: z.string().nullable(),
    url: z.string(),
})

export type RewriteSchema = z.infer<typeof RewriteSchema>

const CONVERTED_ITEMS = 'convertedItems'
const framerIdLen = 9

function renderHtmlSnippet({
    sourceHtml,
    url,
}: {
    sourceHtml: string
    url
}): string {
    if (!sourceHtml) {
        console.warn('no sourceHtml provided')
        return ''
    }

    return dedent`
    Original HTML Content from existing website being migrated, with url "${url}":
    
    ${sourceHtml}
    

    if the html has duplicate elements because of hidden variants you can ignore those parts, it isn't actually duplicated content, the user never wants duplicated content.

    try to use the exact same content as the original website HTML, only change if the content length is vastly different, in that case you can add new content or remove it, as a last resort you can even rephrase the content to match the template length.

    If the website has headings such as h1 and h2, try to reuse them, don't invent new content for these parts of the website.

    for example if a website has the following html: <h1>More than a website builder</h1> in the hero section you should use "More than a website builder" exactly for the hero heading too.

    Even for the rest of the website, try to keep the generated content as close as possible to the HTML of the original website.

    never repeat content, if 2 items appear to have the same content, try to find the right element from the HTML and use that instead. For example typically under the hero section there is a description/subheading, you should use that instead of the heading again.

    `
}

let schema = z.object({
    // [STEP_BY_STEP_REASONING]: z
    //     .array(z.string())
    //     .describe(
    //         'Chain of thoughts, think step by step. This field should come first.',
    //     ),
    [CONVERTED_ITEMS]: z.array(
        z.object({
            nodeId: z
                .string()
                .describe(
                    'The template text node id, this field should come first.',
                ),
            // htmlTag: z
            //     .string()
            //     .describe(
            //         'The html tag of the node, helpful to understand which part of the original HTML should be used. this field should come second.',
            //     ),

            // templateContent: z
            //     .string()
            //     .describe(
            //         'The template content we are replacing. should be different from `contentFromTheHtml`, this field should come second',
            //     ),
            // contentFromTheHtml: z
            //     .string()
            //     .nullable()
            //     .describe(
            //         'The content that best corresponds to this template text, from the website being migrated, extracted from the HTML, without any modification. this field should come third',
            //     ),
            reasoning: z.string().describe(
                dedent`
                Think step by step to decide which should be the new content for the template text with this nodeId. 

                In this field you should always respond to these questions:
                - **section and role**: what is the text semantic meaning for this template text? ignore its subject, just consider the section and design language/role (for example main hero heading, hero subheading, feature list item, footer link, etc. ignore the subject of the text, you should only consider its semantic position in the template) 
                - **existing text**: What is the best piece of text from the existing website HTML you can use here? don't return text that you already used previously. It should have same design language and role, for example if the template text is an hero heading, you should use site main h1 heading. Don't consider text that is from different kind of elements. NEVER REPEAT CONTENT.
                - **length**: Is the content length too different? If yes you may have to rephrase it a bit, otherwise just return the existing website text.

                Some examples of semantic meaning for sections of the template:
                - nav (Navigation menu or links at the top of the page)
                - footer (Section at the bottom with links, company info, and copyright notice)
                - hero (Large, prominent section at the top with headline and call-to-action)
                - features (Highlights of key product/service features)
                - testimonial (Customer reviews or quotes)
                - pricing (Pricing plans or tables)
                - team (Team member profiles or information)
                - stats (Key metrics or statistical information)
                - steps (Numbered process or instruction steps)
                - faq (Frequently asked questions and answers)
                - contact (Contact form or contact information)
                - newsletter (Email signup form)
                - content (General content sections, such as blog posts, articles, or news)
                - breadcrumbs (Navigation aid showing the page's location in the site hierarchy)

                Each text in the template and website is part of a section and it also has a more fine grained role, for example:
                - [section]/heading (Main title or subtitle within a section)
                - [section]/subheading (Secondary title or subtitle within a section)
                - [section]/quote (text referencing a quote from a testimonial or customer review)
                - [section]/paragraph (Block of text content)
                - [section]/link (Clickable text or button leading to another page)
                - [section]/list/item (Individual item within a bulleted or numbered list)
                - [section]/table/row (A row of data within a table structure)
                - [section]/image (Visual element or photograph)
                - [section]/button (Clickable element for user actions)
                - [section]/form/input (Text input field within a form)
                - [section]/form/select (Dropdown selection menu within a form)
                - [section]/form/checkbox (Checkable option within a form)
                - [section]/form/radio (Single-select option within a form)
                - [section]/icon (Small graphical element, often used with features or stats)

                You should use these as a guide to decide the semantic meaning of each text.

                
                `,
            ),
            newContent: z
                .string()
                .describe(
                    'The new content to apply, should be extracted from the existing website html if possible, only modify to match the template length',
                ),
            // href: z
            //     .string()
            //     .nullable()
            //     .describe(
            //         'The href from the original HTML if relevant, should always have the url protocol, such as https://. Ignore all relative links, you should return an href only if it redirects to another website like twitter.com, facebook.com, etc.',
            //     ),
        }),
    ),
})

function generateMigrationPrompt({
    description,
    sourceHtml,

    url,
}): string {
    return `
You are an expert copywriter tasked with migrating content from one website to a new template. Your goal is to preserve the structure and feel of the template while incorporating relevant content from the website being migrated.


${renderHtmlSnippet({ sourceHtml, url })}

Instructions:
* Replace the content of each item in the template with text from the original HTML that aligns with the website owner's description and the migrated website.
* Maintain similar content length and structure as the original template where appropriate, for example understand when an item is an heading, subheading, paragraph, bullet point, etc.
* Preserve UI-specific text (e.g., "Accept Cookies", "Privacy Policy").
* Use content from the website HTML being migrated 
* as a last resort, If the migrated content doesn't fit, create new content that matches the style and intent of the website being migrated.
* never use anything related to templates or lorem ipsum, such as "Get This Template", those are default text that should be always replaced.
* never add asterisks * at the end of the text, these would be used to add a note at the bottom of the page, but you can't add notes.
* if the template text contains new lines \\n or special characters you should mimic them too and try to keep the same structure


Remember:
* Aim for a similar text length as the original template items. If you can't find an example content from the examples you can invent new one
* Ensure all items from the template are represented in the output.
* Maintain the overall tone and style of the website being migrated.
* never repeat content, always find different elements from the original HTML or generate new ones

Please provide a well-structured and valid JSON object as your response, adhering to the schema defined.

Provide a new text replacement for all the template text items.

Website Owner's Description and Instructions:
<description>
${description || 'No specific instructions provided'}
</description>

`
}

export const ITEMS_PER_ITERATION = 30

function findFirstChildrenLayer(tree: OldTextTree): {
    layer: OldTextTree
    parents: OldTextTree
} {
    let currentLayer = tree
    let parents: OldTextTree = []
    while (currentLayer.length === 1 && currentLayer[0].children?.length) {
        parents.push({ ...currentLayer[0], children: [] })
        currentLayer = currentLayer[0].children
    }
    return { layer: currentLayer, parents }
}

export function splitTreeInChunks(
    tree: OldTextTree,
    maxChunkTreeSize: number = ITEMS_PER_ITERATION,
): OldTextTree[] {
    let result: OldTextTree[] = []
    let buffer: OldTextTree = []

    // Find the first layer with more than one child
    const { layer: currentLayer, parents } = findFirstChildrenLayer(tree)

    for (const node of currentLayer) {
        const nodes = bfsOldTextTree([...buffer, node])

        if (nodes.length >= maxChunkTreeSize) {
            const chunk = createChunkWithParents(parents, [...buffer, node])
            result.push(chunk)
            buffer = []
        } else {
            // Add to buffer
            buffer.push(node)
        }
    }

    // Add remaining buffer as a chunk if not empty
    if (buffer.length > 0) {
        const chunk = createChunkWithParents(parents, buffer)
        result.push(chunk)
    }

    return result
}

function createChunkWithParents(
    parents: OldTextTree,
    children: OldTextTree,
): OldTextTree {
    if (parents.length === 0) {
        return children
    }

    let currentParent = { ...parents[parents.length - 1], children }
    for (let i = parents.length - 2; i >= 0; i--) {
        currentParent = { ...parents[i], children: [currentParent] }
    }
    return [currentParent]
}

export async function* rewriteTemplateChunk({
    description,
    xml,
    signal,
    onToken,
    sourceHtml,
    url,
}: {
    description?: string
    xml: string
    signal: AbortSignal
    onToken?: (token: string) => void
    sourceHtml?: string
    url: string
}) {
    let messages: CoreMessage[] = [
        {
            role: 'system',
            content: generateMigrationPrompt({
                description,
                sourceHtml,
                url,
            }),
        },
    ]

    console.log(xml)
    messages.push({
        role: 'user',
        content: dedent`
        Please convert the following template section:
        <template>
        ${xml}
        </template>

        you should always try to replace the content of the template with the ones in the website HTML being migrated
        `,
    })

    const model = openai('gpt-4o-2024-08-06', { structuredOutputs: true })
    const stream1 = await streamObject({
        messages,
        schema,
        model,
        temperature: 0.5,
        abortSignal: signal,
    })

    let objectStream = yieldNewArrayItems({
        arrayField: CONVERTED_ITEMS,
        stream: yieldObjectStream({
            stream: stream1.fullStream,
            ms: 200,
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
        if (partialItem?.nodeId?.length === framerIdLen) {
            yield {
                partialItem: partialItem,
                finalObject: undefined,
            }
        }
        if (fullItem) {
            // console.log('rewrite item', fullItem)
            // yield {
            //     partialItem: fullItem,
            //     finalObject: undefined,
            // }
            yield {
                object: fullItem,
                finalObject: undefined,
            }
        }
    }

    const iterationObject = await stream1.object

    return iterationObject
}

export async function* rewriteTemplateContent({
    description,
    oldText = [],
    signal,
    onToken,
    sourceHtml,
    url,
}: RewriteSchema & {
    signal: AbortSignal
    onToken?: (token: string) => void
}) {
    let finalObject: z.infer<typeof schema> | undefined

    const chunkedOldText = splitTreeInChunks(oldText || [], ITEMS_PER_ITERATION)

    for (let i = 0; i < chunkedOldText.length; i++) {
        console.log('iterationsCount', i)
        const chunk = chunkedOldText[i]

        console.log(`asking to convert ${chunk.length} items`)
        const xml = oldTextTreeToXml(chunk)
        const iterationObject = yield* rewriteTemplateChunk({
            description: description || undefined,
            xml,
            signal,
            onToken,
            sourceHtml: sourceHtml || undefined,
            url,
        })

        if (!finalObject) {
            finalObject = iterationObject
        } else {
            finalObject.convertedItems.push(...iterationObject.convertedItems)
        }
    }

    return finalObject
}

export async function extractExternalLinks({
    websiteUrl,
    formattedHtml,
    oldText,
}: {
    websiteUrl: string
    formattedHtml?: string
    oldText?: OldTextTree
}): Promise<z.infer<typeof LinksSchema>> {
    if (!formattedHtml) {
        return []
    }

    if (!oldText?.length) {
        return []
    }

    oldText = structuredClone(
        oldText.filter((node) => {
            return bfsOldTextTree([node]).some(
                (child) => child.attributes?.href !== undefined,
            )
        }),
    )

    // remove node ids if node has no href, this makes it easier for the LLM to remember node ids
    const allNodes = bfsOldTextTree(oldText)
    for (let node of allNodes) {
        if (!node.attributes?.href) {
            delete node.nodeId
        }
    }

    if (!oldText.length) {
        return []
    }

    const prompt = createExtractLinksPrompt({
        websiteUrl,
        formattedHtml,
        oldText,
    })

    const res = await generateObject({
        model: openai('gpt-4o-2024-08-06', {
            structuredOutputs: true,
        }),
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
        schema: LinksSchema,
    })

    const extractedLinks = await res.object

    return extractedLinks
}

const LinkSchema = z.object({
    nodeId: z.string().describe('The nodeId of the link'),
    reasoning: z.string().describe(
        dedent`
            A detailed reasoning to decide the new url for the link, extracted from the HTML document anchor tags, it should always answer the following questions:
            - *section and role*: what is the section of the document the link is part of? for example footer link, a header nav, a feature link item, etc.
            - *where does the link redirect to and why*: what is the goal of the link content? what is this link redirecting to and what it's for?
            `,
    ),
    newHref: z
        .string()
        .url()
        .describe(
            'The external full URL of the link, should come from the HTML document',
        ),
    // newContent: z
    //     .string()
    //     .describe('The visible text content of the link, in text format'),
    shouldOpenInNewTab: z
        .boolean()
        .describe(
            'Whether the link is set to open in a new tab (true) or not (false), based on the target _blank attribute',
        ),
})

const LinksSchema = z.array(LinkSchema)

export function createExtractLinksPrompt({
    websiteUrl,
    formattedHtml,
    oldText,
}: {
    websiteUrl: string
    formattedHtml: string
    oldText: OldTextTree
}): string {
    const xml = oldTextTreeToXml(oldText)
    console.log(xml)
    return `
Extract all external links from the HTML document. Only include links that redirect to websites different from ${websiteUrl}.

This is the HTML document for the url ${websiteUrl}:

${formattedHtml}

This is the template content in xml format, you need to return new links for these templates that have links, using their nodeId 

<template>
${xml}
</template>


Only return external links, not relative links or links with ${websiteUrl} as base url.

Return all anchor tags links in the document
`
}
