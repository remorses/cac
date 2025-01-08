import { expect, test } from 'vitest'
import {
    bfsOldTextTree,
    cleanupOldTextTree,
    oldTextTreeToXml,
} from 'website/src/lib/utils'

import { splitTreeInChunks } from 'website/src/lib/rewrite'
import fs from 'fs'
import dedent from 'dedent'
import { default as domSerializer } from 'dom-serializer'
import { DomHandler } from 'domhandler'
import { ElementType, Parser } from 'htmlparser2'
import {
    extractObjectsFromXmlContent,
    rewriteXmlContent,
    xmlToOldTextTree,
} from 'website/src/lib/xml'
import path from 'path'

test('splitTreeInChunks long', () => {
    let folder = path.resolve(__dirname, 'evaluation/xml/')
    const xml = fs.readFileSync(path.resolve(folder, 'long.xml'), 'utf8')
    const max = 30
    const tree = xmlToOldTextTree(xml)
    fs.writeFileSync(
        path.resolve(folder, './long-tree.json'),
        JSON.stringify(tree, null, 2),
    )
    const chunks = splitTreeInChunks(tree, max)

    fs.writeFileSync(
        path.resolve(folder, './long-chunked.xml'),
        chunks.map((res) => oldTextTreeToXml(res)).join('\n\n---\n\n'),
    )
    for (let chunk of chunks) {
        const nodes = bfsOldTextTree(chunk)
        expect(nodes.length).toBeLessThanOrEqual(max + 5)
        const withNodeId = nodes.filter((x) => x.nodeId)
        expect(nodes.length).toBeGreaterThan(10)
        expect(withNodeId.length).toBeGreaterThan(3)
    }
})

test('extractObjectsFromXmlContent', ({ expect }) => {
    const xml = dedent`
        Here is an Ai response with the <xml>:
        \`\`\`xml
        <Container>
            <Hero>
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
          "attributes": {
            "color": "blue",
            "fontSize": "20px",
          },
          "newContent": "Hello World",
          "nodeId": "text1",
        },
        {
          "attributes": {
            "size": "large",
            "variant": "primary",
          },
          "newContent": "Click me",
          "nodeId": "btn1",
        },
        {
          "attributes": {},
          "newContent": "Nested content
      with a new line",
          "nodeId": "span1",
        },
      ]
    `)
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

    const result = rewriteXmlContent({ xml: str, newContent })
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
              </AI_Kit_Button></Stack></Header></Hero></Container>"
    `)
})

test('oldTextTreeToXml', async () => {
    const res = oldTextTreeToXml(
        cleanupOldTextTree([
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
        ]),
    )
    expect(res).toMatchInlineSnapshot(`
      "<AiKitNav>
        <Stack>
          <AiKitNavigationNavTopItem nodeId="A3ZxD9MzX">
            Features
          </AiKitNavigationNavTopItem>
          <AiKitNavigationNavTopItem nodeId="kEfI03xW5">
            Developers
          </AiKitNavigationNavTopItem>
          <AiKitNavigationNavTopItem nodeId="hV4y0l50l">
            Company
          </AiKitNavigationNavTopItem>
          <AiKitNavigationNavTopItem nodeId="Kn7sH0z2q">
            Blog
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
        oldTextTreeToXml(x),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "<RemoveButton>
        <Variant1>
          <Text nodeId="xRh2ZBpJM">
            Sign Up With Google
          </Text>
        </Variant1>
      </RemoveButton>
      ",
        "<Closed>
        <Link>
          <Text nodeId="l9D2UPiVw" fontSize="16px">
            Twitter
          </Text>
        </Link>
      </Closed>
      ",
        "<AiKitNavigationNavTopItem nodeId="A3ZxD9MzX">
        Features
      </AiKitNavigationNavTopItem>
      <AiKitNavigationNavTopItem nodeId="kEfI03xW5">
        Developers
      </AiKitNavigationNavTopItem>
      ",
        "<AiKitNavigationNavTopItem nodeId="hV4y0l50l">
        Company
      </AiKitNavigationNavTopItem>
      <AiKitNavigationNavTopItem nodeId="Kn7sH0z2q">
        Blog
      </AiKitNavigationNavTopItem>
      <AiKitNavigationNavTopItem nodeId="QjTxmhFlU">
        Changelog
      </AiKitNavigationNavTopItem>
      ",
      ]
    `)
})
