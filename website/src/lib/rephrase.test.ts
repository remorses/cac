import { openai } from '@ai-sdk/openai'
import fs from 'fs'
import { streamText } from 'ai'
import dedent from 'dedent'
import { describe, expect, test } from 'vitest'
import {
    convertExamplesToMarkdownList,
    ITEMS_PER_ITERATION,
    rewriteTemplateContent,
} from 'website/src/lib/rewrite'
import {
    NDJSONStream,
    removeMarkdownSnippets,
    splitStringButKeepChar,
} from 'website/src/lib/ndjson'
import { fetchFormattedHtml } from 'website/src/lib/htmlrewrite.server'
import path from 'path'
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
        let textToReplace = JSON.parse(
            fs.readFileSync(
                path.resolve(
                    __dirname,
                    `./evaluation/templates/${templateFile}`,
                ),
                'utf-8',
            ),
        )

        textToReplace = textToReplace.slice(0, ITEMS_PER_ITERATION)

        testCases.forEach(({ url, description }) => {
            test(
                `rewrite template "${templateFile}" for ${url}`,
                async () => {
                    const sourceHtml = await fetchFormattedHtml(url)
                    const stream = await rewriteTemplateContent({
                        description,
                        textToReplace,
                        exampleTextToMigrate: [],
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
                            const node = textToReplace.find(
                                (x) => x.nodeId === object.nodeId,
                            )
                            if (!node) {
                                console.error(
                                    'XXX LLM returned text for a non existent previous node',
                                    object,
                                )
                            }
                            // const { nodeId, ...interestingFields } = object
                            const cleanedObject = Object.fromEntries(
                                Object.entries(object).filter(
                                    ([_, value]) =>
                                        value != null && value !== undefined,
                                ),
                            )
                            results.push(cleanedObject)
                        }
                    }
                    let missingNodes = textToReplace.filter(
                        (x) => !resultNodeIds.has(x.nodeId),
                    )
                    if (missingNodes.length) {
                        console.error('missing nodes', missingNodes)
                        console.error(
                            `there were ${missingNodes.length} missing nodes`,
                        )
                    }
                    await expect(results).toMatchFileSnapshot(
                        `./evaluation/rewrite-snapshots/${templateFile} for ${formatUrl(url)}.json5`,
                    )
                },
                1000 * 100,
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
