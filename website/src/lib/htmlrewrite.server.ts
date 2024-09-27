import { openai } from '@ai-sdk/openai'

import { generateText, streamObject } from 'ai'
import dedent from 'dedent'
import {} from 'website/src/lib/elysia.server'
import {
    removeMarkdownSnippets,
    yieldNewArrayItems,
    yieldObjectStream,
} from 'website/src/lib/ndjson'
import { z } from 'zod'

export async function formatHtmlForPrompt(
    input: Response,
    HTMLRewriter_?: typeof import('htmlrewriter').HTMLRewriter,
) {
    let HTMLRewriter = HTMLRewriter_
    if (!HTMLRewriter) {
        console.log('importing htmlrewriter')
        HTMLRewriter = await import('htmlrewriter').then((x) => x.HTMLRewriter)
    }

    const rewriter = new HTMLRewriter!()

    // remove all the attributes and tags that are not useful for an AI prompt, that don't show what the website is about, like style, link, script, meta, noscript, svg, head, and footer tags

    const tagsToRemove = [
        'hint',
        'style',
        'link',
        'script',
        'meta',
        'noscript',
        'svg',
        'head',
        // 'head',
    ]
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
        'checked',
        'placeholder',
        'type',
        'role',
        // 'src',
        'target',
        'data-llm-id',
        'vimium-label',
    ]

    const res = rewriter
        .on('*', {
            element(element) {
                if (tagsToRemove.includes(element.tagName.toLowerCase())) {
                    element.remove()
                    return
                }

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
    if (!url) {
        return ''
    }
    console.time(`fetchFormattedHtml: ${url}`)
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
        console.timeEnd(`fetchFormattedHtml: ${url}`)
        throw new Error(`Could not fetch html for ${url}, error ${res.status}`)
    }
    console.time(`formatHtmlForPrompt: ${url}`)
    const formattedHtml = await formatHtmlForPrompt(res)
    console.timeEnd(`formatHtmlForPrompt: ${url}`)
    console.timeEnd(`fetchFormattedHtml: ${url}`)
    return formattedHtml
}

export async function getWebsiteDescription({ html, user, url, signal }) {
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
        model: openai('gpt-4o-mini', { user }),
    })

    let extractedDescription = result.text
    extractedDescription = removeMarkdownSnippets(extractedDescription)
    if (!extractedDescription) {
        console.log('no description found using LLM')
    }
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

Be as short as possible, no more than 50 words, use simple sentences separated by commas or periods. Don't use : or ; or any other punctuation.


An example output for Twitter is: Social network website and app  called Twitter to share short messages. Friendly tone. Stay connected with friends and world news.
`
    )
}
