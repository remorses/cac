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
import type { Code, Image, Link, Root } from 'mdast'
import domSerializer from 'dom-serializer'
import * as domutils from 'domutils'
import { parseDocument } from 'htmlparser2'

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

    const imageUrlPromises: Array<{
        node: Image
        parent: unknown
        promise: Promise<string | null>
    }> = []
    const htmlImageUrlPromises: Array<{
        node: {
            value: string
        }
        promise: Promise<string>
    }> = []

    return async (tree: Root) => {
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

        visit(tree, 'image', (node: Image, _index: number | undefined, parent) => {
            const src = node.url
            if (!src || isAbsoluteUrl(src)) {
                return
            }
            const imgPath = findMatchInPaths({
                filePath: src,
                paths: allAssetPaths,
            })
            if (!imgPath) {
                removeNodeFromParent({ parent, node })
                return SKIP
            }
            if (isAbsoluteUrl(imgPath)) {
                node.url = imgPath
                return
            }

            imageUrlPromises.push({
                node,
                parent,
                promise: mapImageUrl(imgPath).catch(() => {
                    return null
                }),
            })
        })

        visit(tree, 'html', (node: { value: string }) => {
            if (!node.value.toLowerCase().includes('<img')) {
                return
            }
            htmlImageUrlPromises.push({
                node,
                promise: rewriteHtmlImageTags({
                    html: node.value,
                    allAssetPaths,
                    mapImageUrl,
                    findMatchInPaths,
                    isAbsoluteUrl,
                }),
            })
        })

        const imageResults = await Promise.all(
            imageUrlPromises.map(async ({ node, parent, promise }) => {
                try {
                    const newUrl = await promise
                    return { node, parent, newUrl }
                } catch {
                    return { node, parent, newUrl: null }
                }
            }),
        )

        for (const { node, parent, newUrl } of imageResults) {
            if (newUrl) {
                node.url = newUrl
                continue
            }
            removeNodeFromParent({ node, parent })
        }

        const htmlImageResults = await Promise.all(
            htmlImageUrlPromises.map(async ({ node, promise }) => {
                return {
                    node,
                    value: await promise,
                }
            }),
        )

        for (const { node, value } of htmlImageResults) {
            node.value = value
        }

        visit(tree, 'code', (node: Code) => {
            if (!node.meta) {
                return
            }
            node.meta = undefined
        })
    }
}

function removeNodeFromParent({
    node,
    parent,
}: {
    node: unknown
    parent: unknown
}) {
    if (!isNodeWithChildren(parent)) {
        return
    }
    parent.children = parent.children.filter((child) => {
        return child !== node
    })
}

function isNodeWithChildren(value: unknown): value is { children: unknown[] } {
    if (!value || typeof value !== 'object') {
        return false
    }
    return Array.isArray((value as { children?: unknown }).children)
}

async function rewriteHtmlImageTags({
    html,
    allAssetPaths,
    mapImageUrl,
    findMatchInPaths,
    isAbsoluteUrl,
}: {
    html: string
    allAssetPaths: string[]
    mapImageUrl: (imgPath: string) => Promise<string>
    findMatchInPaths: (args: { filePath: string; paths: string[] }) => string
    isAbsoluteUrl: (url: string) => boolean
}): Promise<string> {
    const document = parseDocument(html, { decodeEntities: false })
    const imageNodes = domutils.findAll((node) => {
        return domutils.isTag(node) && node.name === 'img'
    }, document.children)

    const imageTransforms = await Promise.all(
        imageNodes.map(async (node) => {
            if (!domutils.isTag(node)) {
                return {
                    node,
                    remove: false,
                    src: '',
                }
            }

            const src = node.attribs?.src || ''
            if (!src) {
                return {
                    node,
                    remove: true,
                    src,
                }
            }
            if (isAbsoluteUrl(src)) {
                return {
                    node,
                    remove: false,
                    src,
                }
            }

            const imgPath = findMatchInPaths({
                filePath: src,
                paths: allAssetPaths,
            })
            if (!imgPath) {
                return {
                    node,
                    remove: true,
                    src,
                }
            }
            if (isAbsoluteUrl(imgPath)) {
                return {
                    node,
                    remove: false,
                    src: imgPath,
                }
            }

            const mappedUrl = await mapImageUrl(imgPath).catch(() => {
                return ''
            })
            if (!mappedUrl) {
                return {
                    node,
                    remove: true,
                    src,
                }
            }

            return {
                node,
                remove: false,
                src: mappedUrl,
            }
        }),
    )

    imageTransforms.forEach(({ node, remove, src }) => {
        if (!domutils.isTag(node)) {
            return
        }
        if (remove) {
            domutils.removeElement(node)
            return
        }
        if (src) {
            node.attribs.src = src
        }
    })

    return domSerializer(document.children, {
        encodeEntities: false,
        decodeEntities: false,
    })
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
