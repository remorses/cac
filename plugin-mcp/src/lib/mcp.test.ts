import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createMCPClient } from './mcp-client.js'

const mcpUrl =
    'https://mcp.unframer.co/sse?id=598f176d590e612e9b6bcaebb54abb0a8763c6f54ba5b9c136690ff9ad2400cc&secret=FpGeQQcnvd9CpFvZwEdONuAjEX7c6AwJ'

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

        it('should update a color style', async () => {
            // First get project XML to find color styles
            const projectResult = await callTool({
                name: 'getProjectXml',
                args: undefined,
            })

            const projectXml = getTextContent(projectResult.content)
            expect(projectXml).toBeDefined()

            // Extract color styles from project XML using regex
            const colorStyleMatch = projectXml.match(
                /<ColorStyle\s+path="([^"]+)"\s+light="([^"]+)"\s+dark="([^"]*)"/,
            )
            expect(colorStyleMatch).toBeTruthy()

            const firstColorStyle = {
                path: colorStyleMatch[1],
                light: colorStyleMatch[2],
                dark: colorStyleMatch[3] || null,
            }

            // Update the color style
            const randomNum = Math.floor(Math.random() * 255)
            const result = await callTool({
                name: 'manageColorStyle',
                args: {
                    type: 'update',
                    stylePath: firstColorStyle.path || 'test-style',
                    properties: {
                        light: `rgb(${randomNum}, 100, 150)`,
                    },
                },
            })

            const content = getTextContent(result.content)
            expect(content).toBeDefined()

            // Parse the content if it's a JSON string
            const parsedContent =
                typeof content === 'string' && content.trim().startsWith('{')
                    ? tryJsonParse(content)
                    : content

            // Check if content is an object or string
            if (typeof parsedContent === 'object' && parsedContent.message) {
                expect(parsedContent.message).toContain(
                    'Successfully updated color style',
                )
                // The response might not include the full style object
                if (parsedContent.style && parsedContent.style.name) {
                    expect(parsedContent.style.name).toContain(
                        `Test ${randomNum}`,
                    )
                }
            } else if (typeof content === 'string') {
                expect(content).toContain('Successfully updated color style')
                expect(content).toContain(`Test ${randomNum}`)
            }

            // Verify the update by getting project XML again
            const verifyResult = await callTool({
                name: 'getProjectXml',
                args: undefined,
            })

            const verifyXml = getTextContent(verifyResult.content)
            expect(verifyXml).toBeDefined()

            // Check if the updated style is in the XML
            const escapedPath = firstColorStyle.path.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&',
            )
            const updatedStyleRegex = new RegExp(
                `<ColorStyle\\s+path="${escapedPath}"\\s+light="rgb\\(${randomNum}, 100, 150\\)"`,
            )
            expect(verifyXml).toMatch(updatedStyleRegex)

            // Restore original value
            await callTool({
                name: 'manageColorStyle',
                args: {
                    type: 'update',
                    stylePath: firstColorStyle.path,
                    properties: {
                        light: firstColorStyle.light,
                    },
                },
            })
        })

        it('should create a new color style', async () => {
            const randomNum = Math.floor(Math.random() * 1000)
            const newStylePath = `/Test-Color-${randomNum}`

            // Create a new color style (name is derived from path)
            const result = await callTool({
                name: 'manageColorStyle',
                args: {
                    type: 'create',
                    stylePath: newStylePath,
                    properties: {
                        light: `rgb(${randomNum % 255}, 100, 200)`,
                        dark: `rgb(${randomNum % 255}, 50, 100)`,
                    },
                },
            })

            const content = getTextContent(result.content)
            expect(content).toBeDefined()

            // Parse the content if it's a JSON string
            const parsedContent =
                typeof content === 'string' && content.trim().startsWith('{')
                    ? tryJsonParse(content)
                    : content

            // Check if creation was successful
            if (typeof parsedContent === 'object' && parsedContent.message) {
                expect(parsedContent.message).toContain(
                    'Successfully created color style',
                )
                expect(parsedContent.style.path).toBe(newStylePath)
                // Name is derived from the last segment of the path
                expect(parsedContent.style.name).toBe(`Test-Color-${randomNum}`)
                expect(parsedContent.style.light).toBe(
                    `rgb(${randomNum % 255}, 100, 200)`,
                )
                expect(parsedContent.style.dark).toBe(
                    `rgb(${randomNum % 255}, 50, 100)`,
                )
            } else if (typeof content === 'string') {
                expect(content).toContain('Successfully created color style')
                expect(content).toContain(`Test-Color-${randomNum}`)
            }

            // Verify the style exists by getting project XML
            const verifyResult = await callTool({
                name: 'getProjectXml',
                args: undefined,
            })

            const verifyXml = getTextContent(verifyResult.content)
            expect(verifyXml).toBeDefined()

            // Check if the created style is in the XML
            const createdStyleRegex = new RegExp(
                `<ColorStyle\\s+path="${newStylePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s+light="rgb\\(${randomNum % 255}, 100, 200\\)"\\s+dark="rgb\\(${randomNum % 255}, 50, 100\\)"`,
            )
            expect(verifyXml).toMatch(createdStyleRegex)

            // Test creating duplicate should fail
            const duplicateResult = await callTool({
                name: 'manageColorStyle',
                args: {
                    type: 'create',
                    stylePath: newStylePath,
                    properties: {
                        light: `rgb(255, 0, 0)`,
                    },
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
            const parsedContent =
                typeof content === 'string' && content.trim().startsWith('{')
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
            const parsedContent =
                typeof content === 'string' && content.trim().startsWith('{')
                    ? tryJsonParse(content)
                    : content

            // The response should be an object with production and staging properties
            expect(parsedContent).toHaveProperty('production')
            expect(parsedContent).toHaveProperty('staging')
        })

        it('should update a text style', async () => {
            // First get project XML to find text styles
            const projectResult = await callTool({
                name: 'getProjectXml',
                args: undefined,
            })

            const projectXml = getTextContent(projectResult.content)
            expect(projectXml).toBeDefined()

            // Extract text styles from project XML using regex
            const textStyleMatch = projectXml.match(
                /<TextStyle\s+path="([^"]+)"[^>]*>/,
            )
            expect(textStyleMatch).toBeTruthy()

            const firstTextStyle = {
                path: textStyleMatch[1],
            }

            // Update the text style
            const randomNum = Math.floor(Math.random() * 100)
            const result = await callTool({
                name: 'manageTextStyle',
                args: {
                    type: 'update',
                    stylePath: firstTextStyle.path,
                    properties: {
                        fontSize: `${randomNum}px`,
                        alignment: 'center',
                    },
                },
            })

            const content = getTextContent(result.content)
            expect(content).toBeDefined()

            // Parse the content if it's a JSON string
            const parsedContent =
                typeof content === 'string' && content.trim().startsWith('{')
                    ? tryJsonParse(content)
                    : content

            // Check if content is an object or string
            if (typeof parsedContent === 'object' && parsedContent.message) {
                expect(parsedContent.message).toContain(
                    'Successfully updated text style',
                )
                expect(parsedContent.style).toBeDefined()
                // Style path should be returned, not name
                expect(parsedContent.style.path).toBe(firstTextStyle.path)
            } else if (typeof content === 'string') {
                expect(content).toContain('Successfully updated text style')
            }

            // Verify the update by getting project XML again
            const verifyResult = await callTool({
                name: 'getProjectXml',
                args: undefined,
            })

            const verifyXml = getTextContent(verifyResult.content)
            expect(verifyXml).toBeDefined()

            // Check if the updated style is in the XML
            const escapedPath = firstTextStyle.path.replace(
                /[.*+?^${}()|[\]\\]/g,
                '\\$&',
            )
            const updatedStyleRegex = new RegExp(
                `<TextStyle\\s+path="${escapedPath}"[^>]*fontSize="${randomNum}px"[^>]*alignment="center"`,
            )
            expect(verifyXml).toMatch(updatedStyleRegex)

            // Restore original values
            await callTool({
                name: 'manageTextStyle',
                args: {
                    type: 'update',
                    stylePath: firstTextStyle.path,
                    properties: {
                        fontSize: '72px', // Reset to default
                        alignment: 'left', // Reset to default
                    },
                },
            })
        })
    },
    1000 * 20,
)

function getTextContent(
    arr: Array<{ type?: string; text?: string } | any> | any,
) {
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
