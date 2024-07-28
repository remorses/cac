import { test, expect } from 'vitest'
import { processMarkdown } from './elysia-markdown-plugin'

const exampleMarkdown1 = `---
title: Example Markdown
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
})
