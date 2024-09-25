import { describe, expect, test } from 'vitest'
import { cleanupOldTextTree, oldTextTreeToXml } from 'website/src/lib/utils'

import fs from 'fs'
import path from 'path'

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
