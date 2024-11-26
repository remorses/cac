import { unified } from 'unified'
import { SafeMdxRenderer } from 'safe-mdx'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkFrontmatter from 'remark-frontmatter'
import rehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { SKIP, visit } from 'unist-util-visit'
import yaml from 'js-yaml'
import { renderToStaticMarkup } from 'react-dom/server'

// Utility to extract and remove frontmatter
function extractFrontmatter() {
    return (tree, file) => {
        visit(tree, 'yaml', (node) => {
            const frontmatter = yaml.load(node.value)
            file.data.frontmatter = frontmatter // Attach frontmatter to the file
        })

        // Remove frontmatter nodes from the tree
        tree.children = tree.children.filter((node) => node.type !== 'yaml')
    }
}

function convertJSXToHTML() {
    return (tree, file) => {
        visit(
            tree,
            ['mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxjsEsm'],
            (node, index, parent) => {
                if (node.type === 'mdxjsEsm') {
                    if (parent && typeof index === 'number') {
                        parent.children.splice(index, 1)
                    }
                    return SKIP
                }

                const res = renderToStaticMarkup(
                    SafeMdxRenderer({ mdast: node, components: {} }),
                )

                if (!res) {
                    return
                }

                const htmlNode = {
                    type: 'html',
                    value: res,
                    children: [],
                    attributes: undefined,
                }
                if (parent && typeof index === 'number') {
                    parent.children[index] = htmlNode
                    return SKIP
                }
            },
        )
    }
}

// Simple plugin to debug the mdast
function debugMdast() {
    return (tree) => {
        const treeCopy = JSON.parse(
            JSON.stringify(tree, (key, value) => {
                if (key === 'position') {
                    return undefined
                }
                return value
            }),
        )
        console.log(JSON.stringify(treeCopy, null, 2))
    }
}

// Plugins for Markdown
const markdownPlugins = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(extractFrontmatter)
    .use(rehype)
    .use(rehypeStringify)

// Plugins for MDX
const mdxPlugins = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(convertJSXToHTML)
    .use(debugMdast)
    .use(remarkFrontmatter, ['yaml'])
    .use(extractFrontmatter)
    .use(rehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })

// Main function
export async function markdownToHtml(
    markdown: string,
    extension: 'md' | 'mdx',
): Promise<{ html: string; frontmatter: Record<string, any> }> {
    const processor = extension === 'mdx' ? mdxPlugins : markdownPlugins

    // Process the input Markdown or MDX
    const file = await processor.process(markdown)

    return {
        html: String(file), // Extract the resulting HTML
        frontmatter: file.data.frontmatter || {}, // Extract the frontmatter
    }
}
