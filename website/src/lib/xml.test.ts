import { expect, test } from 'vitest'
import { cleanupOldTextTree, oldTextTreeToXml } from 'website/src/lib/utils'

import { splitTreeInChunks } from 'website/src/lib/rewrite'

import dedent from 'dedent'
import { default as domSerializer } from 'dom-serializer'
import { DomHandler } from 'domhandler'
import { ElementType, Parser } from 'htmlparser2'
import { rewriteXmlContent } from 'website/src/lib/xml'

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
      "<Stack>
        <AI_Kit_Navigation_Nav_Top_Item nodeId="A3ZxD9MzX">
          Features
        </AI_Kit_Navigation_Nav_Top_Item>
        <AI_Kit_Navigation_Nav_Top_Item nodeId="kEfI03xW5">
          Developers
        </AI_Kit_Navigation_Nav_Top_Item>
        <AI_Kit_Navigation_Nav_Top_Item nodeId="hV4y0l50l">
          Company
        </AI_Kit_Navigation_Nav_Top_Item>
        <AI_Kit_Navigation_Nav_Top_Item nodeId="Kn7sH0z2q">
          Blog
        </AI_Kit_Navigation_Nav_Top_Item>
        <AI_Kit_Navigation_Nav_Top_Item nodeId="QjTxmhFlU">
          Changelog
        </AI_Kit_Navigation_Nav_Top_Item>
      </Stack>
      <Stack>
        <AI_Kit_Button nodeId="LrErZw5ej">
          Join waitlist
        </AI_Kit_Button>
      </Stack>
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
    ]

    const result = splitTreeInChunks(inputTree, 3).map((x) =>
        oldTextTreeToXml(x),
    )
    expect(result).toMatchInlineSnapshot(`
      [
        "<AI_Kit_Nav>
        <Stack>
          <AI_Kit_Navigation_Nav_Top_Item nodeId="A3ZxD9MzX">
            Features
          </AI_Kit_Navigation_Nav_Top_Item>
          <AI_Kit_Navigation_Nav_Top_Item nodeId="kEfI03xW5">
            Developers
          </AI_Kit_Navigation_Nav_Top_Item>
          <AI_Kit_Navigation_Nav_Top_Item nodeId="hV4y0l50l">
            Company
          </AI_Kit_Navigation_Nav_Top_Item>
        </Stack>
      </AI_Kit_Nav>
      ",
        "<AI_Kit_Nav>
        <Stack>
          <AI_Kit_Navigation_Nav_Top_Item nodeId="Kn7sH0z2q">
            Blog
          </AI_Kit_Navigation_Nav_Top_Item>
          <AI_Kit_Navigation_Nav_Top_Item nodeId="QjTxmhFlU">
            Changelog
          </AI_Kit_Navigation_Nav_Top_Item>
        </Stack>
      </AI_Kit_Nav>
      ",
      ]
    `)
})
