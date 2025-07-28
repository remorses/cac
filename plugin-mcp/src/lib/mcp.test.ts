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
                    <404
                        type="WebPageNode"
                        nodeId="vN6zkojot"
                        path="/404"
                    >
                    </404>
                    <Node
                        type="WebPageNode"
                        nodeId="CpFAHygNJ"
                        path="/"
                    >
                    </Node>
                  </Pages>
                  <Components>
                    <Button
                        type="ComponentNode"
                        nodeId="zQ4rhDKqX"
                        name="Button"
                    >
                    </Button>
                    <ElementsBadge
                        type="ComponentNode"
                        nodeId="z0J_SV8Dz"
                        name="Elements/Badge"
                    >
                    </ElementsBadge>
                    <NavigationLinkBase
                        type="ComponentNode"
                        nodeId="mcS7E1YDs"
                        name="Navigation link (Base)"
                    >
                    </NavigationLinkBase>
                    <ElementsMenuButton
                        type="ComponentNode"
                        nodeId="rB3G34C1R"
                        name="Elements/Menu button"
                    >
                    </ElementsMenuButton>
                    <ElementsBrand
                        type="ComponentNode"
                        nodeId="ffMgUGIoc"
                        name="Elements/Brand"
                    >
                    </ElementsBrand>
                    <ElementsSocialIcon
                        type="ComponentNode"
                        nodeId="v2RzCDQ0w"
                        name="Elements/Social icon"
                    >
                    </ElementsSocialIcon>
                    <LandingOneTestimonialCard
                        type="ComponentNode"
                        nodeId="eKRgOK5qL"
                        name="Landing one/Testimonial card"
                    >
                    </LandingOneTestimonialCard>
                    <NavigationLinkGroupBase
                        type="ComponentNode"
                        nodeId="fJQVGYOs7"
                        name="Navigation link group (Base)"
                    >
                    </NavigationLinkGroupBase>
                    <Accordion
                        type="ComponentNode"
                        nodeId="k3BAcovqj"
                        name="Accordion"
                    >
                    </Accordion>
                    <ElementsListItem
                        type="ComponentNode"
                        nodeId="VugzjWbib"
                        name="Elements/List item"
                    >
                    </ElementsListItem>
                    <NavigationsMobileMenu
                        type="ComponentNode"
                        nodeId="zW4H90vyr"
                        name="Navigations/Mobile menu"
                    >
                    </NavigationsMobileMenu>
                    <NavigationNavigation
                        type="ComponentNode"
                        nodeId="sCy40XUNu"
                        name="Navigation/Navigation"
                    >
                    </NavigationNavigation>
                    <PricingContentTab
                        type="ComponentNode"
                        nodeId="m9lpSXt04"
                        name="Pricing content tab"
                    >
                    </PricingContentTab>
                    <CardsServiceCard
                        type="ComponentNode"
                        nodeId="CskAHfjD2"
                        name="Cards/Service card"
                    >
                    </CardsServiceCard>
                    <CardsBenefitsCard
                        type="ComponentNode"
                        nodeId="daU92puF9"
                        name="Cards/Benefits card"
                    >
                    </CardsBenefitsCard>
                    <CardsPortfolioCard
                        type="ComponentNode"
                        nodeId="i4_q8dFVV"
                        name="Cards/Portfolio card"
                    >
                    </CardsPortfolioCard>
                    <ElementsIconButton
                        type="ComponentNode"
                        nodeId="kzzqCUqa6"
                        name="Elements/Icon button"
                    >
                    </ElementsIconButton>
                    <CardsStepCard
                        type="ComponentNode"
                        nodeId="Pn2UNvdjw"
                        name="Cards/Step card"
                    >
                    </CardsStepCard>
                    <NavigationFooter
                        type="ComponentNode"
                        nodeId="EjzI8XskF"
                        name="Navigation/Footer"
                    >
                    </NavigationFooter>
                    <CardsMemberCard
                        type="ComponentNode"
                        nodeId="hE7AVgMDH"
                        name="Cards/Member card"
                    >
                    </CardsMemberCard>
                    <Accordions
                        type="ComponentNode"
                        nodeId="kojOPVURG"
                        name="Accordions"
                    >
                    </Accordions>
                    <CardsPricingFeature
                        type="ComponentNode"
                        nodeId="wUId_7nXO"
                        name="Cards/Pricing feature"
                    >
                    </CardsPricingFeature>
                    <Memoji
                        type="ComponentNode"
                        nodeId="YGyZnk3Uk"
                        name="Memoji"
                    >
                    </Memoji>
                    <Memoji2
                        type="ComponentNode"
                        nodeId="hXOuGnrH3"
                        name="Memoji 2"
                    >
                    </Memoji2>
                  </Components>
                </Project>
              "
            `)
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
