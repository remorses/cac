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

test('oldTextTreeToXml with 2 top level elements', async () => {
    const res = oldTextTreeToXml(
        cleanupOldTextTree([
            {
                name: '',
                children: [
                    {
                        nodeId: 'BZchDvhMe',
                        name: 'Hero',
                        children: [
                            {
                                nodeId: 'UhPhI4qg3',
                                name: 'Header',
                                children: [
                                    {
                                        nodeId: 'ZUxAHIq5B',
                                        name: 'Stack',
                                        children: [
                                            {
                                                content:
                                                    'Latest integration just arrived',
                                                nodeId: 'iS7Gu1SPs',
                                                name: 'AI Kit/Badge',
                                                children: [],
                                            },
                                            {
                                                content:
                                                    'Boost your rankings with AI.',
                                                nodeId: 'BmPmnKu3U',
                                                name: 'Boost your rankings with AI.',
                                                fontSize: '82px',
                                                children: [],
                                            },
                                            {
                                                content:
                                                    'Elevate your site’s visibility effortlessly with AI, where smart technology meets user-friendly SEO tools.',
                                                nodeId: 'Ga6gDXZIe',
                                                name: 'Elevate your site’s visibility effortlessly with AI, where smart technology meets user-friendly SEO tools.',
                                                fontSize: '20px',
                                                children: [],
                                            },
                                            {
                                                content: 'Start for free',
                                                nodeId: 'PMFOM_SMt',
                                                name: 'AI Kit/Button',
                                                children: [],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        nodeId: 'w9NgBAiLT',
                        name: 'Companies',
                        children: [
                            {
                                content:
                                    'Trusted by the world’s most innovative teams',
                                nodeId: 'y8xplxOnV',
                                name: 'Trusted by the world’s most innovative teams',
                                fontSize: '16px',
                                children: [],
                            },
                            {
                                nodeId: 'rK29SEmyG',
                                name: 'Grid',
                                children: [
                                    {
                                        nodeId: 'sItpsAccH',
                                        name: 'Stack',
                                        children: [
                                            {
                                                nodeId: 'B_BPm601U',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content: 'Acme Corp',
                                                        nodeId: 'vnzxmNCxb',
                                                        name: 'Acme Corp',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'uo5Nvt7fI',
                                        name: 'Stack',
                                        children: [
                                            {
                                                nodeId: 'PYA1g3lVR',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content: 'PULSE',
                                                        nodeId: 'DRefZ4FzF',
                                                        name: 'PULSE',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'mTm3ajY3H',
                                        name: 'Stack',
                                        children: [
                                            {
                                                nodeId: 'KlFMCrAd_',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content: 'Quantum',
                                                        nodeId: 'pS_YhKn9o',
                                                        name: 'Quantum',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'Lbl22zEsH',
                                        name: 'Stack',
                                        children: [
                                            {
                                                nodeId: 'v8b2eaQ6X',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content: 'Echo Valley',
                                                        nodeId: 'AyR81ds0k',
                                                        name: 'Echo Valley',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'j94JZnC4W',
                                        name: 'Stack',
                                        children: [
                                            {
                                                nodeId: 'Ng64f495U',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content: 'Outside',
                                                        nodeId: 'TFRpDFYzu',
                                                        name: 'Outside',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'NW_R8Plmp',
                                        name: 'Stack',
                                        children: [
                                            {
                                                nodeId: 'mOtICHfMc',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content: 'APEX',
                                                        nodeId: 'madIrBbne',
                                                        name: 'APEX',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'WEqEUqT7W',
                                        name: 'Stack',
                                        children: [
                                            {
                                                nodeId: 'Kj8Bnyo5q',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content: 'Celestial',
                                                        nodeId: 'DAMdlcgD8',
                                                        name: 'Celestial',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'ug253CuMG',
                                        name: 'Stack',
                                        children: [
                                            {
                                                nodeId: 'EtzFgH4Jk',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content: '2TWICE',
                                                        nodeId: 'Ue0rEtsfG',
                                                        name: '2TWICE',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        nodeId: 'gtc3EmIp2',
                        name: 'Features',
                        children: [
                            {
                                nodeId: 'dL0qbLywJ',
                                name: 'Stack',
                                children: [
                                    {
                                        content:
                                            'Harness the power of AI, making search engine optimization intuitive and effective for all skill levels.',
                                        nodeId: 'C9Wau5gv1',
                                        name: 'Harness the power of AI, making search engine optimization intuitive and effective for all skill levels.',
                                        fontSize: '32px',
                                        children: [],
                                    },
                                ],
                            },
                            {
                                nodeId: 'bNZOrEGh_',
                                name: 'Grid',
                                children: [
                                    {
                                        nodeId: 'Mz4YV_O6d',
                                        name: 'Card',
                                        children: [
                                            {
                                                nodeId: 'y_hdhDvtC',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content:
                                                            'SEO goal setting',
                                                        nodeId: 'M2ZPHDqe6',
                                                        name: 'SEO goal setting',
                                                        fontSize: '16px',
                                                        children: [],
                                                    },
                                                    {
                                                        content:
                                                            'Helps you set and achieve SEO goals with guided assistance.',
                                                        nodeId: 'UMkipYqxL',
                                                        name: 'Helps you set and achieve SEO goals with guided assistance.',
                                                        fontSize: '16px',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'Mlpy3EK_n',
                                        name: 'Card',
                                        children: [
                                            {
                                                nodeId: 'MeJZijKdL',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content:
                                                            'User-friendly dashboard',
                                                        nodeId: 'kKZ8P977O',
                                                        name: 'User-friendly dashboard',
                                                        fontSize: '16px',
                                                        children: [],
                                                    },
                                                    {
                                                        content:
                                                            'Perform complex SEO audits and optimizations with a single click.',
                                                        nodeId: 'JxpYmedKj',
                                                        name: 'Perform complex SEO audits and optimizations with a single click.',
                                                        fontSize: '16px',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'EEUCjO5IK',
                                        name: 'Card',
                                        children: [
                                            {
                                                nodeId: 'jq6hTVKbG',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content:
                                                            'Visual reports',
                                                        nodeId: 'kxskj_v2Y',
                                                        name: 'Visual reports',
                                                        fontSize: '16px',
                                                        children: [],
                                                    },
                                                    {
                                                        content:
                                                            'Visual insights into your site’s performance.',
                                                        nodeId: 'HybKQJqce',
                                                        name: 'Visual insights into your site’s performance.',
                                                        fontSize: '16px',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'iulqrcdOy',
                                        name: 'Card',
                                        children: [
                                            {
                                                nodeId: 'g9RWJp0vT',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content:
                                                            'Smart Keyword Generator',
                                                        nodeId: 'Lf5rDin2b',
                                                        name: 'Smart Keyword Generator',
                                                        fontSize: '16px',
                                                        children: [],
                                                    },
                                                    {
                                                        content:
                                                            'Automatic suggestions and the best keywords to target.',
                                                        nodeId: 'h1vQET5E8',
                                                        name: 'Automatic suggestions and the best keywords to target.',
                                                        fontSize: '16px',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        nodeId: 'zISvybPEk',
                        name: 'Features',
                        children: [
                            {
                                nodeId: 'g9vfzmj40',
                                name: 'Stack',
                                children: [
                                    {
                                        nodeId: 'TQASS3skC',
                                        name: 'Stack',
                                        children: [
                                            {
                                                content:
                                                    'Elevate your SEO efforts.',
                                                nodeId: 'X7dGENFhp',
                                                name: 'Elevate your SEO efforts.',
                                                fontSize: '56px',
                                                children: [],
                                            },
                                        ],
                                    },
                                    {
                                        nodeId: 'mDudIZrfg',
                                        name: 'Grid',
                                        children: [
                                            {
                                                content:
                                                    'User-friendly dashboard',
                                                nodeId: 'zbeQZf9bH',
                                                name: 'AI Kit/Feature Small',
                                                children: [],
                                            },
                                            {
                                                content: 'Visual reports',
                                                nodeId: 'FphKlAGqu',
                                                name: 'AI Kit/Feature Small',
                                                children: [],
                                            },
                                            {
                                                content:
                                                    'Smart Keyword Generator',
                                                nodeId: 'jbdqbpKVZ',
                                                name: 'AI Kit/Feature Small',
                                                children: [],
                                            },
                                            {
                                                content: 'Content evaluation',
                                                nodeId: 'MXD_Scz1Q',
                                                name: 'AI Kit/Feature Small',
                                                children: [],
                                            },
                                            {
                                                content: 'SEO goal setting',
                                                nodeId: 'cGy8X5Hpo',
                                                name: 'AI Kit/Feature Small',
                                                children: [],
                                            },
                                            {
                                                content: 'Automated alerts',
                                                nodeId: 'B__fIbxz3',
                                                name: 'AI Kit/Feature Small',
                                                children: [],
                                            },
                                            {
                                                content:
                                                    'Link Optimization Wizard',
                                                nodeId: 'pgGDpdOUz',
                                                name: 'AI Kit/Feature Small',
                                                children: [],
                                            },
                                            {
                                                content:
                                                    'One-click optimization',
                                                nodeId: 'G7UR9GpJt',
                                                name: 'AI Kit/Feature Small',
                                                children: [],
                                            },
                                            {
                                                content: 'Competitor reports',
                                                nodeId: 'EHs59gZta',
                                                name: 'AI Kit/Feature Small',
                                                children: [],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        nodeId: 'wpeEYvYqQ',
                        name: 'Testimonial',
                        children: [
                            {
                                nodeId: 'sbjcuFyvl',
                                name: 'Header',
                                children: [
                                    {
                                        content: 'Our clients',
                                        nodeId: 'VnsoGbFNe',
                                        name: 'Our clients',
                                        fontSize: '56px',
                                        children: [],
                                    },
                                    {
                                        content:
                                            'Hear firsthand how our solutions have boosted online success for users like you.',
                                        nodeId: 'dz5DJhQEt',
                                        name: 'Hear firsthand how our solutions have boosted online success for users like you.',
                                        fontSize: '20px',
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        nodeId: 'd9YIQUgmC',
                        name: 'Pricing',
                        children: [
                            {
                                nodeId: 'lbW0eYFEW',
                                name: 'Stack',
                                children: [
                                    {
                                        content: 'Pricing',
                                        nodeId: 'KieeeXdS9',
                                        name: 'Pricing',
                                        fontSize: '56px',
                                        children: [],
                                    },
                                    {
                                        content:
                                            'Choose the right plan to meet your SEO needs and start optimizing today.',
                                        nodeId: 'M1ujC7fU7',
                                        name: 'Choose the right plan to meet your SEO needs and start optimizing today.',
                                        fontSize: '20px',
                                        children: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        nodeId: 'j_mA9teUh',
                        name: 'CTA',
                        children: [
                            {
                                nodeId: 'C5SLgyx0o',
                                name: 'Stack',
                                children: [
                                    {
                                        content: 'AI-driven SEO for everyone.',
                                        nodeId: 'jNbMw8czL',
                                        name: 'AI-driven SEO for everyone.',
                                        fontSize: '56px',
                                        children: [],
                                    },
                                    {
                                        nodeId: 'OE84XDc1q',
                                        name: 'Stack',
                                        children: [
                                            {
                                                nodeId: 'jGDB7ZePL',
                                                name: 'Form',
                                                children: [
                                                    {
                                                        nodeId: 'n5CXi95nr',
                                                        name: 'Label',
                                                        children: [
                                                            {
                                                                content:
                                                                    'Sign up',
                                                                nodeId: 'PHElQduyX',
                                                                name: 'AI Kit/Button Form',
                                                                children: [],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                            {
                                                nodeId: 'W_eOCnbYg',
                                                name: 'Stack',
                                                children: [
                                                    {
                                                        content:
                                                            'No credit card required',
                                                        nodeId: 'rWBTs8Okn',
                                                        name: 'No credit card required',
                                                        fontSize: '14px',
                                                        children: [],
                                                    },
                                                    {
                                                        content: '·',
                                                        nodeId: 'htHwgSLYv',
                                                        name: '·',
                                                        fontSize: '14px',
                                                        children: [],
                                                    },
                                                    {
                                                        content:
                                                            '7-days free trial',
                                                        nodeId: 'iPLEkv3W4',
                                                        name: '7-days free trial',
                                                        fontSize: '14px',
                                                        children: [],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ]),
    )
    expect(res).toMatchInlineSnapshot(`
      "<Hero>
        <Header>
          <Stack>
            <AI_Kit_Badge nodeId="iS7Gu1SPs">
              Latest integration just arrived
            </AI_Kit_Badge>
            <text nodeId="BmPmnKu3U" fontSize="82px">
              Boost your rankings with AI.
            </text>
            <text nodeId="Ga6gDXZIe" fontSize="20px">
              Elevate your site’s visibility effortlessly with AI, where smart technology meets user-friendly SEO tools.
            </text>
            <AI_Kit_Button nodeId="PMFOM_SMt">
              Start for free
            </AI_Kit_Button>
          </Stack>
        </Header>
      </Hero>
      <Companies>
        <text nodeId="y8xplxOnV" fontSize="16px">
          Trusted by the world’s most innovative teams
        </text>
        <Grid>
          <Stack>
            <Stack>
              <text nodeId="vnzxmNCxb">
                Acme Corp
              </text>
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <text nodeId="DRefZ4FzF">
                PULSE
              </text>
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <text nodeId="pS_YhKn9o">
                Quantum
              </text>
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <text nodeId="AyR81ds0k">
                Echo Valley
              </text>
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <text nodeId="TFRpDFYzu">
                Outside
              </text>
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <text nodeId="madIrBbne">
                APEX
              </text>
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <text nodeId="DAMdlcgD8">
                Celestial
              </text>
            </Stack>
          </Stack>
          <Stack>
            <Stack>
              <text nodeId="Ue0rEtsfG">
                2TWICE
              </text>
            </Stack>
          </Stack>
        </Grid>
      </Companies>
      <Features>
        <Stack>
          <text nodeId="C9Wau5gv1" fontSize="32px">
            Harness the power of AI, making search engine optimization intuitive and effective for all skill levels.
          </text>
        </Stack>
        <Grid>
          <Card>
            <Stack>
              <text nodeId="M2ZPHDqe6" fontSize="16px">
                SEO goal setting
              </text>
              <text nodeId="UMkipYqxL" fontSize="16px">
                Helps you set and achieve SEO goals with guided assistance.
              </text>
            </Stack>
          </Card>
          <Card>
            <Stack>
              <text nodeId="kKZ8P977O" fontSize="16px">
                User-friendly dashboard
              </text>
              <text nodeId="JxpYmedKj" fontSize="16px">
                Perform complex SEO audits and optimizations with a single click.
              </text>
            </Stack>
          </Card>
          <Card>
            <Stack>
              <text nodeId="kxskj_v2Y" fontSize="16px">
                Visual reports
              </text>
              <text nodeId="HybKQJqce" fontSize="16px">
                Visual insights into your site’s performance.
              </text>
            </Stack>
          </Card>
          <Card>
            <Stack>
              <text nodeId="Lf5rDin2b" fontSize="16px">
                Smart Keyword Generator
              </text>
              <text nodeId="h1vQET5E8" fontSize="16px">
                Automatic suggestions and the best keywords to target.
              </text>
            </Stack>
          </Card>
        </Grid>
      </Features>
      <Features>
        <Stack>
          <Stack>
            <text nodeId="X7dGENFhp" fontSize="56px">
              Elevate your SEO efforts.
            </text>
          </Stack>
          <Grid>
            <AI_Kit_Feature_Small nodeId="zbeQZf9bH">
              User-friendly dashboard
            </AI_Kit_Feature_Small>
            <AI_Kit_Feature_Small nodeId="FphKlAGqu">
              Visual reports
            </AI_Kit_Feature_Small>
            <AI_Kit_Feature_Small nodeId="jbdqbpKVZ">
              Smart Keyword Generator
            </AI_Kit_Feature_Small>
            <AI_Kit_Feature_Small nodeId="MXD_Scz1Q">
              Content evaluation
            </AI_Kit_Feature_Small>
            <AI_Kit_Feature_Small nodeId="cGy8X5Hpo">
              SEO goal setting
            </AI_Kit_Feature_Small>
            <AI_Kit_Feature_Small nodeId="B__fIbxz3">
              Automated alerts
            </AI_Kit_Feature_Small>
            <AI_Kit_Feature_Small nodeId="pgGDpdOUz">
              Link Optimization Wizard
            </AI_Kit_Feature_Small>
            <AI_Kit_Feature_Small nodeId="G7UR9GpJt">
              One-click optimization
            </AI_Kit_Feature_Small>
            <AI_Kit_Feature_Small nodeId="EHs59gZta">
              Competitor reports
            </AI_Kit_Feature_Small>
          </Grid>
        </Stack>
      </Features>
      <Testimonial>
        <Header>
          <text nodeId="VnsoGbFNe" fontSize="56px">
            Our clients
          </text>
          <text nodeId="dz5DJhQEt" fontSize="20px">
            Hear firsthand how our solutions have boosted online success for users like you.
          </text>
        </Header>
      </Testimonial>
      <Pricing>
        <Stack>
          <text nodeId="KieeeXdS9" fontSize="56px">
            Pricing
          </text>
          <text nodeId="M1ujC7fU7" fontSize="20px">
            Choose the right plan to meet your SEO needs and start optimizing today.
          </text>
        </Stack>
      </Pricing>
      <CTA>
        <Stack>
          <text nodeId="jNbMw8czL" fontSize="56px">
            AI-driven SEO for everyone.
          </text>
          <Stack>
            <Form>
              <Label>
                <AI_Kit_Button_Form nodeId="PHElQduyX">
                  Sign up
                </AI_Kit_Button_Form>
              </Label>
            </Form>
            <Stack>
              <text nodeId="rWBTs8Okn" fontSize="14px">
                No credit card required
              </text>
              <text nodeId="htHwgSLYv" fontSize="14px">
                ·
              </text>
              <text nodeId="iPLEkv3W4" fontSize="14px">
                7-days free trial
              </text>
            </Stack>
          </Stack>
        </Stack>
      </CTA>
      "
    `)
})
