import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createMCPClient } from './mcp-client.js'

const mcpUrl = 'https://mcp.unframer.co/sse?id=x8v9d9x1ool'

describe('Framer MCP Server Tests', () => {
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
        expect(tools).toMatchFileSnapshot(`snapshots/tools.json`)
        expect(tools.length).toBeGreaterThan(0)
    })
    it('should get project XML', async () => {
        const result = await callTool({
            name: 'getProjectXml',
            args: undefined,
        })

        expect(getTextContent(result.content)).toMatchInlineSnapshot(`
          "Project structure:
          <Project>
            <Pages>
              <404 type="WebPageNode" path="/404">
              </404>
              <Node type="WebPageNode" path="/">
              </Node>
            </Pages>
            <Components>
              <Button type="ComponentNode" name="Button">
              </Button>
              <ElementsBadge type="ComponentNode" name="Elements/Badge">
              </ElementsBadge>
              <NavigationLinkBase type="ComponentNode" name="Navigation link (Base)">
              </NavigationLinkBase>
              <ElementsMenuButton type="ComponentNode" name="Elements/Menu button">
              </ElementsMenuButton>
              <ElementsBrand type="ComponentNode" name="Elements/Brand">
              </ElementsBrand>
              <ElementsSocialIcon type="ComponentNode" name="Elements/Social icon">
              </ElementsSocialIcon>
              <LandingOneTestimonialCard type="ComponentNode" name="Landing one/Testimonial card">
              </LandingOneTestimonialCard>
              <NavigationLinkGroupBase type="ComponentNode" name="Navigation link group (Base)">
              </NavigationLinkGroupBase>
              <Accordion type="ComponentNode" name="Accordion">
              </Accordion>
              <ElementsListItem type="ComponentNode" name="Elements/List item">
              </ElementsListItem>
              <NavigationsMobileMenu type="ComponentNode" name="Navigations/Mobile menu">
              </NavigationsMobileMenu>
              <NavigationNavigation type="ComponentNode" name="Navigation/Navigation">
              </NavigationNavigation>
              <PricingContentTab type="ComponentNode" name="Pricing content tab">
              </PricingContentTab>
              <CardsServiceCard type="ComponentNode" name="Cards/Service card">
              </CardsServiceCard>
              <CardsBenefitsCard type="ComponentNode" name="Cards/Benefits card">
              </CardsBenefitsCard>
              <CardsPortfolioCard type="ComponentNode" name="Cards/Portfolio card">
              </CardsPortfolioCard>
              <ElementsIconButton type="ComponentNode" name="Elements/Icon button">
              </ElementsIconButton>
              <CardsStepCard type="ComponentNode" name="Cards/Step card">
              </CardsStepCard>
              <NavigationFooter type="ComponentNode" name="Navigation/Footer">
              </NavigationFooter>
              <CardsMemberCard type="ComponentNode" name="Cards/Member card">
              </CardsMemberCard>
              <Accordions type="ComponentNode" name="Accordions">
              </Accordions>
              <CardsPricingFeature type="ComponentNode" name="Cards/Pricing feature">
              </CardsPricingFeature>
              <Memoji type="ComponentNode" name="Memoji">
              </Memoji>
              <Memoji2 type="ComponentNode" name="Memoji 2">
              </Memoji2>
            </Components>
          </Project>
          "
        `)
    })
}, 1000 * 20)

/**
 * Extracts the text content from an array of objects of the form:
 * [{ type: "text", text: "..." }, ...]
 * Returns the first text content if found, otherwise undefined.
 */
function getTextContent(
    arr: Array<{ type?: string; text?: string } | any>,
): string | undefined {
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
