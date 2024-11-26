import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkFrontmatter from 'remark-frontmatter'
import rehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import yaml from 'js-yaml'

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
    .use(remarkFrontmatter, ['yaml'])
    .use(extractFrontmatter)
    .use(rehype)
    .use(rehypeStringify)

// Main function
export async function markdownToHtml(markdown: string, extension: 'md' | 'mdx'): Promise<{ html: string, frontmatter: Record<string, any> }> {
    const processor = extension === 'mdx' ? mdxPlugins : markdownPlugins

    // Process the input Markdown or MDX
    const file = await processor.process(markdown)

    return {
        html: String(file), // Extract the resulting HTML
        frontmatter: file.data.frontmatter || {}, // Extract the frontmatter
    }
}
