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
        expect(result.frontmatter).toMatchInlineSnapshot(`
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
          "<h1>Hello MDX <p></p></h1>
          <p>This is an MDX content and a variable.</p>
          <p>this is a component with space above and below</p>
          <div></div>
          <p>this one does not have space <div>test</div></p>
          <div><p>xxxx</p></div>
          <link rel="preload" as="image" href="sdfsdf"/><img src="sdfsdf"/>
          <p><a>test</a></p>"
        `)
        expect(result.frontmatter).toMatchInlineSnapshot(`
          {
            "bool": "no",
            "date": "2024-11-26",
            "title": "MDX Example",
          }
        `)
    })
})
