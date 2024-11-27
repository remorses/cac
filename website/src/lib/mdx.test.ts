import { describe, it, expect } from 'vitest'
import { markdownToHtml } from './mdx'
import dedent from 'dedent'

describe('markdownToHtml', () => {
    it('should convert markdown to HTML and extract frontmatter', async () => {
        const markdown = dedent`
        ---
        title: "Hello World"
        date: 2024-11-26
        ---

        # Hello World

        This is Markdown content.

        - list one
        - list two
        `

        const result = await markdownToHtml(markdown, 'md')
        expect(result.html).toMatchInlineSnapshot(`
          "<h1>Hello World</h1>
          <p>This is Markdown content.</p>
          <ul>
          <li>list one</li>
          <li>list two</li>
          </ul>"
        `)
        expect(result.frontMatter).toMatchInlineSnapshot(`
          {
            "date": 2024-11-26T00:00:00.000Z,
            "title": "Hello World",
          }
        `)
    })

    it('should convert mdx to HTML and extract frontmatter', async () => {
        const mdx = dedent`
        ---
        title: "MDX Example"
        date: "2024-11-26"
        bool: no
        ---

        import { ExampleComponent } from 'components/ExampleComponent'


        # Hello MDX <p/>

        This is an MDX content and a {variable}.

        this is a component with space above and below

        <MyComponent />

        this one does not have space <Comp>test</Comp>

        export const x = 7

        <test>
        xxxx
        </test>

        <img src='sdfsdf' />

        <a>test</a>
        
        `

        const result = await markdownToHtml(mdx, 'mdx')
        expect(result.html).toMatchInlineSnapshot(`
          "<h1>Hello MDX <div></div></h1>
          <p>This is an MDX content and a variable.</p>
          <p>this is a component with space above and below</p>
          <div></div>
          <p>this one does not have space <div>test</div></p>
          <div><p>xxxx</p></div>
          <link rel="preload" as="image" href="sdfsdf"/><img src="sdfsdf"/>
          <p><a>test</a></p>"
        `)
        expect(result.frontMatter).toMatchInlineSnapshot(`
          {
            "bool": "no",
            "date": "2024-11-26",
            "title": "MDX Example",
          }
        `)
    })
    it('complex mdx', async () => {
        const complexResult = await markdownToHtml(complexMdx, 'mdx')
        expect(complexResult.html).toMatchInlineSnapshot(`
          "<hr>
          <h2>title: Reusable Snippets
          description: Reusable, custom snippets to keep content in sync
          icon: 'recycle'</h2>
          <div></div>
          <h2>Creating a custom snippet</h2>
          <p><strong>Pre-condition</strong>: You must create your snippet file in the <code>snippets</code> directory.</p>
          <div><p>Any page in the <code>snippets</code> directory will be treated as a snippet and will not
          be rendered into a standalone page. If you want to create a standalone page
          from the snippet, import the snippet into another file and call it as a
          component.</p></div>
          <h3>Default export</h3>
          <ol>
          <li>Add content to your snippet file that you want to re-use across multiple
          locations. Optionally, you can add variables that can be filled in via props
          when you import the snippet.</li>
          </ol>
          <pre><code class="language-mdx">Hello world! This is my content I want to reuse across pages. My keyword of the
          day is {word}.
          </code></pre>
          <div><p>The content that you want to reuse must be inside the  directory in
          order for the import to work.</p></div>
          <ol start="2">
          <li>Import the snippet into your destination file.</li>
          </ol>
          <pre><code class="language-mdx">---
          title: My title
          description: My Description
          ---

          import MySnippet from '/snippets/path/to/my-snippet.mdx';

          ## Header

          Lorem impsum dolor sit amet.

          &#x3C;MySnippet word="bananas" />
          </code></pre>
          <h3>Reusable variables</h3>
          <ol>
          <li>Export a variable from your snippet file:</li>
          </ol>
          <pre><code class="language-mdx">export const myName = 'my name';

          export const myObject = { fruit: 'strawberries' };
          </code></pre>
          <ol start="2">
          <li>Import the snippet from your destination file and use the variable:</li>
          </ol>
          <pre><code class="language-mdx">---
          title: My title
          description: My Description
          ---

          import { myName, myObject } from '/snippets/path/to/custom-variables.mdx';

          Hello, my name is {myName} and I like {myObject.fruit}.
          </code></pre>
          <h3>Reusable components</h3>
          <ol>
          <li>Inside your snippet file, create a component that takes in props by exporting
          your component in the form of an arrow function.</li>
          </ol>
          <pre><code class="language-mdx">export const MyComponent = ({ title }) => (
            &#x3C;div>
              &#x3C;h1>{title}&#x3C;/h1>
              &#x3C;p>... snippet content ...&#x3C;/p>
            &#x3C;/div>
          );
          </code></pre>
          <div><p>MDX does not compile inside the body of an arrow function. Stick to HTML
          syntax when you can or use a default export if you need to use MDX.</p></div>
          <ol start="2">
          <li>Import the snippet into your destination file and pass in the props</li>
          </ol>
          <pre><code class="language-mdx">---
          title: My title
          description: My Description
          ---

          import { MyComponent } from '/snippets/custom-component.mdx';

          Lorem ipsum dolor sit amet.

          &#x3C;MyComponent title={'Custom title'} />
          </code></pre>"
        `)
        expect(complexResult.frontMatter).toMatchInlineSnapshot(`{}`)
    })
})

const complexMdx = `
---
title: Reusable Snippets
description: Reusable, custom snippets to keep content in sync
icon: 'recycle'
---

import SnippetIntro from '/snippets/snippet-intro.mdx';

<SnippetIntro />

## Creating a custom snippet

**Pre-condition**: You must create your snippet file in the \`snippets\` directory.

<Note>
  Any page in the \`snippets\` directory will be treated as a snippet and will not
  be rendered into a standalone page. If you want to create a standalone page
  from the snippet, import the snippet into another file and call it as a
  component.
</Note>

### Default export

1. Add content to your snippet file that you want to re-use across multiple
   locations. Optionally, you can add variables that can be filled in via props
   when you import the snippet.

\`\`\`mdx snippets/my-snippet.mdx
Hello world! This is my content I want to reuse across pages. My keyword of the
day is {word}.
\`\`\`

<Warning>
  The content that you want to reuse must be inside the  directory in
  order for the import to work.
</Warning>

2. Import the snippet into your destination file.

\`\`\`mdx destination-file.mdx
---
title: My title
description: My Description
---

import MySnippet from '/snippets/path/to/my-snippet.mdx';

## Header

Lorem impsum dolor sit amet.

<MySnippet word="bananas" />
\`\`\`

### Reusable variables

1. Export a variable from your snippet file:

\`\`\`mdx snippets/path/to/custom-variables.mdx
export const myName = 'my name';

export const myObject = { fruit: 'strawberries' };
\`\`\`

2. Import the snippet from your destination file and use the variable:

\`\`\`mdx destination-file.mdx
---
title: My title
description: My Description
---

import { myName, myObject } from '/snippets/path/to/custom-variables.mdx';

Hello, my name is {myName} and I like {myObject.fruit}.
\`\`\`

### Reusable components

1. Inside your snippet file, create a component that takes in props by exporting
   your component in the form of an arrow function.

\`\`\`mdx snippets/custom-component.mdx
export const MyComponent = ({ title }) => (
  <div>
    <h1>{title}</h1>
    <p>... snippet content ...</p>
  </div>
);
\`\`\`

<Warning>
  MDX does not compile inside the body of an arrow function. Stick to HTML
  syntax when you can or use a default export if you need to use MDX.
</Warning>

2. Import the snippet into your destination file and pass in the props

\`\`\`mdx destination-file.mdx
---
title: My title
description: My Description
---

import { MyComponent } from '/snippets/custom-component.mdx';

Lorem ipsum dolor sit amet.

<MyComponent title={'Custom title'} />
\`\`\`

`
