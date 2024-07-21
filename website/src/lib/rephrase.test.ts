import { rephrase } from 'website/src/lib/elysia.server'
import { test } from 'vitest'

test(
    'rephrase a test template',
    async () => {
        const stream = await rephrase({
            description:
                'A website to generate websites from Notion called Notaku',
            textToReplace,
            exampleTextToMigrate: exampleTextToMigrate as any,
            signal: new AbortController().signal,
        })
        let resultNodeIds = new Set<string>()
        for await (let chunk of stream) {
            
            let prevLen = resultNodeIds.size

            resultNodeIds.add(chunk.nodeId)
            if (resultNodeIds.size === prevLen) {
                console.error('XXX duplicate nodeId', chunk)
            }
            const node = textToReplace.find((x) => x.nodeId === chunk.nodeId)
            if (!node) {
                console.error('XXX node not found', chunk)
            }
            // console.log('chunk', { previous: node?.text, ...chunk })
        }
    },
    1000 * 100,
)

const textToReplace = [
    {
        index: 0,
        nodeId: 'SS1_IlbK4',
        text: 'Get Real Estate income, without owning a house',
        name: 'Hero/Text Content/Heading/Heading',
    },
    {
        index: 1,
        nodeId: 'r85QKi2A3',
        text: 'Average return on investment of 7%',
        name: 'Hero/Text Content/Heading/List/Item/Text',
    },
    {
        index: 2,
        nodeId: 'xNZzVo4o8',
        text: 'Withdraw your funds every 3 months',
        name: 'Hero/Text Content/Heading/List/Item/Text',
    },
    {
        index: 3,
        nodeId: 'Pm2TsJPFV',
        text: 'Investment selection from qualified SGRs',
        name: 'Hero/Text Content/Heading/List/Item/Text',
    },
    {
        index: 4,
        nodeId: 'OGQRRyVtY',
        text: "Helping teams at the world's best companies",
        name: 'Customers/Supporting text',
    },
    {
        index: 5,
        nodeId: 'VcP2b7dBO',
        text: 'Invest in income-generating real estate, easily.',
        name: 'How-it-works/Heading',
    },
    {
        index: 6,
        nodeId: 'PFUEfzvNa',
        text: '1',
        name: 'How-it-works/Text Content/Item/Step no./1',
    },
    {
        index: 7,
        nodeId: 'RdJFsLG7c',
        text: 'Create your profile in 3 minutes',
        name: 'How-it-works/Text Content/Item/Text',
    },
    {
        index: 8,
        nodeId: 'Y1bWcTLsu',
        text: '2',
        name: 'How-it-works/Text Content/Item/Step no./2',
    },
    {
        index: 9,
        nodeId: 'Bssk7Dw7Y',
        text: 'Invest in our real estate portfolio',
        name: 'How-it-works/Text Content/Item/Text',
    },
    {
        index: 10,
        nodeId: 'gaujCenE2',
        text: '3',
        name: 'How-it-works/Text Content/Item/Step no./3',
    },
    {
        index: 11,
        nodeId: 'sgSdApz6H',
        text: 'View the trend of collected rents and appreciation',
        name: 'How-it-works/Text Content/Item/Text',
    },
    {
        index: 12,
        nodeId: 'KmUWluNGN',
        text: '4',
        name: 'How-it-works/Text Content/Item/Step no./4',
    },
    {
        index: 13,
        nodeId: 'MRzIAF1Ol',
        text: 'Request redemption every 3 months, or reinvest your earnings',
        name: 'How-it-works/Text Content/Item/Text',
    },
    {
        index: 14,
        nodeId: 'QLIAZsMFx',
        text: 'Evaluate your potential return',
        name: 'Simulator/Heading and supporting text/Heading and icon/Heading',
    },
    {
        index: 15,
        nodeId: 'v5GFm72p8',
        text: "Whether it's building a passive income stream through rental properties or capitalizing on property appreciation.",
        name: 'Simulator/Heading and supporting text/Supporting text',
    },
    {
        index: 16,
        nodeId: 'gGZMdPVcX',
        text: 'More accessible and secure than going solo',
        name: 'Benefits/Heading',
    },
    {
        index: 17,
        nodeId: 'BIOg3Ncg2',
        text: 'Start without the need for large sums',
        name: 'Benefits/Text Content/Item/_Feature text/Text and supporting text/Text',
    },
    {
        index: 18,
        nodeId: 'XAJKcOOW8',
        text: 'Begin with just $1,500, instead of purchasing an entire property.',
        name: 'Benefits/Text Content/Item/_Feature text/Text and supporting text/Supporting text',
    },
    {
        index: 19,
        nodeId: 'uVCb29QJD',
        text: 'Forget about operational management',
        name: 'Benefits/Text Content/Item/_Feature text/Text and supporting text/Text',
    },
    {
        index: 20,
        nodeId: 'WuRl6Hyhg',
        text: 'No tenant management or unexpected site issues. We take care of it.',
        name: 'Benefits/Text Content/Item/_Feature text/Text and supporting text/Supporting text',
    },
    {
        index: 21,
        nodeId: 'dF7KU7H_S',
        text: 'Get liquidity in 3 months',
        name: 'Benefits/Text Content/Item/_Feature text/Text and supporting text/Text',
    },
    {
        index: 22,
        nodeId: 'GUjrtdfZu',
        text: 'No longer depend on agencies or market conditions.',
        name: 'Benefits/Text Content/Item/_Feature text/Text and supporting text/Supporting text',
    },
    {
        index: 23,
        nodeId: 'PvcCFRx0p',
        text: 'Benefit from diversification',
        name: 'Benefits/Text Content/Item/_Feature text/Text and supporting text/Text',
    },
    {
        index: 24,
        nodeId: 'OvsbDInDl',
        text: 'Avoid concentrating your capital in a single property.',
        name: 'Benefits/Text Content/Item/_Feature text/Text and supporting text/Supporting text',
    },
    {
        index: 25,
        nodeId: 'nk5stNgwE',
        text: 'Impact',
        name: 'Benefits/Item/Text and supporting text/Text',
    },
    {
        index: 26,
        nodeId: 'ZNSqRTPTe',
        text: 'We want to enable everyone to build wealth through real estate.',
        name: 'Benefits/Item/Text and supporting text/Supporting text',
    },
    {
        index: 27,
        nodeId: 'vBnw_mEnl',
        text: 'Transparency',
        name: 'Benefits/Item/Text and supporting text/Text',
    },
    {
        index: 28,
        nodeId: 'N0spmch6X',
        text: 'We operate with utmost transparency with our investors. No surprises.',
        name: 'Benefits/Item/Text and supporting text/Supporting text',
    },
    {
        index: 29,
        nodeId: 'ZtpzDReuy',
        text: 'Simplicity',
        name: 'Benefits/Item/Text and supporting text/Text',
    },
    {
        index: 30,
        nodeId: 'Ez7GQFDih',
        text: 'We focus our energies on making the complex simple.',
        name: 'Benefits/Item/Text and supporting text/Supporting text',
    },
    {
        index: 31,
        nodeId: 'sBye5dU0E',
        text: 'Reliability',
        name: 'Benefits/Item/Text and supporting text/Text',
    },
    {
        index: 32,
        nodeId: 'sLHXEyRh6',
        text: 'We work to provide the safest investment experience.',
        name: 'Benefits/Item/Text and supporting text/Supporting text',
    },
    {
        index: 33,
        nodeId: 'DXU4V16vB',
        text: 'Optimise your return rate and retain more of your income',
        name: 'Metrics/Heading/Heading',
    },
    {
        index: 34,
        nodeId: 'igHOKwwEG',
        text: 'Secure premium profits. We seamlessly provide you with the highest returns. Keep up to an extra 17.6% after taxes. Some of your earnings could be exempt from local and city taxes.',
        name: 'Metrics/Subheading/Text',
    },
    {
        index: 35,
        nodeId: 'EipHOyo0G',
        text: '11.7x',
        name: 'Metrics/Item/Number',
    },
    {
        index: 36,
        nodeId: 'kHlbTp9Qv',
        text: 'Attain prime returns. We effortlessly secure the utmost proceeds possible for you on here',
        name: 'Metrics/Item/Text',
    },
    {
        index: 37,
        nodeId: 'JyH1PN0Mv',
        text: '17.6%',
        name: 'Metrics/Item/Number',
    },
    {
        index: 38,
        nodeId: 'Vwox3zTmj',
        text: 'Retain Up To 17.6% More, Post-Tax. A portion of your income may be free from state and local taxes.',
        name: 'Metrics/Item/Text',
    },
    {
        index: 39,
        nodeId: 'cJAcsVl7T',
        text: '0.45%',
        name: 'Metrics/Item/Number',
    },
    {
        index: 40,
        nodeId: 'W6AjogO7U',
        text: 'Minor fee. We shift your funds when a superior rate emerges from our Premium feature set.',
        name: 'Metrics/Item/Text',
    },
    {
        index: 41,
        nodeId: 'GdtktOrDy',
        text: 'Real estate is the cornerstone to build your wealth.',
        name: 'Features/Heading',
    },
    {
        index: 42,
        nodeId: 'nmbjLnYjg',
        text: 'Improved stability',
        name: 'Features/Item/Text Content/Text',
    },
    {
        index: 43,
        nodeId: 'Rwuqt5rvG',
        text: 'Historically, real estate has provided lower volatility compared to stock investments.',
        name: 'Features/Item/Text Content/Supporting text',
    },
    {
        index: 44,
        nodeId: 'L9Y61DsaF',
        text: 'Steady income',
        name: 'Features/Item/Text Content/Text',
    },
    {
        index: 45,
        nodeId: 'tefWgIUuj',
        text: 'Generate a consistent income through renting without being correlated to the market trends.',
        name: 'Features/Item/Text Content/Supporting text',
    },
    {
        index: 46,
        nodeId: 'aV2icA9HT',
        text: 'Inflation protection',
        name: 'Features/Item/Text Content/Text',
    },
    {
        index: 47,
        nodeId: 'ZtwUSI4jD',
        text: 'Safeguard your investment against inflation with our built-in inflation protection toolset.',
        name: 'Features/Item/Text Content/Supporting text',
    },
    {
        index: 48,
        nodeId: 'qXzMW4gBj',
        text: 'Offriamo ai piccoli investitori la qualità degli investitori istituzionali.',
        name: 'Features#2/Heading/Heading',
    },
    {
        index: 49,
        nodeId: 'OEdynltbl',
        text: 'Entità vigilata  da Banca di Italia',
        name: 'Features#2/Item/Text',
    },
    {
        index: 50,
        nodeId: 'GpjQuak_P',
        text: 'Siamo una SICAF approvata da Banca di Italia e Consob, vigilata costantemente dalle autorità.',
        name: 'Features#2/Item/Supporting text',
    },
    {
        index: 51,
        nodeId: 'co7B89zmA',
        text: 'Learn more',
        name: 'Features#2/Item/Primary Button/Text',
    },
    {
        index: 52,
        nodeId: 'pr9zJKxIX',
        text: 'Massima trasparenza',
        name: 'Features#2/Item/Text',
    },
    {
        index: 53,
        nodeId: 'Cg2oZ9zMm',
        text: 'Monitora i tuoi investimenti, scopri i dettagli delle operazioni. Tutto dalla nostra App.',
        name: 'Features#2/Item/Supporting text',
    },
    {
        index: 54,
        nodeId: 'sYqVHjGdV',
        text: 'Learn more',
        name: 'Features#2/Item/Primary Button/Text',
    },
    {
        index: 55,
        nodeId: 'XoLRo8GTw',
        text: 'Sicurezza e affidabilità',
        name: 'Features#2/Item/Text',
    },
    {
        index: 56,
        nodeId: 'pb7BQRxcQ',
        text: 'I tuoi investimenti sono distinti dal capitale di Part App e in caso di cessazione di operatività non perd',
        name: 'Features#2/Item/Supporting text',
    },
    {
        index: 57,
        nodeId: 'ZYlpRrMcv',
        text: 'Learn more',
        name: 'Features#2/Item/Primary Button/Text',
    },
    {
        index: 58,
        nodeId: 'NCu7_Gelj',
        text: 'Invest in real estate today and start build your wealth',
        name: 'CTA section/Heading',
    },
]

const exampleTextToMigrate = [
    {
        content: 'Notaku',
        hierarchy: 'nav/logo',
        href: '/',
    },
    {
        content: 'Product',
        hierarchy: 'nav/link',
        href: '/product/docs',
    },
    {
        content: 'Showcase',
        hierarchy: 'nav/link',
        href: '/showcase',
    },
    {
        content: 'Pricing',
        hierarchy: 'nav/link',
        href: '/#pricing',
    },
    {
        content: 'Login or Sign Up',
        hierarchy: 'nav/link',
        href: '/',
    },
    {
        content: 'Turn Notion into a professional docs website',
        hierarchy: 'hero/heading',
    },
    {
        content:
            'Publish awesome websites using Notion to manage content. Save 500+ hours of dev work. No design or code skills required.',
        hierarchy: 'hero/paragraph',
    },
    {
        content: 'Get Started',
        hierarchy: 'hero/button',
        href: '/start',
    },
    {
        content: 'Everything you need to publish awesome content',
        hierarchy: 'features/heading',
    },
    {
        content:
            'Notaku can create all the necessary websites for your product',
        hierarchy: 'features/paragraph',
    },
    {
        content: 'Documentation',
        hierarchy: 'features/item',
    },
    {
        content: 'Help Desk',
        hierarchy: 'features/item',
    },
    {
        content: 'Blog',
        hierarchy: 'features/item',
    },
    {
        content: 'Changelog',
        hierarchy: 'features/item',
    },
    {
        content: 'Roadmap',
        hierarchy: 'features/item',
    },
    {
        content: 'All the features you expect and more',
        hierarchy: 'stats/heading',
    },
    {
        content: 'Super fast search',
        hierarchy: 'stats/item',
    },
    {
        content: 'Optimized for speed',
        hierarchy: 'stats/item',
    },
    {
        content: 'Social media images',
        hierarchy: 'stats/item',
    },
    {
        content: 'Excellent SEO, organic traffic goes brrr',
        hierarchy: 'stats/item',
    },
    {
        content: 'Multi language',
        hierarchy: 'stats/item',
    },
    {
        content: 'Collect feedback',
        hierarchy: 'stats/item',
    },
    {
        content: 'Send emails',
        hierarchy: 'stats/item',
    },
    {
        content: 'Ask AI and Semantic Search',
        hierarchy: 'stats/item',
    },
    {
        content: 'Multiple Versions',
        hierarchy: 'stats/item',
    },
    {
        content: 'Subdomain or /subdirectory',
        hierarchy: 'stats/item',
    },
    {
        content: 'Embed in your app with a widget',
        hierarchy: 'stats/item',
    },
    {
        content: 'Pricing Plans',
        hierarchy: 'pricing/heading',
    },
    {
        content: 'VAT not included',
        hierarchy: 'pricing/paragraph',
    },
    {
        content: 'Free',
        hierarchy: 'pricing/plan',
        price: '$0',
    },
    {
        content: 'Basic',
        hierarchy: 'pricing/plan',
        price: '$17',
    },
    {
        content: 'Business',
        hierarchy: 'pricing/plan',
        price: '$37',
    },
    {
        content: 'Business Plus',
        hierarchy: 'pricing/plan',
        price: '$97',
    },
    {
        content: 'Frequently asked questions',
        hierarchy: 'faq/heading',
    },
    {
        content: 'Is there a free trial?',
        hierarchy: 'faq/item/question',
    },
    {
        content:
            'You can try Notaku without a subscription, to get Pro features you will need to buy a subscription. If you are not satisfied you can be refunded within 30 days of purchase.',
        hierarchy: 'faq/item/answer',
    },
    {
        content: 'How are Notion pages counted?',
        hierarchy: 'faq/item/question',
    },
    {
        content:
            'All Notion pages and database items with content inside (not empty pages) are counted. Notion pages connected as versions are not counted but must be below the plan limit.',
        hierarchy: 'faq/item/answer',
    },
    {
        content: 'What happens after I exceed my Notion pages limit?',
        hierarchy: 'faq/item/question',
    },
    {
        content: 'Only part of your Notion pages will be synced.',
        hierarchy: 'faq/item/answer',
    },
    {
        content: 'What Notion blocks are supported?',
        hierarchy: 'faq/item/question',
    },
    {
        content:
            'Notaku supports most blocks from Notion, you can take a look at a demo showing supported blocks here.',
        hierarchy: 'faq/item/answer',
    },
    {
        content: 'Can I create simple Terms of Service and FAQ pages?',
        hierarchy: 'faq/item/question',
    },
    {
        content:
            "Yes, you can use the 'Simple Layout' template to create simple pages like Terms of Service and Privacy Policy.",
        hierarchy: 'faq/item/answer',
    },
    {
        content:
            'Can I use my own analytics service? Can I inject custom code?',
        hierarchy: 'faq/item/question',
    },
    {
        content:
            'Yes, The Notaku dashboard lets you inject custom code, for example to add your own analytics service.',
        hierarchy: 'faq/item/answer',
    },
    {
        content: 'Who is behind Notaku?',
        hierarchy: 'faq/item/question',
    },
    {
        content:
            'I am Tommy, a software engineer living in Italy. you can chat with me on X :)',
        hierarchy: 'faq/item/answer',
    },
    {
        content: 'Company',
        hierarchy: 'footer/heading',
    },
    {
        content: 'Twitter',
        hierarchy: 'footer/link',
        href: 'https://twitter.com/NotakuHQ',
    },
    {
        content: 'Status',
        hierarchy: 'footer/link',
        href: 'https://status.notaku.so',
    },
    {
        content: 'Terms',
        hierarchy: 'footer/link',
        href: '/terms',
    },
    {
        content: 'Privacy',
        hierarchy: 'footer/link',
        href: '/privacy',
    },
    {
        content: 'Refund Policy',
        hierarchy: 'footer/link',
        href: 'https://notaku.so/docs/company/refund-policy',
    },
    {
        content: 'Affiliate program',
        hierarchy: 'footer/link',
        href: '/partner',
    },
    {
        content: 'Mission',
        hierarchy: 'footer/link',
        href: '/docs/company/mission',
    },
    {
        content: 'Resources',
        hierarchy: 'footer/heading',
    },
    {
        content: 'Docs',
        hierarchy: 'footer/link',
        href: '/docs',
    },
    {
        content: 'Blog',
        hierarchy: 'footer/link',
        href: '/blog',
    },
    {
        content: 'Icons generator',
        hierarchy: 'footer/link',
        href: '/notion-icons-generator',
    },
    {
        content: 'Gitbook to Notion',
        hierarchy: 'footer/link',
        href: '/gitbook-importer',
    },
    {
        content: 'Showcase',
        hierarchy: 'footer/link',
        href: '/showcase',
    },
    {
        content: 'Notion image links tool',
        hierarchy: 'footer/link',
        href: '/tools/notion-clickable-images',
    },
    {
        content: 'Notion templates',
        hierarchy: 'footer/heading',
    },
    {
        content: 'Docs template',
        hierarchy: 'footer/link',
        href: 'https://brave-iberis-6ea.notion.site/Notaku-docs-tamplate-6eb4a7eb45f846cbbbe4e666b992013b',
    },
    {
        content: 'Blog template',
        hierarchy: 'footer/link',
        href: 'https://brave-iberis-6ea.notion.site/415a59813d7f49f99783e89c7573d20a',
    },
    {
        content: 'Changelog template',
        hierarchy: 'footer/link',
        href: 'https://brave-iberis-6ea.notion.site/63f6ba64add348e9933ca22a58615941',
    },
    {
        content: 'Comparisons',
        hierarchy: 'footer/heading',
    },
    {
        content: 'Helpkit',
        hierarchy: 'footer/link',
        href: '/comparisons/helpkit',
    },
    {
        content: 'Feather',
        hierarchy: 'footer/link',
        href: '/comparisons/feather',
    },
    {
        content: 'GitBook',
        hierarchy: 'footer/link',
        href: '/comparisons/gitbook',
    },
    {
        content: 'Readme',
        hierarchy: 'footer/link',
        href: '/comparisons/readme',
    },
    {
        content: 'Super',
        hierarchy: 'footer/link',
        href: '/comparisons/super',
    },
]
