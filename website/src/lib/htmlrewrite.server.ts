import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'

import { generateText, streamObject } from 'ai'
import dedent from 'dedent'
import {} from 'website/src/lib/elysia.server'
import {
    removeMarkdownSnippets,
    yieldMaxEveryMs,
    yieldNewArrayItems,
    yieldObjectStream,
} from 'website/src/lib/ndjson'
import { groq } from 'website/src/lib/ssr.server'
import { z } from 'zod'

import('htmlrewriter')

export async function formatHtmlForPrompt(input: Response) {
    const { HTMLRewriter } = await import('htmlrewriter')
    const rewriter = new HTMLRewriter()

    // remove all the attributes and tags that are not useful for an AI prompt, that don't show what the website is about, like style, link, script, meta, noscript, svg, head, and footer tags

    const tagsToRemove = [
        'style',
        'link',
        'script',
        'meta',
        'noscript',
        'svg',
        'head',
        // 'head',
    ]

    const res = rewriter
        .on('*', {
            element(element) {
                if (tagsToRemove.includes(element.tagName.toLowerCase())) {
                    element.remove()
                    return
                }
                const attributesToKeep = [
                    'data-framer-name',
                    // 'class',
                    // 'id',
                    'label',
                    'title',
                    'alt',
                    'href',
                    'name',
                    'value',
                    'placeholder',
                    'type',
                    'role',
                    // 'src', // Added
                    'target', // Added
                ]
                for (const [attr] of element.attributes) {
                    if (
                        !attr.startsWith('aria-') &&
                        !attributesToKeep.includes(attr)
                    ) {
                        element.removeAttribute(attr)
                    }
                }
            },

            comments(comment) {
                comment.remove()
            },
        })
        .transform(input)
    let newHtml = await res.text()
    // remove white space
    newHtml = newHtml.replace(/\s+/gm, ' ')

    return newHtml
}

export async function fetchFormattedHtml(url) {
    const res = await fetch(url, {
        headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',

            Referer: 'https://www.google.com/',

            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        },
    })
    if (!res.ok) {
        throw new Error(
            `Could not fetch website html for ${url}, error ${res.status}`,
        )
    }
    const formattedHtml = await formatHtmlForPrompt(res)
    return formattedHtml
}

enum GetWebsiteInfoObjectFields {
    websiteDescription = 'websiteDescription',
    extractedContent = 'extractedContent',
}

export async function* getWebsiteInfo({
    html,
    signal,
    yieldEveryMs = 100,
    onToken = (x: string) => {},
}) {
    // const buffers = await splitImage({ imageBuffer: image })
    let schema = z.object({
        [GetWebsiteInfoObjectFields.websiteDescription]: z.string(),
        [GetWebsiteInfoObjectFields.extractedContent]: z.array(
            z.object({
                content: z.string(),
                hierarchy: z.string(),
                href: z.string().nullable(),
            }),
        ),
    })

    const stream1 = await streamObject({
        abortSignal: signal,
        schema,

        messages: [
            {
                role: 'user',
                content: makeExtractPrompt({ html: html }),
            },
            // {
            //     role: 'user',
            //     content: [
            //         ...buffers.map((buffer) => {
            //             return {
            //                 type: 'image' as const,
            //                 mimeType: 'image/jpeg',
            //                 image: buffer,
            //             }
            //         }),
            //     ],
            // },
        ],
        // mode: 'json',

        // model: anthropic('claude-3-sonnet-20240229'),
        // model: anthropic('claude-3-haiku-20240307'),
        model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
    })
    // Promise.resolve().then(async () => {
    //     for await (let chunk of stream.textStream) {
    //         await onToken(chunk)
    //     }
    // })

    for await (let chunk of yieldNewArrayItems({
        arrayField: GetWebsiteInfoObjectFields.extractedContent,
        stream: yieldObjectStream({ stream: stream1.fullStream, onToken }),
    })) {
        yield {
            object: chunk,
        }
    }
    let finalObject = await stream1.object

    const stream2 = await streamObject({
        abortSignal: signal,

        schema: schema
            .extend({
                reasoning: z.array(z.string()),
            })
            .pick({
                reasoning: true,
                [GetWebsiteInfoObjectFields.extractedContent]: true,
            }),

        messages: [
            {
                role: 'user',
                content: makeExtractPrompt({ html: html }),
            },
            {
                role: 'assistant',
                content: JSON.stringify(finalObject, null, 2),
            },
            {
                role: 'user',
                content: dedent`Did you extract all the content on the page?  
                Respond with a JSON object and add all the missing extracted content on the page in a "extractedContent" array field. 
                Only return new items, don't repeat the old ones. Return the "reasoning" field first to think step by step what fields are missing and why.
                `,
            },
            // {
            //     role: 'user',
            //     content: [
            //         ...buffers.map((buffer) => {
            //             return {
            //                 type: 'image' as const,
            //                 mimeType: 'image/jpeg',
            //                 image: buffer,
            //             }
            //         }),
            //     ],
            // },
        ],
        // mode: 'json',

        // model: anthropic('claude-3-sonnet-20240229'),
        // model: anthropic('claude-3-haiku-20240307'),
        model: openai('gpt-4o-mini', { structuredOutputs: true }),
        // model: anthropic('claude-3-haiku-20240307'),
    })

    for await (let chunk of yieldNewArrayItems({
        arrayField: GetWebsiteInfoObjectFields.extractedContent,
        stream: yieldObjectStream({ stream: stream2.fullStream, onToken }),
    })) {
        yield {
            object: chunk,
        }
    }
    let finalObject2 = await stream2.object

    if (finalObject2.extractedContent?.length) {
        console.log(
            `the LLM did not finish, had to run 2 times to get ${finalObject2.extractedContent.length} extracted content`,
        )
        finalObject.extractedContent.push(...finalObject2.extractedContent)
    } else {
        console.log(
            'the LLM already returned all objects on the first run',
            finalObject2.reasoning,
        )
    }

    yield { finalObject }

    // for await (let chunk of openaiRes.textStream) {
    //     console.log('chunk', JSON.stringify(chunk, null, 2))
    // }
}

export async function getWebsiteDescription({ html, signal }) {
    console.time('getWebsiteDescription ' + html.length)
    const result = await generateText({
        abortSignal: signal,
        messages: [
            {
                role: 'user',
                content: makeDescriptionPrompt({ html: html }),
            },
        ],

        // model: anthropic('claude-3-sonnet-20240229'),
        model: openai('gpt-4o'),
    })

    let extractedDescription = result.text
    extractedDescription = removeMarkdownSnippets(extractedDescription)
    console.timeEnd('getWebsiteDescription ' + html.length)
    return { extractedDescription }
}

function makeDescriptionPrompt({ html }) {
    return (
        `
I will provide you with an HTML document. Your task is to analyze the content and structure of the website and generate a concise description that includes the following information:

- Type of website (e.g., portfolio, SaaS, e-commerce, blog, etc.)
- If this is a website for a company, the company name
- If this is a website for a product, the product name
- If this is a website for a person portfolio, the person's name
- Main topic or purpose of the website
- Tone of the language used (e.g., formal, funny, colloquial, etc.)
- Language of the website (English or other)

Please provide the description in a single, concise sentence without any additional explanations or context.

The HTML document is:

` +
        '```html\n' +
        html +
        '\n```' +
        `
Generate the description now. Do not use terms like "The website is a " or "This document is about", don't add any introduction or conclusion.
`
    )
}

function makeExtractPrompt({ html }) {
    return (
        `
You are a web scraper tasked with extracting structured content from an HTML document. Your goal is to prepare this content for migration to a new website template, preserving its hierarchical structure. Follow these steps:

1. Analyze the provided HTML content and screenshot (if available).

2. Extract meaningful text content, preserving semantic structure and hierarchy.

3. For each extracted element, create a JSON object with the following structure:
    {
        "hierarchy": "string", // e.g., "hero/heading" or "features/paragraph"
        "content": "string",
        "href": "string" (optional, for links and buttons only)
    }

4. Use the "hierarchy" field to represent the nested structure of the content. Common hierarchy patterns include:

    Use the following hierarchy sections as a guide:

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

   For more specific content within sections:
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

   If a section is composed of multiple elements append the element number at the end, for example for a pricing section you could use the following hierarchy:

   - pricing/plan1/heading
   - pricing/plan1/feature1
   - pricing/plan1/feature2
   - pricing/plan2/heading
   - pricing/plan2/feature1
   - pricing/plan2/feature2

5. Ensure the hierarchy accurately reflects the document structure and content relationships. Use the image to understand the hierarchy, for example if a text is small in the screenshot don't use a heading hierarchy, but a paragraph hierarchy. Notice that each element in the hierarchy is a node in a tree-like structure, and the hierarchy itself is a tree. Some elements will have common prefix if they are part of the same section or subsection, such as "section/heading" or "section/paragraph".

6. Output the results as an object with an array field "${GetWebsiteInfoObjectFields.extractedContent}" of extracted objects.

7. Include all text content on the page, your output should include all the text content from the HTML. Don't skip any text that is in the screenshot, even if small or with low contrast. Include text that is hidden, for example text inside a FAQ accordion. Sometimes a section is hidden in the screenshot because of an appear animation, but it's still important to include the text.

8. Use the screenshot for context when determining the appropriate hierarchy and content type.

9. Do not include any explanatory text or markdown formatting in the output like \`\`\`. Only output json

HTML Content:

    ` +
        html +
        `
Here is an example output:

{
    "content": "Notaku",
    "hierarchy": "nav/logo",
    "href": "/",
}
{
    "content": "Product",
    "hierarchy": "nav/link1",
    "href": "/product/docs",
}
{
    "content": "Showcase",
    "hierarchy": "nav/link2",
    "href": "/showcase",
}
{
    "content": "Pricing",
    "hierarchy": "nav/link3",
    "href": "/#pricing",
}
{
    "content": "Turn Notion into a professional docs website",
    "hierarchy": "hero/heading",
}


also generate a short description of what the website is about and return it before the extracted content, as a string in the "${GetWebsiteInfoObjectFields.websiteDescription}" field. 
This description should include the following information:
- Type of website (e.g., portfolio, SaaS, e-commerce, blog, etc.)
- If this is a website for a company, the company name
- If this is a website for a product, the product name
- If this is a website for a person portfolio, the person's name
- Main topic or purpose of the website
- Tone of the language used (e.g., formal, funny, colloquial, etc.)
- Language of the website (English or other)


The example above only shows an example of the data format, you should try to get as many text as possible. 

RETURN ALL THE TEXT THAT IS ON THE PAGE!

DO NOT RETURN ANYTHING ELSE, ONLY JSON, DON'T START THE OUTPUT WITH ANYTHING ELSE. RETURN ONLY JSON.


    `
    )
}
