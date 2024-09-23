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
                            const { nodeId, ...interestingFields } = object
                            results.push({
                                name: node?.name,
                                previousText: node?.text,
                                ...interestingFields,
                            })
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

test('splitStringButKeepChar', async () => {
    expect(splitStringButKeepChar('hello world  xx ', ' '))
        .toMatchInlineSnapshot(`
      [
        "hello ",
        "world ",
        " ",
        "xx ",
      ]
    `)
    expect(
        splitStringButKeepChar('hello\nworld\n\n some bs shit here', '\n').map(
            (x) => JSON.stringify(x),
        ),
    ).toMatchInlineSnapshot(`
      [
        ""hello\\n"",
        ""world\\n"",
        ""\\n"",
        "" some bs shit here"",
      ]
    `)
    expect(
        splitStringButKeepChar(
            `{"nodeId":"XAJKcOOW8","text":"Join for free and explore endless possibilities.","previousText":"Join for free and start connecting."}
    {"nodeId":"uVCb29QJD","text":"Hassle-Free","previousText":"No Maintenance Required"}
    {"nodeId":"WuRl6Hyhg","text":"We manage updates and maintenance for you.","previousText":"We handle all updates and maintenance for you."}`,
            '\n',
        ).map((x) => JSON.parse(x)),
    ).toMatchInlineSnapshot(`
      [
        {
          "nodeId": "XAJKcOOW8",
          "previousText": "Join for free and start connecting.",
          "text": "Join for free and explore endless possibilities.",
        },
        {
          "nodeId": "uVCb29QJD",
          "previousText": "No Maintenance Required",
          "text": "Hassle-Free",
        },
        {
          "nodeId": "WuRl6Hyhg",
          "previousText": "We handle all updates and maintenance for you.",
          "text": "We manage updates and maintenance for you.",
        },
        {
          "nodeId": "dF7KU7H_S",
          "previousText": "Quick Setup",
          "text": "Easy Setup",
        },
        {
          "nodeId": "GUjrtdfZu",
          "previousText": "Start using the app within minutes.",
          "text": "Get started in just a few minutes.",
        },
        {
          "nodeId": "PvcCFRx0p",
          "previousText": "Diverse Features",
          "text": "Feature-Rich",
        },
        {
          "nodeId": "OvsbDInDl",
          "previousText": "Access a variety of tools tailored to your needs.",
          "text": "Access a wide range of tools tailored to your needs.",
        },
        {
          "nodeId": "nk5stNgwE",
          "previousText": "Impact",
          "text": "Impactful",
        },
        {
          "nodeId": "ZNSqRTPTe",
          "previousText": "We aim to revolutionize social connectivity.",
          "text": "We aim to revolutionize how you connect.",
        },
        {
          "nodeId": "vBnw_mEnl",
          "previousText": "Transparency",
          "text": "Transparent",
        },
        {
          "nodeId": "N0spmch6X",
          "previousText": "We provide clear and detailed insights into your activities.",
          "text": "We offer clear insights into your activities.",
        },
        {
          "nodeId": "ZtpzDReuy",
          "previousText": "Simplicity",
          "text": "Simple",
        },
        {
          "nodeId": "Ez7GQFDih",
          "previousText": "Our interface makes connecting easy.",
          "text": "Our interface makes everything easy.",
        },
        {
          "nodeId": "sBye5dU0E",
          "previousText": "Reliability",
          "text": "Reliable",
        },
        {
          "nodeId": "sLHXEyRh6",
          "previousText": "We ensure your data is secure and accessible.",
          "text": "Your data is secure and always accessible.",
        },
      ]
    `)
})
