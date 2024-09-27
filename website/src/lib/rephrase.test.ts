import dedent from 'dedent'
import fs from 'fs'
import path from 'path'
import { describe, expect, test } from 'vitest'
import { fetchFormattedHtml } from 'website/src/lib/htmlrewrite.server'
import { removeMarkdownSnippets } from 'website/src/lib/ndjson'
import {
    extractExternalLinks,
    ITEMS_PER_ITERATION,
    rewriteTemplateChunk,
    rewriteTemplateContent,
} from 'website/src/lib/rewrite'
import { bfsOldTextTree, oldTextTreeToXml } from 'website/src/lib/utils'
import { rewriteXmlContent } from 'website/src/lib/xml'

const testCases = [
    {
        url: 'https://framer.com',
        description: 'A website builder called Framer',
    },
    {
        url: '',
        description:
            'A website builder called Framer, to design websites in Figma like interface',
    },
]

let templateContentFiles = fs.readdirSync(
    path.resolve(__dirname, './evaluation/templates'),
)

// templateContentFiles = templateContentFiles.slice(0, 1)

function runTestForEachTemplate(
    testName: string,
    callback: ({
        xml,
        templateFile,
        url,
        description,
    }: {
        xml: string
        templateFile: string
        url: string
        description: string
    }) => Promise<void>,
) {
    describe(testName, () => {
        templateContentFiles.forEach((templateFile) => {
            if (!templateFile.endsWith('.xml')) {
                return
            }
            let xml = fs.readFileSync(
                path.resolve(
                    __dirname,
                    `./evaluation/templates/${templateFile}`,
                ),
                'utf-8',
            )

            testCases.forEach(({ url, description }) => {
                test(
                    `"${templateFile}" for ${url || 'no url'}`,
                    async () => {
                        await callback({ xml, templateFile, url, description })
                    },
                    1000 * 200,
                )
            })
        })
    })
}

runTestForEachTemplate(
    'rewrite template',
    async ({ xml, templateFile, url, description }) => {
        const sourceHtml = await fetchFormattedHtml(url)
        const stream = await rewriteTemplateChunk({
            description,
            xml,
            sourceHtml,
            signal: new AbortController().signal,
            user: 'tests',
            onToken(token) {
                // process.stdout.write(token)
            },
            url,
        })
        let resultNodeIds = new Set<string>()
        let results = [] as any[]

        for await (let chunk of stream) {
            let prevLen = resultNodeIds.size

            let object = chunk.completeObj
            if (object) {
                console.log('object', object)
                resultNodeIds.add(object.nodeId!)
                if (resultNodeIds.size === prevLen) {
                    console.error('XXX duplicate nodeId', object)
                }

                results.push(object)
            }
        }

        const resultXml = rewriteXmlContent({ xml, newContent: results })

        await expect(resultXml).toMatchFileSnapshot(
            `./evaluation/templates/${templateFile} for ${formatUrl(url)} migrated.xml`,
        )
    },
)
runTestForEachTemplate(
    'extract links',
    async ({ xml, templateFile, url, description }) => {
        const sourceHtml = await fetchFormattedHtml(url)
        const links = await extractExternalLinks({
            websiteUrl: url,
            formattedHtml: sourceHtml,
            user: 'tests',
            xml,
        })
        console.log(links)
        if (!links?.length) {
            return
        }

        const resultXml = rewriteXmlContent({ xml, newContent: links })

        await expect(resultXml).toMatchSnapshot()
    },
)

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
