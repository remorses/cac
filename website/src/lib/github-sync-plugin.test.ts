import { test, expect } from 'vitest'
import { processHtml, findMatchInPaths, turnPagePathIntoSlug, isAbsoluteUrl } from './spiceflow-github-sync-plugin'
import {
    checkGitHubIsInstalled,
    getOctokit,
} from 'website/src/lib/github.server'
import { prisma } from 'db'
import { env } from 'website/src/lib/env'
import { getFrontmatter, markdownToHtml, rewriteMarkdownUrls } from 'website/src/lib/mdx'

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
    const { markdown } = getFrontmatter(exampleMarkdown1)
    const { html } = await markdownToHtml(markdown, 'md')
    expect(html).toMatchInlineSnapshot(`
      "<h1>Example Markdown</h1>
      <p>This is an example markdown file.</p>
      <pre><code>some code
      </code></pre>
      <blockquote>
      <p>a quote</p>
      </blockquote>
      <h1>This should not be a title</h1>
      <p><img src="/example-image.png" alt="Example Image"></p>
      <p><img src="./images/missing.png" alt="A missing relative image"></p>
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
      "
    `)
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
        "html": "<html>
      <h1>Example Markdown</h1>
      <p>This is an example markdown file.</p>
      <pre><code>some code
      </code></pre>
      <blockquote>
      <p>a quote</p>
      </blockquote>
      <h1>This should not be a title</h1>
      <img src="https://raw.githubusercontent.com/x/y/z/example-image.png" alt="Example Image">

      <img src="https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=1000" alt="An internet image">
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

      </html>",
        "title": "Example Markdown",
      }
    `)
    expect(res?.title).toBe('Example Markdown')
})

const markdownWithRelativeUrls = `# Test Document

This is a test with various links and images.

## Images

![Local image](./images/photo.png)

![Root image](/assets/logo.png)

![External image](https://example.com/image.jpg)

## Links

[Another doc](./guide.md)

[Nested doc](../docs/api.md)

[External link](https://example.com)

[Absolute path](/about.md)

## Mixed content

Here's a paragraph with an [inline link](./inline.md) and an image ![inline](./inline.png).

<img src="./images/from-html.png" alt="html img" />
`

test('rewriteMarkdownUrls rewrites relative URLs', async () => {
    const allAssetPaths = [
        '/images/photo.png',
        '/assets/logo.png',
        '/guide.md',
        '/docs/api.md',
        '/about.md',
        '/inline.md',
        '/inline.png',
        '/images/from-html.png',
    ]
    const basePath = '/'
    const owner = 'testowner'
    const repo = 'testrepo'
    const branch = 'main'

    const result = await rewriteMarkdownUrls(markdownWithRelativeUrls, {
        allAssetPaths,
        basePath,
        mapImageUrl: async (imgPath) => {
            return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}${imgPath}`
        },
        findMatchInPaths,
        turnPagePathIntoSlug,
        isAbsoluteUrl,
    })

    expect(result).toMatchInlineSnapshot(`
      "# Test Document

      This is a test with various links and images.

      ## Images

      ![Local image](https://raw.githubusercontent.com/testowner/testrepo/main/images/photo.png)

      ![Root image](https://raw.githubusercontent.com/testowner/testrepo/main/assets/logo.png)

      ![External image](https://example.com/image.jpg)

      ## Links

      [Another doc](/guide)

      [Nested doc](/docs-api)

      [External link](https://example.com)

      [Absolute path](/about)

      ## Mixed content

      Here's a paragraph with an [inline link](/inline) and an image ![inline](https://raw.githubusercontent.com/testowner/testrepo/main/inline.png).

      <img src="https://raw.githubusercontent.com/testowner/testrepo/main/images/from-html.png" alt="html img">
      "
    `)
})

test('rewriteMarkdownUrls handles missing assets gracefully', async () => {
    const markdown = `![Missing](./missing.png)

<img src="./missing-from-html.png" alt="missing from html" />

[Missing link](./missing.md)

[Found link](./found.md)

<img src="./found.png" alt="found" />
`
    const result = await rewriteMarkdownUrls(markdown, {
        allAssetPaths: ['/found.md', '/found.png'],
        basePath: '/',
        mapImageUrl: async (imgPath) => {
            return `https://github.com${imgPath}`
        },
        findMatchInPaths,
        turnPagePathIntoSlug,
        isAbsoluteUrl,
    })

    // Missing image assets are removed while resolvable assets are rewritten
    expect(result).toMatchInlineSnapshot(`
      "



      [Missing link](./missing.md)

      [Found link](/found)

      <img src="https://github.com/found.png" alt="found">
      "
    `)
})

test('rewriteMarkdownUrls rewrites html image tags and strips missing ones', async () => {
    const result = await rewriteMarkdownUrls(
        `<img src="./ok.png" alt="ok" />\n\n<img src="./missing.png" alt="missing" />`,
        {
            allAssetPaths: ['/ok.png'],
            basePath: '/',
            mapImageUrl: async (imgPath) => {
                return `https://raw.githubusercontent.com/testowner/testrepo/main${imgPath}`
            },
            findMatchInPaths,
            turnPagePathIntoSlug,
            isAbsoluteUrl,
        },
    )

    expect(result).toMatchInlineSnapshot(`
      "<img src="https://raw.githubusercontent.com/testowner/testrepo/main/ok.png" alt="ok">

      "
    `)
})

test('rewriteMarkdownUrls strips code fence meta for framer compatibility', async () => {
    const markdown = `\`\`\`ts title=\"sample.ts\"\nconst x = 1\n\`\`\``
    const result = await rewriteMarkdownUrls(markdown, {
        allAssetPaths: [],
        basePath: '/',
        mapImageUrl: async () => {
            return ''
        },
        findMatchInPaths,
        turnPagePathIntoSlug,
        isAbsoluteUrl,
    })

    expect(result).toMatchInlineSnapshot(`
      "\`\`\`ts
      const x = 1
      \`\`\`
      "
    `)
})

// Integration test with real GitHub repo
// Run with: doppler run -- pnpm vitest run -t "syncGithub integration"
test.skip('syncGithub integration - verifies markdown URL rewriting with real repo', async () => {
    const owner = 'remorses'
    const repo = 'framer-github-sync-bug-repro'
    const basePath = '/posts'

    // Find the GitHub installation for this account
    const installation = await prisma.githubInstallation.findFirst({
        where: {
            accountLogin: owner,
            appId: env.GITHUB_APP_ID,
        },
    })

    if (!installation) {
        console.log(`No GitHub installation found for ${owner}, skipping integration test`)
        return
    }

    // Import and call the syncGithub handler directly
    const { markdownPluginApp } = await import('./spiceflow-github-sync-plugin')
    
    const response = await markdownPluginApp.handle(
        new Request('http://test/markdownPlugin/syncGithub', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                owner,
                repo,
                basePath,
                githubAccountLogin: owner,
                projectId: 'test-project-id',
                projectName: 'Test Project',
                mapFieldsConfig: [],
                enablePartialUpdate: false,
                itemIds: [],
            }),
        }),
        {
            // Mock the state that would normally come from auth
            state: {
                githubUserLogin: Promise.resolve(owner),
                orgId: Promise.resolve('test-org-id'),
                userEmail: Promise.resolve('test@example.com'),
                userId: Promise.resolve('test-user-id'),
            },
        },
    )

    const data = await response.json()

    expect(data).toBeDefined()
    expect(data.files).toBeDefined()
    expect(data.files.length).toBeGreaterThan(0)

    // Find the microchip post which has relative images
    const microchipPost = data.files.find((f: any) => 
        f.path?.includes('microchip') || f.slug?.includes('microchip')
    )

    expect(microchipPost).toBeDefined()
    expect(microchipPost.markdown).toBeDefined()

    // Verify images were rewritten to GitHub raw URLs
    expect(microchipPost.markdown).toContain('raw.githubusercontent.com')
    expect(microchipPost.markdown).not.toContain('](images/')

    // Snapshot the rewritten markdown for the microchip post
    expect(microchipPost.markdown).toMatchSnapshot()
})
