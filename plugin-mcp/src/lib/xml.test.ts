import { expect, test } from 'vitest'

import fs from 'fs'
import path from 'path'
import {
    bfsFramerLayersTree,
    extractObjectsFromXmlContent,
    framerLayersTreeToXml,
    rewriteXmlContentForTests,
    splitTreeInChunks,
    xmlToFramerLayersTree
} from 'plugin-mcp'
import dedent from 'string-dedent'

export const ITEMS_PER_ITERATION = 30

const __dirname = path.dirname(new URL(import.meta.url).pathname)

test('splitTreeInChunks long', () => {
    let folder = path.resolve(__dirname, 'evaluation/xml/')
    const xml = fs.readFileSync(path.resolve(folder, 'long.xml'), 'utf8')
    const max = ITEMS_PER_ITERATION
    const tree = xmlToFramerLayersTree(xml)
    fs.writeFileSync(
        path.resolve(folder, './long-tree.json'),
        JSON.stringify(tree, null, 2),
    )
    const chunks = splitTreeInChunks(tree, max)

    fs.writeFileSync(
        path.resolve(folder, './long-chunked.xml'),
        chunks
            .map(
                (res) =>
                    `<-- ${res.reduce((acc, x) => acc + x.count!, 0)} -->\n` +
                    framerLayersTreeToXml(res),
            )
            .join('\n\n---\n\n'),
    )

    // Additional chunk size checks
    for (let chunk of chunks) {
        const nodes = bfsFramerLayersTree(chunk)
        expect(nodes.length).toBeLessThanOrEqual(max * 2)
        const withNodeId = nodes.filter((x) => x.nodeId)
        expect(nodes.length).toBeGreaterThanOrEqual(10)
        expect(withNodeId.length).toBeGreaterThan(1)
    }

    // Get all nodeIds from original tree
    const originalNodes = bfsFramerLayersTree(tree)
    const originalNodeIds = originalNodes
        .filter((x) => x.nodeId)
        .map((x) => x.nodeId)

    // Get all nodeIds from chunked trees
    const chunkedNodeIds = bfsFramerLayersTree(chunks.flat())
        .filter((x) => x.nodeId)
        .map((x) => x.nodeId)

    // Verify nodeIds match
    expect(originalNodeIds).toEqual(chunkedNodeIds)
})

test('extractObjectsFromXmlContent - basic', ({ expect }) => {
    const xml = dedent`
        Here is an Ai response with the <xml>:
        \`\`\`xml
        <Container nodeId="container1">
            <Hero nodeId="hero1">
                <text nodeId="text1" fontSize="20px" color="blue">
                    Hello World
                </text>
                <Button nodeId="btn1" variant="primary" size="large">
                    Click me
                </Button>
                <div >
                    <span nodeId="span1">
                    Nested content
                    with a new line
                    </span>
                </div>
            </Hero>
        </Container>
        \`\`\`

    `

    const results = extractObjectsFromXmlContent(xml)

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "attributes": {},
          "newContent": "",
          "nodeId": "container1",
        },
        {
          "attributes": {},
          "newContent": "",
          "nodeId": "hero1",
          "parentId": "container1",
        },
        {
          "afterNodeId": "btn1",
          "attributes": {
            "color": "blue",
            "fontSize": "20px",
          },
          "newContent": "Hello World",
          "nodeId": "text1",
          "parentId": "hero1",
        },
        {
          "afterNodeId": "span1",
          "attributes": {
            "size": "large",
            "variant": "primary",
          },
          "beforeNodeId": "text1",
          "newContent": "Click me",
          "nodeId": "btn1",
          "parentId": "hero1",
        },
        {
          "attributes": {},
          "beforeNodeId": "btn1",
          "newContent": "Nested content
      with a new line",
          "nodeId": "span1",
          "parentId": "hero1",
        },
      ]
    `)
})

test('extractObjectsFromXmlContent - complex page structure', ({ expect }) => {
    const xml = dedent`
        <Desktop nodeId="desktop1" backgroundColor="/Gray-50">
            <NavigationFlyoutFixed nodeId="nav1" position="fixed" height="84px">
            </NavigationFlyoutFixed>
            <HeroSection nodeId="hero1" position="relative">
                <Container nodeId="container1" maxWidth="1152px">
                    <Content nodeId="content1">
                        <Header nodeId="header1">
                            <BadgeGroup nodeId="badge1">
                                <Text nodeId="text1">
                                    <LeadingText nodeId="lead1" inlineTextStyle="/Heading sm">
                                        4000+
                                    </LeadingText>
                                    <TrailingText nodeId="trail1" inlineTextStyle="/Heading sm">
                                        Users trust us
                                    </TrailingText>
                                </Text>
                            </BadgeGroup>
                            <Heading nodeId="heading1" inlineTextStyle="/undefined - Test 90">
                                Design Better, Faster, Smarter
                            </Heading>
                        </Header>
                    </Content>
                </Container>
            </HeroSection>
        </Desktop>
    `

    const results = extractObjectsFromXmlContent(xml)

    // Add explicit checks for critical relationships
    const nav1 = results.find(n => n.nodeId === 'nav1')
    const hero1 = results.find(n => n.nodeId === 'hero1')
    const badge1 = results.find(n => n.nodeId === 'badge1')
    const heading1 = results.find(n => n.nodeId === 'heading1')
    const lead1 = results.find(n => n.nodeId === 'lead1')
    const trail1 = results.find(n => n.nodeId === 'trail1')
    
    // Check nav1 and hero1 are siblings under desktop1
    expect(nav1?.parentId).toBe('desktop1')
    expect(hero1?.parentId).toBe('desktop1')
    expect(nav1?.afterNodeId).toBe('hero1')
    expect(hero1?.beforeNodeId).toBe('nav1')
    
    // Check badge1 and heading1 are siblings under header1
    expect(badge1?.parentId).toBe('header1')
    expect(heading1?.parentId).toBe('header1')
    expect(badge1?.afterNodeId).toBe('heading1')
    expect(heading1?.beforeNodeId).toBe('badge1')
    
    // Check lead1 and trail1 are siblings under text1
    expect(lead1?.parentId).toBe('text1')
    expect(trail1?.parentId).toBe('text1')
    expect(lead1?.afterNodeId).toBe('trail1')
    expect(trail1?.beforeNodeId).toBe('lead1')
    
    // Check text content is correct
    expect(lead1?.newContent).toBe('4000+')
    expect(trail1?.newContent).toBe('Users trust us')
    expect(heading1?.newContent).toBe('Design Better, Faster, Smarter')

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "attributes": {
            "backgroundColor": "/Gray-50",
          },
          "newContent": "",
          "nodeId": "desktop1",
        },
        {
          "afterNodeId": "hero1",
          "attributes": {
            "height": "84px",
            "position": "fixed",
          },
          "newContent": "",
          "nodeId": "nav1",
          "parentId": "desktop1",
        },
        {
          "attributes": {
            "position": "relative",
          },
          "beforeNodeId": "nav1",
          "newContent": "",
          "nodeId": "hero1",
          "parentId": "desktop1",
        },
        {
          "attributes": {
            "maxWidth": "1152px",
          },
          "newContent": "",
          "nodeId": "container1",
          "parentId": "hero1",
        },
        {
          "attributes": {},
          "newContent": "",
          "nodeId": "content1",
          "parentId": "container1",
        },
        {
          "attributes": {},
          "newContent": "",
          "nodeId": "header1",
          "parentId": "content1",
        },
        {
          "afterNodeId": "heading1",
          "attributes": {},
          "newContent": "",
          "nodeId": "badge1",
          "parentId": "header1",
        },
        {
          "attributes": {},
          "newContent": "",
          "nodeId": "text1",
          "parentId": "badge1",
        },
        {
          "afterNodeId": "trail1",
          "attributes": {
            "inlineTextStyle": "/Heading sm",
          },
          "newContent": "4000+",
          "nodeId": "lead1",
          "parentId": "text1",
        },
        {
          "attributes": {
            "inlineTextStyle": "/Heading sm",
          },
          "beforeNodeId": "lead1",
          "newContent": "Users trust us",
          "nodeId": "trail1",
          "parentId": "text1",
        },
        {
          "attributes": {
            "inlineTextStyle": "/undefined - Test 90",
          },
          "beforeNodeId": "badge1",
          "newContent": "Design Better, Faster, Smarter",
          "nodeId": "heading1",
          "parentId": "header1",
        },
      ]
    `)
})

test('extractObjectsFromXmlContent - node movement scenarios', ({ expect }) => {
    const xml = dedent`
        <Root nodeId="root">
            <ContainerA nodeId="containerA">
                <Item nodeId="item1">Item 1</Item>
                <Item nodeId="item2">Item 2</Item>
            </ContainerA>
            <ContainerB nodeId="containerB">
                <Item nodeId="item3">Item 3</Item>
            </ContainerB>
        </Root>
    `

    const results = extractObjectsFromXmlContent(xml)

    // Verify parent relationships
    const item1 = results.find(n => n.nodeId === 'item1')
    const item2 = results.find(n => n.nodeId === 'item2')
    const item3 = results.find(n => n.nodeId === 'item3')
    
    expect(item1?.parentId).toBe('containerA')
    expect(item2?.parentId).toBe('containerA')
    expect(item3?.parentId).toBe('containerB')
    
    // Verify sibling relationships
    expect(item1?.afterNodeId).toBe('item2')
    expect(item2?.beforeNodeId).toBe('item1')
    expect(item3?.beforeNodeId).toBeUndefined()
    expect(item3?.afterNodeId).toBeUndefined()
})

test('extractObjectsFromXmlContent - deeply nested with missing nodeIds', ({ expect }) => {
    const xml = dedent`
        <Page nodeId="page1">
            <Section nodeId="section1">
                <div>
                    <Content nodeId="content1">
                        <div>
                            <span>
                                <Text nodeId="text1">Hello</Text>
                            </span>
                        </div>
                    </Content>
                </div>
            </Section>
            <Section nodeId="section2">
                <Text nodeId="text2">World</Text>
            </Section>
        </Page>
    `

    const results = extractObjectsFromXmlContent(xml)
    
    const text1 = results.find(n => n.nodeId === 'text1')
    const text2 = results.find(n => n.nodeId === 'text2')
    
    // text1 should have content1 as parent (skipping intermediate divs/spans without nodeIds)
    expect(text1?.parentId).toBe('content1')
    expect(text2?.parentId).toBe('section2')
})

test('extractObjectsFromXmlContent - single children have no siblings', ({ expect }) => {
    const xml = dedent`
        <Page nodeId="page1">
            <Container nodeId="container1">
                <SingleChild nodeId="child1">Only child</SingleChild>
            </Container>
            <Container nodeId="container2">
                <FirstChild nodeId="child2">First</FirstChild>
                <SecondChild nodeId="child3">Second</SecondChild>
                <ThirdChild nodeId="child4">Third</ThirdChild>
            </Container>
        </Page>
    `

    const results = extractObjectsFromXmlContent(xml)
    
    const child1 = results.find(n => n.nodeId === 'child1')
    const child2 = results.find(n => n.nodeId === 'child2')
    const child3 = results.find(n => n.nodeId === 'child3')
    const child4 = results.find(n => n.nodeId === 'child4')
    
    // Single child has no siblings
    expect(child1?.parentId).toBe('container1')
    expect(child1?.beforeNodeId).toBeUndefined()
    expect(child1?.afterNodeId).toBeUndefined()
    
    // Multiple children have correct siblings
    expect(child2?.beforeNodeId).toBeUndefined()
    expect(child2?.afterNodeId).toBe('child3')
    
    expect(child3?.beforeNodeId).toBe('child2')
    expect(child3?.afterNodeId).toBe('child4')
    
    expect(child4?.beforeNodeId).toBe('child3')
    expect(child4?.afterNodeId).toBeUndefined()
})

test('xml partial content, rewriteXmlContent', () => {
    const str = dedent`
  <Container>
    <Hero>
      <Header>
        <Stack>
          <AI_Kit_Badge nodeId="kvaze3i5">
          badge
          </AI_Kit_Badge>
          <text nodeId="BmPmnKu3U" fontSize="82px">
            The web builder for stunning sites.
          </text>
          <text nodeId="Ga6gDXZIe" fontSize="20px">
            Design and publish modern sites at any scale with Framer's web builder.
          </text>
          <AI_Kit_Button nodeId="rgayf1f9">
            Sign up for free
          </AI_Kit_Button>

  `

    const newContent = [
        {
            nodeId: 'BmPmnKu3U',
            newContent: 'Hero replaced',
        },
        {
            nodeId: 'Ga6gDXZIe',
            newContent: 'Description replaced',
        },
        { nodeId: 'rgayf1f9', newContent: 'cta replaced' },
    ]

    const result = rewriteXmlContentForTests({ xml: str, newContent })
    expect(result).toMatchInlineSnapshot(`
          "<Container>
            <Hero>
              <Header>
                <Stack>
                  <AI_Kit_Badge nodeId="kvaze3i5">
                  badge
                  </AI_Kit_Badge>
                  <text nodeId="BmPmnKu3U" fontSize="82px">
                    Hero replaced
                  </text>
                  <text nodeId="Ga6gDXZIe" fontSize="20px">
                    Description replaced
                  </text>
                  <AI_Kit_Button nodeId="rgayf1f9">
                    cta replaced
                  </AI_Kit_Button>
          </Stack></Header></Hero></Container>"
        `)
})

test('oldTextTreeToXml', async () => {
    const res = framerLayersTreeToXml([
        {
            name: 'AI Kit/Nav',
            children: [
                {
                    nodeId: 'O6ldbjyTJ',
                    name: 'Stack',
                    children: [
                        {
                            content: 'Features',
                            nodeId: 'A3ZxD9MzX',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            children: [],
                        },
                        {
                            content: 'Developers',
                            nodeId: 'kEfI03xW5',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            children: [],
                        },
                        {
                            content: 'Company',
                            nodeId: 'hV4y0l50l',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            attributes: {
                                anObject: JSON.stringify({ a: 1, b: 2 }),
                                anArray: JSON.stringify([1, 2, 3]),
                            },
                            attrControlsComments: {
                                anObject: 'An object',
                                anArray: 'An array',
                            },
                            children: [],
                        },
                        {
                            content: 'Blog',
                            nodeId: 'Kn7sH0z2q',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            attributes: {
                                bool: 'true',
                                shouldBeHidden: 'false',
                            },
                            attrControlsComments: {
                                shouldBeHidden: '',
                            },
                            children: [
                                {
                                    content: 'Nested content',
                                    nodeId: 'a1b2c3',
                                    name: 'AI Kit/Navigation/Nav Top Item/Nested',
                                    children: [],
                                },
                            ],
                        },
                        {
                            content: 'Changelog',
                            nodeId: 'QjTxmhFlU',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            children: [],
                        },
                    ],
                },
                {
                    nodeId: 'JGJDKjLQs',
                    name: 'Stack',
                    children: [
                        {
                            content: 'Join waitlist',
                            nodeId: 'LrErZw5ej',
                            name: 'AI Kit/Button',
                            children: [],
                        },
                    ],
                },
            ],
        },
    ])
    expect(res).toMatchInlineSnapshot(`
      "<AiKitNav>
        <Stack>
          <AiKitNavigationNavTopItem nodeId="A3ZxD9MzX">
            Features
          </AiKitNavigationNavTopItem>
          <AiKitNavigationNavTopItem nodeId="kEfI03xW5">
            Developers
          </AiKitNavigationNavTopItem>
          <AiKitNavigationNavTopItem
              nodeId="hV4y0l50l"
              <!-- An object -->
              anObject="{"a":1,"b":2}"
              <!-- An array -->
              anArray="[1,2,3]"
          >
            Company
          </AiKitNavigationNavTopItem>
          <AiKitNavigationNavTopItem bool="true" shouldBeHidden="false">
            Blog
            <AiKitNavigationNavTopItemNested nodeId="a1b2c3">
              Nested content
            </AiKitNavigationNavTopItemNested>
          </AiKitNavigationNavTopItem>
          <AiKitNavigationNavTopItem nodeId="QjTxmhFlU">
            Changelog
          </AiKitNavigationNavTopItem>
        </Stack>
        <Stack>
          <AiKitButton nodeId="LrErZw5ej">
            Join waitlist
          </AiKitButton>
        </Stack>
      </AiKitNav>
      "
    `)
})

test('splitTreeInChunks', () => {
    const inputTree = [
        {
            name: 'AI Kit/Nav',
            children: [
                {
                    nodeId: 'O6ldbjyTJ',
                    name: 'Stack',
                    children: [
                        {
                            content: 'Features',
                            nodeId: 'A3ZxD9MzX',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            children: [],
                        },
                        {
                            content: 'Developers',
                            nodeId: 'kEfI03xW5',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            children: [],
                        },
                        {
                            content: 'Company',
                            nodeId: 'hV4y0l50l',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            children: [],
                        },
                        {
                            content: 'Blog',
                            nodeId: 'Kn7sH0z2q',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            children: [],
                        },
                        {
                            content: 'Changelog',
                            nodeId: 'QjTxmhFlU',
                            name: 'AI Kit/Navigation/Nav Top Item',
                            children: [],
                        },
                    ],
                },
            ],
        },
        {
            name: 'Navigation/twitterProfilePreview',
            children: [
                {
                    name: 'Closed',
                    children: [
                        {
                            name: 'Link',
                            children: [
                                {
                                    name: 'Text',
                                    nodeId: 'l9D2UPiVw',
                                    attributes: {
                                        fontSize: '16px',
                                    },
                                    content: 'Twitter',
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            name: 'RemoveButton',
            children: [
                {
                    name: 'Variant1',
                    children: [
                        {
                            name: 'Text',
                            nodeId: 'xRh2ZBpJM',
                            content: 'Sign Up With Google',
                            children: [],
                        },
                    ],
                },
            ],
        },
    ]

    const result = splitTreeInChunks(inputTree, 3).map((x) =>
        framerLayersTreeToXml(x),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "<AiKitNav>
        <Stack>
          <AiKitNavigationNavTopItem nodeId="A3ZxD9MzX">
            Features
          </AiKitNavigationNavTopItem>
        </Stack>
      </AiKitNav>
      ",
        "<AiKitNav>
        <Stack>
          <AiKitNavigationNavTopItem nodeId="kEfI03xW5">
            Developers
          </AiKitNavigationNavTopItem>
        </Stack>
      </AiKitNav>
      ",
        "<AiKitNav>
        <Stack>
          <AiKitNavigationNavTopItem nodeId="hV4y0l50l">
            Company
          </AiKitNavigationNavTopItem>
        </Stack>
      </AiKitNav>
      ",
        "<AiKitNav>
        <Stack>
          <AiKitNavigationNavTopItem nodeId="Kn7sH0z2q">
            Blog
          </AiKitNavigationNavTopItem>
        </Stack>
      </AiKitNav>
      ",
        "<AiKitNav>
        <Stack>
          <AiKitNavigationNavTopItem nodeId="QjTxmhFlU">
            Changelog
          </AiKitNavigationNavTopItem>
        </Stack>
      </AiKitNav>
      ",
        "<NavigationTwitterProfilePreview>
        <Closed>
          <Link>
            <Text nodeId="l9D2UPiVw" fontSize="16px">
              Twitter
            </Text>
          </Link>
        </Closed>
      </NavigationTwitterProfilePreview>
      ",
        "<RemoveButton>
        <Variant1>
          <Text nodeId="xRh2ZBpJM">
            Sign Up With Google
          </Text>
        </Variant1>
      </RemoveButton>
      ",
      ]
    `)
})
