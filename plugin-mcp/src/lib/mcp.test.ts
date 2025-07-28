import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createMCPClient } from './mcp-client.js'

const mcpUrl = 'https://mcp.unframer.co/sse?id=x8v9d9x1ool'

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
                    stylePath: firstColorStyle.path,
                    updates: {
                        name: `${firstColorStyle.name} - Test ${randomNum}`,
                        light: `rgb(${randomNum}, 100, 150)`,
                    }
                },
            })
            
            const content = getTextContent(result.content)
            expect(content).toBeDefined()
            
            // Check if content is an object or string
            if (typeof content === 'object' && content.message) {
                expect(content.message).toContain('Successfully updated color style')
                expect(content.message).toContain(`Test ${randomNum}`)
            } else {
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
            
            const updatedStyle = updatedColorStyles.find(s => s.path === firstColorStyle.path)
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
        
        it('should search fonts', async () => {
            const result = await callTool({
                name: 'searchFonts',
                args: {
                    query: 'Inter',
                },
            })
            
            const content = getTextContent(result.content)
            expect(content).toBeDefined()
            expect(content.message).toBeDefined()
            expect(content.results).toBeDefined()
            expect(Array.isArray(content.results)).toBe(true)
            expect(content.totalMatches).toBeGreaterThanOrEqual(0)
            
            // Check if results have proper structure
            if (content.results.length > 0) {
                const firstFont = content.results[0]
                expect(firstFont).toHaveProperty('family')
                expect(firstFont).toHaveProperty('selector')
                expect(firstFont).toHaveProperty('weight')
                expect(firstFont).toHaveProperty('style')
                
                // Verify the query matches in selector
                expect(firstFont.selector.toLowerCase()).toContain('inter')
            }
            
            // Test that results are limited to 20
            expect(content.results.length).toBeLessThanOrEqual(20)
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
                
            expect(textStyles.length).toBeGreaterThan(0)
            const firstTextStyle = textStyles[0]
            
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
            
            // Check if content is an object or string
            if (typeof content === 'object' && content.message) {
                expect(content.message).toContain('Successfully updated text style')
                expect(content.message).toContain(`Test ${randomNum}`)
            } else {
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
            
            const updatedStyle = updatedTextStyles.find(s => s.path === firstTextStyle.path)
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
