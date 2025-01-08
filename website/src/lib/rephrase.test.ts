import dedent from 'dedent'
import fs from 'fs'
import path from 'path'
import { describe, expect, Reporter, test } from 'vitest'

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

const evaluationFolder = path.resolve(__dirname, './evaluation/templates')
let templateContentFiles = fs
    .readdirSync(evaluationFolder)
    .filter((x) => !x.endsWith('migrated.xml'))

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
                path.resolve(evaluationFolder, `./${templateFile}`),
                'utf-8',
            )

            testCases.forEach(({ url, description }) => {
                test(
                    `"${templateFile}" for ${formatUrl(url) || 'no url'}`,
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
        console.log(`running test for ${url || 'no url'}`)
        const sourceHtml = await fetchFormattedHtml({ url })
        const stream = await rewriteTemplateChunk({
            description,
            xml,
            sourceHtml,
            signal: new AbortController().signal,
            user: 'tests',
            onToken(token) {
                process.stdout.write(token)
            },
            url,
        })
        let resultNodeIds = new Set<string>()
        let results = [] as any[]
        let resultXml = ''
        for await (let chunk of stream) {
            let prevLen = resultNodeIds.size

            if (chunk.type === 'fullXml' && chunk.fullXml) {
                resultXml = chunk.fullXml
            }
            let object = chunk.type === 'fullItem' && chunk.fullItem
            if (object) {
                process.stdout.write(`\n${JSON.stringify(object)}\n`)
                // console.log('object', object)
                resultNodeIds.add(object.nodeId!)
                if (resultNodeIds.size === prevLen) {
                    console.error('XXX duplicate nodeId', object)
                }

                results.push(object)
            }
        }

        // const resultXml = rewriteXmlContent({ xml, newContent: results })

        const resPath = path.resolve(
            evaluationFolder,
            `./${templateFile} for ${formatUrl(url) || 'no url'} migrated.xml`,
        )
        fs.mkdirSync(path.dirname(resPath), { recursive: true })
        fs.writeFileSync(resPath, resultXml)
        // await expect(resultXml).toMatchFileSnapshot(
        //     `./evaluation/templates/${templateFile} for ${formatUrl(url)} migrated.xml`,
        // )
    },
)
runTestForEachTemplate(
    'extract links',
    async ({ xml, templateFile, url, description }) => {
        const sourceHtml = await fetchFormattedHtml({ url })
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
