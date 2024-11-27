import { test, expect } from 'vitest'
import { processHtml } from './elysia-markdown-plugin'
import {
    checkGitHubIsInstalled,
    getOctokit,
} from 'website/src/lib/github.server'
import { prisma } from 'db/prisma'
import { env } from 'website/src/lib/env'
import { markdownToHtml } from 'website/src/lib/mdx'

test('checkGitHubIsInstalled', async () => {
    const installation = await prisma.githubInstallation.findFirst({
        where: {
            accountLogin: 'remorses',
            appId: env.GITHUB_APP_ID,
        },
    })
    if (!installation) {
        console.error('No installation found')
        return
    }
    const installationId = installation.installationId
    const res = await checkGitHubIsInstalled({ installationId })
})
test('members', async () => {
    const installation = await prisma.githubInstallation.findFirst({
        where: {
            accountLogin: 'holocron-hq',
            appId: env.GITHUB_APP_ID,
        },
    })
    if (!installation) {
        throw new Error('No installation found')
    }
    const installationId = installation.installationId
    const octokit = await getOctokit({ installationId })

    console.log(installation)
    const res = await octokit.rest.orgs.listMembers({
        org: installation.accountLogin,
    })
    console.log(res.data)
})

const exampleMarkdown1 = `---
title: Example Markdown
boolean: false
---

# Example Markdown

This is an example markdown file.

    some code

> a quote

# This should not be a title

![Example Image](/example-image.png)

![A missing relative image](./images/missing.png)

![An internet image](https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=1000)



## another h2

# @elysiajs/eden
Fully type-safe Spiceflow client refers to the [documentation](https://elysiajs.com/eden/overview)


## Example
\`\`\`typescript
// server.ts
import { Spiceflow, t } from 'spiceflow'

const app = new Spiceflow()
    .get('/', () => 'Hi Spiceflow')
    .get('/id/:id', ({ params: { id } }) => id)
    .post('/mirror', ({ body }) => body, {
        schema: {
            body: t.Object({
                id: t.Number(),
                name: t.String()
            })
        }
    })
    .listen(8080)

\`\`\`
`

const owner = 'x'
const repo = 'y'
const branch = 'z'


test('processHtml mdx', async () => {
    const { html } = await markdownToHtml(exampleMarkdown1, 'mdx')
    const res = await processHtml({
        html,
        basePath: '/',
        pagePath: '/example',
        allAssetPaths: ['/example-image.png'],

        mapImageUrl: (imgPath) => {
            return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}${imgPath}`
        },
    })

    // console.log(res)
    expect(res).toMatchInlineSnapshot(`
      {
        "html": "<h1>Example Markdown</h1>
      <p>This is an example markdown file.</p>
      <p>some code</p>
      <blockquote>
      <p>a quote</p>
      </blockquote>
      <h1>This should not be a title</h1>
      <img src="https://raw.githubusercontent.com/x/y/z/example-image.png" alt="Example Image">

      <img src="https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&#x26;w=1000" alt="An internet image">
      <h2>another h2</h2>
      <h1>@elysiajs/eden</h1>
      <p>Fully type-safe Spiceflow client refers to the <a href="https://elysiajs.com/eden/overview">documentation</a></p>
      <h2>Example</h2>
      <pre><code class="language-typescript">// server.ts
      import { Spiceflow, t } from 'spiceflow'

      const app = new Spiceflow()
          .get('/', () => 'Hi Spiceflow')
          .get('/id/:id', ({ params: { id } }) => id)
          .post('/mirror', ({ body }) => body, {
              schema: {
                  body: t.Object({
                      id: t.Number(),
                      name: t.String()
                  })
              }
          })
          .listen(8080)

      </code></pre>",
        "title": "Example Markdown",
      }
    `)
    expect(res?.title).toBe('Example Markdown')
})
