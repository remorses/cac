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
    },
    1000 * 20,
)

function getTextContent(arr: Array<{ type?: string; text?: string } | any>) {
    if (!Array.isArray(arr)) return undefined
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
