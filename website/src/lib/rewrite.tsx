import { createFallback } from 'ai-fallback'
import dedent from 'string-dedent'
import { DOMParser, XMLSerializer } from 'xmldom'

import { z } from 'zod'

import { openai } from '@ai-sdk/openai'
import { CoreMessage, generateObject, smoothStream, streamText } from 'ai'

import { anthropic } from '@ai-sdk/anthropic'
import { createArrayItemsYielder } from 'website/src/lib/ndjson'
import { oldTextTreeToXml, safeUrl } from 'website/src/lib/utils'
import { addNodeCount, extractObjectsFromXmlContent } from 'website/src/lib/xml'

export const ITEMS_PER_ITERATION = 30

export type OldTextTree = Array<{
    name?: string | null
    content?: string | null
    nodeId?: string | null
    attributes?: {
        fontSize?: string
        href?: string | null
        [key: string]: any
    }
    children?: OldTextTree
    count?: number
    // index: number;
}>

export const RewriteSchema = z.object({
    description: z.string().optional().nullable(),
    oldText: z.custom<OldTextTree>(),
    sourceHtml: z.string().nullable(),
    url: z.string(),
    projectName: z.string().optional(),
    pagePath: z.string().optional(),
})

export type RewriteSchema = z.infer<typeof RewriteSchema>

const model = createFallback({
    models: [
        anthropic('claude-3-5-haiku-20241022'),
        openai('gpt-4o'), //
    ],
})

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

const reasoningPrompt = `

Before each replacement please add an XML comment (with <!-- and -->) to reason step by step how you decided to replace the content

In this comment you should always respond to these questions:
- **section and role**: what is the text semantic meaning for this template text? ignore its subject, just consider the section and design language/role (for example main hero heading, hero subheading, feature list item, footer link, etc. ignore the subject of the text, you should only consider its semantic position in the template) 
- **existing text**: What is the best piece of text from the existing website HTML you can use here? don't return text that you returned previously or already in the template! It should have same design language and role, for example if the template text is an hero heading, you should use site main h1 heading. Don't consider text that is from different kind of elements. NEVER RETURN PREVIOUSLY RETURNED CONTENT.
- **length**: Is the content characters length different? If yes you may have to rephrase it, otherwise just return the existing website text.

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
`

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

Provide a new text replacement for ALL the template text items.


Please return XML with the same template structure but with the content rewritten to match the new website.

${reasoningPrompt}

These are the website Owner's Description and Instructions:
<description>
${description || 'No specific instructions provided'}
</description>



`
}
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

type NewNode = {
    nodeId: string
    newContent?: string
}

const templateText = ({ xml }) => {
    return dedent`
    Please migrate the following template section:
    <template>
    ${xml}
    </template>

    you should always try to replace the content of the template with the ones in the website HTML being migrated or create new content

    Before each replacement please add a comment to reason step by step how you decided to replace the content

    Do not write anything after the code snippet, if you want to reason about the migration do it before or inside xml comments.
    `
}

const examples = ({ host }) => [
    {
        input: dedent`
        <Node>
            <Title nodeId="abc123xyz">
            Welcome to template.com!
            </Title>
        </Node>
        `,
        output: dedent`
        \`\`\`xml
        <Node>
            <!-- replaced 'template.com' with the actual website host -->
            <Title nodeId="abc123xyz">
            Welcome to ${host}
            </Title>
        </Node>
        \`\`\`
        `,
    },
]

export async function* rewriteTemplateChunk({
    description,
    xml,
    signal,
    onToken,
    sourceHtml,
    url,
    user,
}: {
    description?: string
    xml: string
    signal: AbortSignal
    onToken?: (token: string) => void
    sourceHtml?: string
    url: string
    user: string
}) {
    const host = safeUrl(url || 'http://nourlgivenbyuser.com')?.host || url
    let messages: CoreMessage[] = [
        {
            role: 'system',
            content: generateMigrationPrompt({
                description,
                sourceHtml,
                url,
            }),
            experimental_providerMetadata: {
                anthropic: {
                    cache_control: {
                        type: 'ephemeral',
                    },
                },
            },
        },

        ...examples({ host }).flatMap(({ input, output }) => {
            return [
                {
                    role: 'user' as const,
                    content: templateText({ xml: input }),
                },
                {
                    role: 'assistant' as const,
                    content: output,
                },
            ]
        }),
        {
            role: 'user',
            content: templateText({ xml }),
        },
    ]

    const stream1 = await streamText({
        messages,
        model,
        temperature: 0.5,
        experimental_transform: smoothStream({
            chunking: 'line',
        }),
        // frequencyPenalty: 0.8,
        abortSignal: signal,
    })

    let fullText = ''
    let allObjects: NewNode[] = []
    const yielder = createArrayItemsYielder<NewNode>()
    for await (let textDelta of stream1.textStream) {
        onToken?.(textDelta)
        fullText += textDelta
        allObjects = extractObjectsFromXmlContent(fullText)
        yield* yielder.yieldNewItems(allObjects)
    }
    yield* yielder.yieldRemaining()

    yield { type: 'fullXml' as const, fullXml: fullText }

    return allObjects
}

export function mergeCloseChunks(
    chunks: OldTextTree[],
    maxSize: number,
): OldTextTree[] {
    // If we have 1 or fewer chunks, just return them as-is
    if (chunks.length <= 1) {
        return chunks
    }

    const result: OldTextTree[] = []
    let currentChunk = chunks[0]

    // Iterate through chunks starting from the second one
    for (let i = 1; i < chunks.length; i++) {
        const nextChunk = chunks[i]
        const combinedSize =
            getChunkSize(currentChunk) + getChunkSize(nextChunk)

        // If combining the chunks would exceed maxSize,
        // add current chunk to result and start new chunk
        if (combinedSize > maxSize) {
            result.push(currentChunk)
            currentChunk = nextChunk
        } else {
            // Merge the chunks by concatenating their arrays
            currentChunk = [...currentChunk, ...nextChunk]
        }
    }

    // Don't forget to add the last chunk
    result.push(currentChunk)

    return result
}
export function mergeChunksTooSmall(
    chunks: OldTextTree[],
    maxSize: number,
): OldTextTree[] {
    // If we have 1 or fewer chunks, just return them as-is
    if (chunks.length <= 1) {
        return chunks
    }

    const minSize = maxSize / 2
    let result = [...chunks]

    // Keep merging small chunks until no more merges are possible
    let madeChanges = true
    while (madeChanges) {
        madeChanges = false

        // Find first small chunk that can be merged
        for (let i = 0; i < result.length; i++) {
            const currentSize = getChunkSize(result[i])

            if (currentSize < minSize) {
                // Get sizes of previous and next chunks if they exist
                const prevSize = i > 0 ? getChunkSize(result[i - 1]) : Infinity
                const nextSize =
                    i < result.length - 1
                        ? getChunkSize(result[i + 1])
                        : Infinity

                // Determine which neighbor is smaller
                if (prevSize <= nextSize && i > 0) {
                    // Merge with previous chunk
                    const combinedSize = currentSize + prevSize
                    if (combinedSize < maxSize) {
                        result[i - 1] = [...result[i - 1], ...result[i]]
                        result.splice(i, 1)
                        madeChanges = true
                        break
                    }
                } else if (i < result.length - 1) {
                    // Merge with next chunk
                    const combinedSize = currentSize + nextSize
                    if (combinedSize < maxSize) {
                        result[i] = [...result[i], ...result[i + 1]]
                        result.splice(i + 1, 1)
                        madeChanges = true
                        break
                    }
                }
            }
        }
    }

    return result
}

// Helper function to calculate total size of a chunk
function getChunkSize(chunk: OldTextTree): number {
    return chunk.reduce((sum, node) => sum + (node.count || 0), 0)
}

export function splitTreeInChunks(
    tree: OldTextTree,
    maxChunkTreeSize: number = ITEMS_PER_ITERATION,
): OldTextTree[] {
    addNodeCount(tree)
    const chunks = splitTreeInChunksRecursive(tree, maxChunkTreeSize, [])
    let prevLength = -1
    let currentChunks = chunks
    while (currentChunks.length !== prevLength) {
        prevLength = currentChunks.length
        currentChunks = mergeCloseChunks(currentChunks, maxChunkTreeSize)
    }
    currentChunks = mergeChunksTooSmall(currentChunks, maxChunkTreeSize * 1.2)
    return currentChunks
}

function splitTreeInChunksRecursive(
    tree: OldTextTree,
    maxChunkTreeSize: number,
    initialParents: OldTextTree,
): OldTextTree[] {
    let result: OldTextTree[] = []

    // Find the first layer with more than one child
    const { layer: currentLayer, parents } = findFirstChildrenLayer(tree)

    const allParents = [...initialParents, ...parents]
    for (const node of currentLayer) {
        if (node.count! <= maxChunkTreeSize) {
            const chunk = createChunkWithParents(allParents, [node])
            result.push(chunk)
        } else {
            result.push(
                ...splitTreeInChunksRecursive(
                    [node],
                    maxChunkTreeSize,
                    allParents,
                ),
            )
        }
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
    return addNodeCount([currentParent])
}
export async function* rewriteTemplateContent({
    description,
    oldText = [],
    signal,
    onToken,
    sourceHtml,
    url,
    user,
}: RewriteSchema & {
    user: string
    signal: AbortSignal
    onToken?: (token: string) => void
}) {
    let finalObject: NewNode[] | undefined

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
            user,
            url,
        })

        if (!finalObject) {
            finalObject = iterationObject
        } else {
            finalObject.push(...iterationObject)
        }
    }

    return finalObject
}

export async function extractExternalLinks({
    websiteUrl,
    formattedHtml,
    xml,
    user,
}: {
    websiteUrl: string
    formattedHtml?: string
    xml: string
    user: string
}) {
    if (!formattedHtml) {
        return
    }

    if (!xml?.length) {
        return
    }

    // remove node ids if node has no href, this makes it easier for the LLM to remember node ids
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'text/xml')
    const allNodes = xmlDoc.getElementsByTagName('*')

    for (let i = 0; i < allNodes.length; i++) {
        const node = allNodes[i]
        if (!node.getAttribute('href')) {
            node.removeAttribute('nodeId')
        }
    }
    const serializer = new XMLSerializer()

    xml = serializer.serializeToString(xmlDoc)

    const prompt = createExtractLinksPrompt({
        websiteUrl,
        formattedHtml,
        xml,
    })

    const res = await generateObject({
        model: openai('gpt-4o-2024-08-06', {
            structuredOutputs: true,
            user,
        }),
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
        schema: LinkSchema,
    })

    const extractedLinks = await res.object

    return extractedLinks?.links
}

const LinkSchema = z.object({
    links: z.array(
        z.object({
            nodeId: z
                .string()
                .describe(
                    "The nodeId of the text element, it is always a 9 letters string, you can find it in the nodeId attribute in the template xml, not all elements have it, you have to skip those that don't have it",
                ),
            reasoning: z.string().describe(
                dedent`
            A detailed reasoning to decide the new url for the link, extracted from the HTML document anchor tags, it should always answer the following questions:
            - *section and role*: what is the section of the document the link is part of? for example footer link, a header nav, a feature link item, etc.
            - *where does the link redirect to and why*: what is the goal of the link content? what is this link redirecting to and what it's for?
            `,
            ),
            newHref: z
                .string()
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
        }),
    ),
})

export function createExtractLinksPrompt({
    websiteUrl,
    formattedHtml,
    xml,
}: {
    websiteUrl: string
    formattedHtml: string
    xml
}): string {
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
