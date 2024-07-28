import { test, expect } from 'vitest'
import { processMarkdown } from './elysia-markdown-plugin'

const exampleMarkdown1 = `---
title: Example Markdown
boolean: false
---

# Example Markdown

This is an example markdown file.

    some code

> a quote

# This should not be a title

## another h2
`

const owner = 'x'
const repo = 'y'
const branch = 'z'
test('processMarkdown', async () => {
    let errors = [] as any
    const res = await processMarkdown({
        content: exampleMarkdown1,
        basePath: '/',
        pagePath: '/example',
        allAssetPaths: [],
        branch,
        owner,
        repo,
        onError: (e) => {
            errors.push(e)
        },
    })
    console.log(errors)
    expect(errors).toHaveLength(0)

    console.log(res)
    expect(res).toMatchInlineSnapshot(`
      {
        "frontMatter": {
          "boolean": false,
          "title": "Example Markdown",
        },
        "html": "<h1>Example Markdown</h1>
      <p>This is an example markdown file.</p>
      <pre><code>some code
      </code></pre>
      <blockquote>
      <p>a quote</p>
      </blockquote>
      <h1>This should not be a title</h1>
      <h2>another h2</h2>
      ",
        "pagePath": "/example",
        "slug": "/example",
        "title": "Example Markdown",
      }
    `)
    expect(res?.title).toBe('Example Markdown')
})
