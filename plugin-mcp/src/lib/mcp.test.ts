import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createMCPClient } from './mcp-client.js'

const mcpUrl = 'https://mcp.unframer.co/sse?id=598f176d590e612e9b6bcaebb54abb0a8763c6f54ba5b9c136690ff9ad2400cc&secret=du1SMfMxF9jeNC4ASSVtJfjjsV7PdkkP'

describe(
    'Framer MCP Server Tests',
    () => {
        let callTool: Awaited<ReturnType<typeof createMCPClient>>['callTool']
        let cleanup: (() => Promise<void>) | null = null
        let client: Awaited<ReturnType<typeof createMCPClient>>['client']

        beforeAll(async () => {
            const result = await createMCPClient({
                mcpUrl,
                clientName: 'framer-test',
            })
            callTool = result.callTool
            cleanup = result.cleanup
            client = result.client
        })

        afterAll(async () => {
            if (cleanup) {
                await cleanup()
                cleanup = null
            }
        })

        it('should list tools', async () => {
            const { tools } = await client.listTools()

            expect(Array.isArray(tools)).toBe(true)
            await expect(tools).toMatchFileSnapshot(`snapshots/tools.jsonc`)
            expect(tools.length).toBeGreaterThan(0)
        })
        it('should get project XML', async () => {
            const result = await callTool({
                name: 'getProjectXml',
                args: undefined,
            })

            await expect(getTextContent(result.content)).toMatchFileSnapshot(
                `snapshots/project.html`,
            )
            expect(getTextContent(result.content)).toBeDefined()
        })
        it('should get page XML', async () => {
            const result = await callTool({
                name: 'getNodeXml',
                args: { nodeId: 'CpFAHygNJ' },
            })
            expect(getTextContent(result.content)).toBeDefined()
            await expect(getTextContent(result.content)).toMatchFileSnapshot(
                `snapshots/page.html`,
            )
        })
        it('should get component XML', async () => {
            const result = await callTool({
                name: 'getNodeXml',
                args: { nodeId: 'CpFAHygNJ' },
            })
            expect(getTextContent(result.content)).toBeDefined()
            await expect(getTextContent(result.content)).toMatchFileSnapshot(
                `snapshots/component.html`,
            )
        })

        it('should update node XML with random number', async () => {
            // First get the page XML to find the node
            const pageResult = await callTool({
                name: 'getNodeXml',
                args: { nodeId: 'CpFAHygNJ' },
            })
            const pageXml = getTextContent(pageResult.content)
            expect(pageXml).toBeDefined()

            // Generate a random number
            const randomNum = Math.floor(Math.random() * 10000)

            // Create XML to update the node - look for node with id yK6cCeTUB
            const updateXml = `<TextNode nodeId="yK6cCeTUB">Updated text ${randomNum}</TextNode>`

            // Update the node
            const updateResult = await callTool({
                name: 'updateXmlForNode',
                args: {
                    nodeId: 'CpFAHygNJ',
                    xml: updateXml,
                },
            })

            const updatedContent = getTextContent(updateResult.content)
            expect(updatedContent).toBeDefined()
            expect(updatedContent).toContain(`Updated text ${randomNum}`)
            expect(updatedContent).toContain('Successfully updated')
            expect(updatedContent).toContain('Updated XML:')

            // Verify the update by getting the node again
            const verifyResult = await callTool({
                name: 'getNodeXml',
                args: { nodeId: 'yK6cCeTUB' },
            })
            const verifyXml = getTextContent(verifyResult.content)
            expect(verifyXml).toBeDefined()
            expect(verifyXml).toContain(`Updated text ${randomNum}`)
        })

        it('should get project color styles', async () => {
            const result = await callTool({
                name: 'getProjectColorStyles',
                args: undefined,
            })

            expect(result.content).toBeDefined()
            const content = Array.isArray(result.content) && result.content[0]?.text
                ? JSON.parse(result.content[0].text)
                : result.content
            await expect(content).toMatchFileSnapshot(
                `snapshots/color-styles.jsonc`,
            )
        })

        it('should get project text styles', async () => {
            const result = await callTool({
                name: 'getProjectTextStyles',
                args: undefined,
            })

            expect(result.content).toBeDefined()
            const content = Array.isArray(result.content) && result.content[0]?.text
                ? JSON.parse(result.content[0].text)
                : result.content
            await expect(content).toMatchFileSnapshot(
                `snapshots/text-styles.jsonc`,
            )
        })

        it('should update a color style', async () => {
            // First get color styles to find one to update
            const colorStylesResult = await callTool({
                name: 'getProjectColorStyles',
                args: undefined,
            })

            const colorStyles = Array.isArray(colorStylesResult.content) && colorStylesResult.content[0]?.text
                ? JSON.parse(colorStylesResult.content[0].text)
                : colorStylesResult.content

            expect(colorStyles.length).toBeGreaterThan(0)
            const firstColorStyle = colorStyles[0]

            // Update the color style
            const randomNum = Math.floor(Math.random() * 255)
            const result = await callTool({
                name: 'updateColorStyle',
                args: {
                    stylePath: firstColorStyle.path ||'test-style',
                    updates: {
                        name: `${firstColorStyle.name} - Test ${randomNum}`,
                        light: `rgb(${randomNum}, 100, 150)`,
                    }
                },
            })

            const content = getTextContent(result.content)
            expect(content).toBeDefined()

            // Parse the content if it's a JSON string
            const parsedContent = typeof content === 'string' && content.trim().startsWith('{') 
                ? tryJsonParse(content)
                : content

            // Check if content is an object or string
            if (typeof parsedContent === 'object' && parsedContent.message) {
                expect(parsedContent.message).toContain('Successfully updated color style')
                // The response might not include the full style object
                if (parsedContent.style && parsedContent.style.name) {
                    expect(parsedContent.style.name).toContain(`Test ${randomNum}`)
                }
            } else if (typeof content === 'string') {
                expect(content).toContain('Successfully updated color style')
                expect(content).toContain(`Test ${randomNum}`)
            }

            // Verify the update by getting color styles again
            const verifyResult = await callTool({
                name: 'getProjectColorStyles',
                args: undefined,
            })

            const updatedColorStyles = Array.isArray(verifyResult.content) && verifyResult.content[0]?.text
                ? JSON.parse(verifyResult.content[0].text)
                : verifyResult.content

            expect(updatedColorStyles).toMatchInlineSnapshot(`
              [
                {
                  "dark": null,
                  "light": "rgb(222, 100, 150)",
                  "path": "/undefined - Test 222",
                },
                {
                  "dark": null,
                  "light": "rgb(13, 13, 23)",
                  "path": "/Gray-900",
                },
                {
                  "dark": null,
                  "light": "rgb(27, 27, 37)",
                  "path": "/Gray-800",
                },
                {
                  "dark": null,
                  "light": "rgb(39, 39, 49)",
                  "path": "/Gray-700",
                },
                {
                  "dark": null,
                  "light": "rgb(69, 69, 79)",
                  "path": "/Gray-600",
                },
                {
                  "dark": null,
                  "light": "rgb(97, 97, 107)",
                  "path": "/Gray-500",
                },
                {
                  "dark": null,
                  "light": "rgb(148, 148, 158)",
                  "path": "/Gray-400",
                },
                {
                  "dark": null,
                  "light": "rgb(201, 201, 210)",
                  "path": "/Gray-300",
                },
                {
                  "dark": null,
                  "light": "rgb(224, 224, 230)",
                  "path": "/Gray-200",
                },
                {
                  "dark": null,
                  "light": "rgb(241, 241, 244)",
                  "path": "/Gray-100",
                },
                {
                  "dark": null,
                  "light": "rgb(247, 247, 248)",
                  "path": "/Gray-50",
                },
                {
                  "dark": null,
                  "light": "rgb(93, 58, 234)",
                  "path": "/Royal blue-600",
                },
                {
                  "dark": null,
                  "light": "rgb(114, 92, 247)",
                  "path": "/Royal blue-500",
                },
                {
                  "dark": null,
                  "light": "rgb(184, 181, 254)",
                  "path": "/Royal blue-300",
                },
                {
                  "dark": "rgb(137, 50, 100)",
                  "light": "rgb(137, 100, 200)",
                  "path": "/Test-Color-902",
                },
                {
                  "dark": "rgb(177, 50, 100)",
                  "light": "rgb(177, 100, 200)",
                  "path": "/Test-Color-942",
                },
                {
                  "dark": "rgb(88, 50, 100)",
                  "light": "rgb(88, 100, 200)",
                  "path": "/Test-Color-598",
                },
                {
                  "dark": "rgb(193, 50, 100)",
                  "light": "rgb(193, 100, 200)",
                  "path": "/Test-Color-448",
                },
              ]
            `)
            // The path might have changed due to the name update, so search by the test number instead
            const updatedStyle = updatedColorStyles.find(s => s.path.includes(`Test ${randomNum}`))
            expect(updatedStyle).toBeDefined()
            expect(updatedStyle.light).toBe(`rgb(${randomNum}, 100, 150)`)

            // Restore original name
            await callTool({
                name: 'updateColorStyle',
                args: {
                    stylePath: firstColorStyle.path,
                    updates: {
                        name: firstColorStyle.name,
                        light: firstColorStyle.light,
                    }
                },
            })
        })

        it('should create a new color style', async () => {
            const randomNum = Math.floor(Math.random() * 1000)
            const newStylePath = `/Test-Color-${randomNum}`

            // Create a new color style (name is derived from path)
            const result = await callTool({
                name: 'createColorStyle',
                args: {
                    stylePath: newStylePath,
                    properties: {
                        light: `rgb(${randomNum % 255}, 100, 200)`,
                        dark: `rgb(${randomNum % 255}, 50, 100)`,
                    }
                },
            })

            const content = getTextContent(result.content)
            expect(content).toBeDefined()

            // Parse the content if it's a JSON string
            const parsedContent = typeof content === 'string' && content.trim().startsWith('{') 
                ? tryJsonParse(content)
                : content

            // Check if creation was successful
            if (typeof parsedContent === 'object' && parsedContent.message) {
                expect(parsedContent.message).toContain('Successfully created color style')
                expect(parsedContent.style.path).toBe(newStylePath)
                // Name is derived from the last segment of the path
                expect(parsedContent.style.name).toBe(`Test-Color-${randomNum}`)
                expect(parsedContent.style.light).toBe(`rgb(${randomNum % 255}, 100, 200)`)
                expect(parsedContent.style.dark).toBe(`rgb(${randomNum % 255}, 50, 100)`)
            } else if (typeof content === 'string') {
                expect(content).toContain('Successfully created color style')
                expect(content).toContain(`Test-Color-${randomNum}`)
            }

            // Verify the style exists by getting all color styles
            const verifyResult = await callTool({
                name: 'getProjectColorStyles',
                args: undefined,
            })

            const colorStyles = Array.isArray(verifyResult.content) && verifyResult.content[0]?.text
                ? JSON.parse(verifyResult.content[0].text)
                : verifyResult.content

            const createdStyle = colorStyles.find(s => s.path === newStylePath)
            expect(createdStyle).toBeDefined()
            expect(createdStyle.light).toBe(`rgb(${randomNum % 255}, 100, 200)`)
            expect(createdStyle.dark).toBe(`rgb(${randomNum % 255}, 50, 100)`)

            // Test creating duplicate should fail
            const duplicateResult = await callTool({
                name: 'createColorStyle',
                args: {
                    stylePath: newStylePath,
                    properties: {
                        light: `rgb(255, 0, 0)`,
                    }
                },
            })

            const duplicateContent = getTextContent(duplicateResult.content)
            expect(duplicateContent).toContain('already exists')
        })

        it('should search fonts', async () => {
            const result = await callTool({
                name: 'searchFonts',
                args: {
                    query: 'Inter-200',
                },
            })

            const content = getTextContent(result.content)
            expect(content).toMatchInlineSnapshot(`
              "{
                "message": "Found 2 fonts matching \\"Inter-200\\".\\n\\nTo use a font: <Text font=\\"selector\\">Text</Text>\\nNote: font and inlineTextStyle attributes are mutually exclusive",
                "results": [
                  {
                    "family": "Inter",
                    "selector": "GF;Inter-200",
                    "weight": 200,
                    "style": "normal"
                  },
                  {
                    "family": "Inter",
                    "selector": "GF;Inter-200italic",
                    "weight": 200,
                    "style": "italic"
                  }
                ],
                "totalMatches": 2
              }"
            `)
            expect(content).toBeDefined()
            
            // Parse the content if it's a JSON string
            const parsedContent = typeof content === 'string' && content.trim().startsWith('{') 
                ? tryJsonParse(content)
                : content

            expect(parsedContent.message).toBeDefined()
            expect(parsedContent.results).toBeDefined()
            expect(Array.isArray(parsedContent.results)).toBe(true)
            expect(parsedContent.totalMatches).toBeGreaterThanOrEqual(0)

            // Check if results have proper structure
            if (parsedContent.results.length > 0) {
                const firstFont = parsedContent.results[0]
                expect(firstFont).toHaveProperty('family')
                expect(firstFont).toHaveProperty('selector')
                expect(firstFont).toHaveProperty('weight')
                expect(firstFont).toHaveProperty('style')

                // Verify the query matches in selector
                expect(firstFont.selector.toLowerCase()).toContain('inter')
            }

            // Test that results are limited to 20
            expect(parsedContent.results.length).toBeLessThanOrEqual(20)
        })

        it('should get component insert URL and types for normal component', async () => {
            // Test with a regular component node ID
            const result = await callTool({
                name: 'getComponentInsertUrlAndTypes',
                args: {
                    id: 'zW4H90vyr',
                },
            })

            const content = getTextContent(result.content)
            expect(content).toBeDefined()
            await expect(content).toMatchFileSnapshot(
                `snapshots/component-insert-info.md`,
            )
        })

        it('should get component insert URL and types for code file', async () => {
            // Test with a code file ID
            const result = await callTool({
                name: 'getComponentInsertUrlAndTypes',
                args: {
                    id: 'eZvzSVQ',
                },
            })

            const content = getTextContent(result.content)
            expect(content).toBeDefined()
            await expect(content).toMatchFileSnapshot(
                `snapshots/code-file-insert-info.md`,
            )
        })

        it('should get project website URL', async () => {
            const result = await callTool({
                name: 'getProjectWebsiteUrl',
                args: undefined,
            })

            const content = getTextContent(result.content)
            expect(content).toBeDefined()
            
            // Parse the content if it's a JSON string
            const parsedContent = typeof content === 'string' && content.trim().startsWith('{') 
                ? tryJsonParse(content)
                : content
            
            // The response should be an object with production and staging properties
            expect(parsedContent).toHaveProperty('production')
            expect(parsedContent).toHaveProperty('staging')
        })

        it('should update a text style', async () => {
            // First get text styles to find one to update
            const textStylesResult = await callTool({
                name: 'getProjectTextStyles',
                args: undefined,
            })

            const textStyles = Array.isArray(textStylesResult.content) && textStylesResult.content[0]?.text
                ? JSON.parse(textStylesResult.content[0].text)
                : textStylesResult.content

            expect(textStyles).toMatchInlineSnapshot(`
              [
                {
                  "alignment": "center",
                  "balance": false,
                  "decoration": "none",
                  "fontSize": "44px",
                  "letterSpacing": "0px",
                  "lineHeight": "72px",
                  "paragraphSpacing": 40,
                  "path": "/undefined - Test 44",
                  "tag": "h1",
                  "transform": "none",
                },
                {
                  "alignment": "left",
                  "balance": false,
                  "decoration": "none",
                  "fontSize": "36px",
                  "letterSpacing": "0px",
                  "lineHeight": "44px",
                  "paragraphSpacing": 40,
                  "path": "/Heading 2xl",
                  "tag": "h2",
                  "transform": "none",
                },
                {
                  "alignment": "left",
                  "balance": false,
                  "decoration": "none",
                  "fontSize": "30px",
                  "letterSpacing": "0px",
                  "lineHeight": "38px",
                  "paragraphSpacing": 38,
                  "path": "/Heading xl",
                  "tag": "h2",
                  "transform": "none",
                },
                {
                  "alignment": "left",
                  "balance": false,
                  "decoration": "none",
                  "fontSize": "18px",
                  "letterSpacing": "0px",
                  "lineHeight": "28px",
                  "paragraphSpacing": 40,
                  "path": "/Heading lg",
                  "tag": "h5",
                  "transform": "none",
                },
                {
                  "alignment": "left",
                  "balance": false,
                  "decoration": "none",
                  "fontSize": "16px",
                  "letterSpacing": "0px",
                  "lineHeight": "24px",
                  "paragraphSpacing": 40,
                  "path": "/Heading md",
                  "tag": "h6",
                  "transform": "none",
                },
                {
                  "alignment": "left",
                  "balance": false,
                  "decoration": "none",
                  "fontSize": "14px",
                  "letterSpacing": "0px",
                  "lineHeight": "20px",
                  "paragraphSpacing": 40,
                  "path": "/Heading sm",
                  "tag": "h6",
                  "transform": "none",
                },
                {
                  "alignment": "left",
                  "balance": false,
                  "decoration": "none",
                  "fontSize": "18px",
                  "letterSpacing": "0px",
                  "lineHeight": "28px",
                  "paragraphSpacing": 20,
                  "path": "/Body lg",
                  "tag": "p",
                  "transform": "none",
                },
                {
                  "alignment": "left",
                  "balance": false,
                  "decoration": "none",
                  "fontSize": "16px",
                  "letterSpacing": "0px",
                  "lineHeight": "24px",
                  "paragraphSpacing": 0,
                  "path": "/Body md",
                  "tag": "p",
                  "transform": "none",
                },
                {
                  "alignment": "left",
                  "balance": false,
                  "decoration": "none",
                  "fontSize": "14px",
                  "letterSpacing": "0px",
                  "lineHeight": "20px",
                  "paragraphSpacing": 20,
                  "path": "/Body sm",
                  "tag": "p",
                  "transform": "none",
                },
              ]
            `)

            expect(textStyles.length).toBeGreaterThan(0)
            const firstTextStyle = textStyles[0] || 'test-style'

            // Update the text style
            const randomNum = Math.floor(Math.random() * 100)
            const result = await callTool({
                name: 'updateTextStyle',
                args: {
                    stylePath: firstTextStyle.path,
                    updates: {
                        name: `${firstTextStyle.name} - Test ${randomNum}`,
                        fontSize: `${randomNum}px`,
                        alignment: 'center',
                    }
                },
            })

            const content = getTextContent(result.content)
            expect(content).toBeDefined()

            // Parse the content if it's a JSON string
            const parsedContent = typeof content === 'string' && content.trim().startsWith('{') 
                ? tryJsonParse(content)
                : content

            // Check if content is an object or string
            if (typeof parsedContent === 'object' && parsedContent.message) {
                expect(parsedContent.message).toContain('Successfully updated text style')
                expect(parsedContent.style).toBeDefined()
                expect(parsedContent.style.name).toContain(`Test ${randomNum}`)
            } else if (typeof content === 'string') {
                expect(content).toContain('Successfully updated text style')
                expect(content).toContain(`Test ${randomNum}`)
            }

            // Verify the update by getting text styles again
            const verifyResult = await callTool({
                name: 'getProjectTextStyles',
                args: undefined,
            })

            const updatedTextStyles = Array.isArray(verifyResult.content) && verifyResult.content[0]?.text
                ? JSON.parse(verifyResult.content[0].text)
                : verifyResult.content

            // The path might have changed due to the name update, so search by the test number instead
            const updatedStyle = updatedTextStyles.find(s => s.path.includes(`Test ${randomNum}`))
            expect(updatedStyle).toBeDefined()
            expect(updatedStyle.fontSize).toBe(`${randomNum}px`)
            expect(updatedStyle.alignment).toBe('center')

            // Restore original values
            await callTool({
                name: 'updateTextStyle',
                args: {
                    stylePath: firstTextStyle.path,
                    updates: {
                        name: firstTextStyle.name,
                        fontSize: firstTextStyle.fontSize,
                        alignment: firstTextStyle.alignment,
                    }
                },
            })
        })
    },
    1000 * 20,
)

function getTextContent(arr: Array<{ type?: string; text?: string } | any> | any) {
    if (!Array.isArray(arr)) return arr
    for (const item of arr) {
        if (
            item &&
            typeof item === 'object' &&
            item.type === 'text' &&
            typeof item.text === 'string'
        ) {
            return item.text
        }
    }
    return arr
}

function tryJsonParse(str: string) {
    try {
        return JSON.parse(str)
    } catch {
        return str
    }
}
