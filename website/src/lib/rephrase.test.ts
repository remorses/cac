import dedent from 'dedent'
import fs from 'fs'
import path from 'path'
import { describe, expect, test } from 'vitest'
import { fetchFormattedHtml } from 'website/src/lib/htmlrewrite.server'
import { removeMarkdownSnippets } from 'website/src/lib/ndjson'
import {
    ITEMS_PER_ITERATION,
    rewriteTemplateChunk,
    rewriteTemplateContent,
} from 'website/src/lib/rewrite'
import {
    bfsOldTextTree,
    oldTextTreeToXml,
    parseXmlToOldTextTree,
} from 'website/src/lib/utils'
const testCases = [
    {
        url: '',
        description:
            'A website builder called Framer, to design websites in Figma like interface',
    },
    {
        url: 'https://framer.com',
        description: 'A website builder called Framer',
    },
]

const templateContentFiles = fs.readdirSync(
    path.resolve(__dirname, './evaluation/templates'),
)

describe('rewrite eval', () => {
    templateContentFiles.forEach((templateFile) => {
        if (!templateFile.endsWith('.xml')) {
            return
        }
        let xml = fs.readFileSync(
            path.resolve(__dirname, `./evaluation/templates/${templateFile}`),
            'utf-8',
        )

        testCases.forEach(({ url, description }) => {
            test(
                `rewrite template "${templateFile}" for ${url || 'no url'}`,
                async () => {
                    const sourceHtml = await fetchFormattedHtml(url)
                    const stream = await rewriteTemplateChunk({
                        description,
                        xml: xml,
                        sourceHtml,
                        signal: new AbortController().signal,
                        onToken(token) {
                            // process.stdout.write(token)
                        },
                        url,
                    })
                    let resultNodeIds = new Set<string>()
                    let results = [] as any[]

                    for await (let chunk of stream) {
                        let prevLen = resultNodeIds.size

                        let object = chunk.object
                        if (object) {
                            console.log('object', object)
                            resultNodeIds.add(object.nodeId!)
                            if (resultNodeIds.size === prevLen) {
                                console.error('XXX duplicate nodeId', object)
                            }

                            results.push(object)
                        }
                    }

                    let tree = await parseXmlToOldTextTree(xml)
                    const allNodes = bfsOldTextTree(tree)
                    allNodes.forEach((node) => {
                        const matchingResult = results.find(
                            (result) => result.nodeId === node.nodeId,
                        )
                        if (matchingResult) {
                            node.content = matchingResult.content
                        } else if (node.content) {
                            node.content += ' (NOT GENERATED)'
                        }
                    })
                    const resultXml = await oldTextTreeToXml(tree)
                    await expect(resultXml).toMatchFileSnapshot(
                        `./evaluation/templates/${templateFile} for ${formatUrl(url)} migrated.xml`,
                    )
                },
                1000 * 200,
            )
        })
    })
})

function formatUrl(url: string) {
    return url.replace('https://', '').replace('http://', '')
}

test('removeMarkdownSnippets', async () => {
    let x = dedent`
    # hello

    this is a test

    \`\`\`js
    console.log('hello')
    \`\`\`

    `
    // console.log(x)
    expect(removeMarkdownSnippets(x)).not.toContain('```')
    expect(removeMarkdownSnippets(x)).toMatchInlineSnapshot(`
      "# hello

      this is a test

      console.log('hello')
      "
    `)
})
