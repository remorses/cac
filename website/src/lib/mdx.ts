import { unified } from 'unified'
import matter from 'gray-matter'
import { MdastToJsx, SafeMdxRenderer } from 'safe-mdx'
import remarkParse from 'remark-parse'
import remarkMdx from 'remark-mdx'
import remarkFrontmatter from 'remark-frontmatter'
import rehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkStringify from 'remark-stringify'
import remarkGfm from 'remark-gfm'

import { SKIP, visit } from 'unist-util-visit'
import yaml from 'js-yaml'
import { renderToStaticMarkup } from 'react-dom/server'
import { marked } from 'marked'
import type { Link, Image } from 'mdast'

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
        let foundMdx = false // Initialize foundMdx as false

        visit(
            tree,
            ['mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxjsEsm'],
            (node, index, parent) => {
                if (node.type === 'mdxjsEsm') {
                    foundMdx = true // Set foundMdx to true if mdxjsEsm is found
                    if (parent && typeof index === 'number') {
                        parent.children.splice(index, 1)
                    }
                    return SKIP
                }

                const visitor = new MdastToJsx({ mdast: node, components: {} })
                const result = visitor.run()

                const res = renderToStaticMarkup(result)
                if (visitor.errors) {
                    foundMdx = true
                }

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

        if (foundMdx) {
            file.data.foundMdx = true // Add foundMdx to the file if any MDX elements were found
        }
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

// Plugins for MDX
const mdxPlugins = unified()
    .use(remarkParse)
    .use(remarkMdx, {})
    .use(convertJSXToHTML)
    // .use(debugMdast)
    .use(remarkFrontmatter, ['yaml'])
    .use(extractFrontmatter)
    .use(rehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })

export function getFrontmatter(markdown: string) {
    const { data, content } = matter(markdown)
    return { frontMatter: data, markdown: content }
}

// Main function
export async function markdownToHtml(markdown: string, extension: string) {
    if (!markdown) {
        return {
            markdown: '',
            foundMdx: false,
        }
    }
    const startTime = Date.now() // Start time

    if (!extension.includes('mdx')) {
        const html = await marked(markdown, { gfm: true })
        return { html, foundMdx: false }
    }

    // Process the input Markdown or MDX
    const file = await mdxPlugins.process(markdown)

    const foundMdx = file.data.foundMdx || false

    const endTime = Date.now() // End time
    console.log(`Markdown processing time: ${endTime - startTime}ms`) // Log the time it takes

    return {
        foundMdx,
        html: String(file), // Extract the resulting HTML
        // frontMatter: (file.data.frontmatter || {}) as any, // Extract the frontmatter
    }
}

// Types for URL rewriting
export interface MarkdownUrlRewriteOptions {
    /** All asset paths in the repo (for matching relative paths) */
    allAssetPaths: string[]
    /** Base path to strip from slugs */
    basePath: string
    /** Function to resolve image paths to full URLs (e.g., GitHub raw URLs) */
    mapImageUrl: (imgPath: string) => Promise<string>
    /** Function to find matching path in repo */
    findMatchInPaths: (args: { filePath: string; paths: string[] }) => string
    /** Function to convert page path to slug */
    turnPagePathIntoSlug: (pagePath: string, basePath: string) => string
    /** Function to check if URL is absolute */
    isAbsoluteUrl: (url: string) => boolean
}

/**
 * Creates a remark plugin that rewrites relative URLs in markdown.
 * - Links: relative paths are converted to slugs
 * - Images: relative paths are converted to full GitHub URLs
 */
function remarkRewriteUrls(options: MarkdownUrlRewriteOptions) {
    const {
        allAssetPaths,
        basePath,
        mapImageUrl,
        findMatchInPaths,
        turnPagePathIntoSlug,
        isAbsoluteUrl,
    } = options

    // Track images that need async URL resolution
    const imageUrlPromises: Array<{ node: Image; promise: Promise<string> }> = []

    return async (tree: any) => {
        // First pass: collect all transformations
        visit(tree, 'link', (node: Link) => {
            const href = node.url
            if (!href || isAbsoluteUrl(href)) {
                return
            }
            const match = findMatchInPaths({
                filePath: href,
                paths: allAssetPaths,
            })
            if (match) {
                const newHref = turnPagePathIntoSlug(match, basePath)
                node.url = newHref
            }
        })

        visit(tree, 'image', (node: Image) => {
            const src = node.url
            if (!src || isAbsoluteUrl(src)) {
                return
            }
            const imgPath = findMatchInPaths({
                filePath: src,
                paths: allAssetPaths,
            })
            if (imgPath && !isAbsoluteUrl(imgPath)) {
                // Queue async URL resolution
                imageUrlPromises.push({
                    node,
                    promise: mapImageUrl(imgPath),
                })
            }
        })

        // Resolve all image URLs in parallel
        const results = await Promise.all(
            imageUrlPromises.map(async ({ node, promise }) => {
                try {
                    const newUrl = await promise
                    return { node, newUrl }
                } catch {
                    return { node, newUrl: null }
                }
            }),
        )

        // Apply resolved URLs
        for (const { node, newUrl } of results) {
            if (newUrl) {
                node.url = newUrl
            }
        }
    }
}

/**
 * Rewrites relative URLs in markdown content.
 * - Links to other markdown files become slugs
 * - Image paths become full GitHub URLs
 */
export async function rewriteMarkdownUrls(
    markdown: string,
    options: MarkdownUrlRewriteOptions,
): Promise<string> {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRewriteUrls, options)
        .use(remarkStringify)

    const file = await processor.process(markdown)
    return String(file)
}
