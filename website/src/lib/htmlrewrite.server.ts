import { createOpenAI, openai } from '@ai-sdk/openai'
import { Static, t } from 'elysia'
import { anthropic } from '@ai-sdk/anthropic'

import { z } from 'zod'

import { streamObject, streamText } from 'ai'
import { HTMLRewriter } from 'htmlrewriter'
import { getScreenshotUrl, screenshot } from 'website/src/lib/ssr.server'
import { env } from 'website/src/lib/env'
import { NDJSONStream, RephraseSchema } from 'website/src/lib/elysia.server'

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: env.GROQ_API_KEY,
})
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

async function fetchHtml(url) {
    const res = await fetch(url, {
        headers: {
            accept: 'text/html',
            agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        },
    })
    const formattedHtml = await formatHtmlForPrompt(res)
    return formattedHtml
}

export async function getWebsiteInfo({ url, signal, onObject }) {
    const [formattedHtml, { imageUrl }] = await Promise.all([
        fetchHtml(url),
        screenshot(url),
    ])
    const stream = await streamText({
        abortSignal: signal,
        messages: [
            {
                role: 'user',
                content: makePrompt({ html: formattedHtml }),
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'image',
                        image: imageUrl,
                    },
                ],
            },
        ],

        // model: anthropic('claude-3-sonnet-20240229'),
        model: openai('gpt-4o'),
    })
    let objects = [] as RephraseSchema['exampleTextToMigrate']
    for await (let object of NDJSONStream({
        stream,
        // onToken,
    })) {
        await onObject(object)
        objects.push(object)
    }
    return objects
    // for await (let chunk of openaiRes.textStream) {
    //     console.log('chunk', JSON.stringify(chunk, null, 2))
    // }
}

function makePrompt({ html }) {
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

6. Output the results as NDJSON (newline-delimited JSON objects).

7. Include all text content on the page, your output should include all the text content from the HTML. Don't skip any text that is in the screenshot, even if small or with low contrast. Include text that is hidden, for example text inside a FAQ accordion. Sometimes a section is hidden in the screenshot because of an appear animation, but it's still important to include the text.

8. Use the screenshot for context when determining the appropriate hierarchy and content type.

9. Do not include any explanatory text or markdown formatting in the output like \`\`\`. Only output the NDJSON objects so i can easily parse the results.

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

You can use comments starting with // in the NDJSON output to think about the hierarchy and content and write more sophisticated and precise hierarchies.

The example above only shows an example of the data format, you should try to get as many text as possible.Notice there is no markdown formatting, only NDJSON, with each JSON object on a new line:

    `
    )
}
