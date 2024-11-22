import { test, expect } from 'vitest'
import { processMarkdown } from './elysia-markdown-plugin'
import {
    checkGitHubIsInstalled,
    getOctokit,
} from 'website/src/lib/github.server'
import { prisma } from 'db/prisma'
import { env } from 'website/src/lib/env'

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
test('processMarkdown', async () => {
    let errors = [] as any
    const res = await processMarkdown({
        content: exampleMarkdown1,
        basePath: '/',
        pagePath: '/example',
        allAssetPaths: [
            '/example-image.png',
        ],
        branch,
        owner,
        repo,
        onError: (e) => {
            errors.push(e)
        },
    })
    // console.log(errors)
    expect(errors).toHaveLength(0)

    // console.log(res)
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
      <p><img src="https://raw.githubusercontent.com/x/y/z/example-image.png" alt="Example Image"></p>
      <p></p>
      <p><img src="https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=1000" alt="An internet image"></p>
      <h2>another h2</h2>
      <h1>@elysiajs/eden</h1>
      <p>Fully type-safe Spiceflow client refers to the <a href="https://elysiajs.com/eden/overview">documentation</a></p>
      <h2>Example</h2>
      <pre><code class="language-typescript">// server.ts
      import { Spiceflow, t } from &#39;spiceflow&#39;

      const app = new Spiceflow()
          .get(&#39;/&#39;, () =&gt; &#39;Hi Spiceflow&#39;)
          .get(&#39;/id/:id&#39;, ({ params: { id } }) =&gt; id)
          .post(&#39;/mirror&#39;, ({ body }) =&gt; body, {
              schema: {
                  body: t.Object({
                      id: t.Number(),
                      name: t.String()
                  })
              }
          })
          .listen(8080)
      </code></pre>
      ",
        "pagePath": "/example",
        "slug": "/example",
        "title": "Example Markdown",
      }
    `)
    expect(res?.title).toBe('Example Markdown')
})
