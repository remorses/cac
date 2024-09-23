import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import dedent from 'dedent'
import { expect, test } from 'vitest'
import {
    convertExamplesToMarkdownList,
    rewriteTemplateContent,
} from 'website/src/lib/rewrite'
import {
    NDJSONStream,
    removeMarkdownSnippets,
    splitStringButKeepChar,
} from 'website/src/lib/ndjson'

test(
    'rewrite a test template',
    async () => {
        const stream = await rewriteTemplateContent({
            description:
                'A website to generate websites from Notion called Notaku',
            textToReplace,
            exampleTextToMigrate: exampleTextToMigrate as any,
            sourceHtml: null,
            signal: new AbortController().signal,
            onToken(token) {
                process.stdout.write(token)
            },
        })
        let resultNodeIds = new Set<string>()
        let results = [] as any[]
        for await (let chunk of stream) {
            let prevLen = resultNodeIds.size

            let object = chunk.object
            // if (chunk.finalObject) {
            //     console.log('reasoning', chunk.finalObject.stepByStepReasoning)
            // }
            if (object) {
                console.log('object', object)
                resultNodeIds.add(object.nodeId!)
                if (resultNodeIds.size === prevLen) {
                    console.error('XXX duplicate nodeId', object)
                }
                const node = textToReplace.find(
                    (x) => x.nodeId === object.nodeId,
                )
                if (!node) {
                    console.error(
                        'XXX LLM returned text for a non existent previous node',
                        object,
                    )
                }
                const { nodeId, ...interestingFields } = object
                results.push({
                    name: node?.name,
                    previousText: node?.text,
                    ...interestingFields,
                })
            }

            // console.log('chunk', { previous: node?.text, ...chunk })
        }
        let missingNodes = textToReplace.filter(
            (x) => !resultNodeIds.has(x.nodeId),
        )
        if (missingNodes.length) {
            console.error('missing nodes', missingNodes)
            console.error(`there were ${missingNodes.length} missing nodes`)
        }
        expect(results).toMatchInlineSnapshot(`
          [
            {
              "content": "Turn Notion into a professional docs website",
              "name": "Hero/Text Content/Heading/Heading",
              "previousContent": "Get Real Estate income, without owning a house",
              "previousText": "Get Real Estate income, without owning a house",
            },
            {
              "content": "Publish awesome websites using Notion to manage content",
              "name": "Hero/Text Content/Heading/List/Item/Text",
              "previousContent": "Average return on investment of 7%",
              "previousText": "Average return on investment of 7%",
            },
            {
              "content": "Save 500+ hours of dev work",
              "name": "Hero/Text Content/Heading/List/Item/Text",
              "previousContent": "Withdraw your funds every 3 months",
              "previousText": "Withdraw your funds every 3 months",
            },
            {
              "content": "No design or code skills required",
              "name": "Hero/Text Content/Heading/List/Item/Text",
              "previousContent": "Investment selection from qualified SGRs",
              "previousText": "Investment selection from qualified SGRs",
            },
            {
              "content": "Helping teams create stunning websites",
              "name": "Customers/Supporting text",
              "previousContent": "Helping teams at the world's best companies",
              "previousText": "Helping teams at the world's best companies",
            },
            {
              "content": "Easily publish your content with Notaku",
              "name": "How-it-works/Heading",
              "previousContent": "Invest in income-generating real estate, easily.",
              "previousText": "Invest in income-generating real estate, easily.",
            },
            {
              "content": "1",
              "name": "How-it-works/Text Content/Item/Step no./1",
              "previousContent": "1",
              "previousText": "1",
            },
            {
              "content": "Create your Notaku account in just 3 minutes",
              "name": "How-it-works/Text Content/Item/Text",
              "previousContent": "Create your profile in 3 minutes",
              "previousText": "Create your profile in 3 minutes",
            },
            {
              "content": "2",
              "name": "How-it-works/Text Content/Item/Step no./2",
              "previousContent": "2",
              "previousText": "2",
            },
            {
              "content": "Transform your Notion pages into a website",
              "name": "How-it-works/Text Content/Item/Text",
              "previousContent": "Invest in our real estate portfolio",
              "previousText": "Invest in our real estate portfolio",
            },
            {
              "content": "3",
              "name": "How-it-works/Text Content/Item/Step no./3",
              "previousContent": "3",
              "previousText": "3",
            },
            {
              "content": "Preview your website's performance and updates",
              "name": "How-it-works/Text Content/Item/Text",
              "previousContent": "View the trend of collected rents and appreciation",
              "previousText": "View the trend of collected rents and appreciation",
            },
            {
              "content": "4",
              "name": "How-it-works/Text Content/Item/Step no./4",
              "previousContent": "4",
              "previousText": "4",
            },
            {
              "content": "Launch your site and start sharing it",
              "name": "How-it-works/Text Content/Item/Text",
              "previousContent": "Request redemption every 3 months, or reinvest your earnings",
              "previousText": "Request redemption every 3 months, or reinvest your earnings",
            },
            {
              "content": "Explore your website's potential",
              "name": "Simulator/Heading and supporting text/Heading and icon/Heading",
              "previousContent": "Evaluate your potential return",
              "previousText": "Evaluate your potential return",
            },
            {
              "content": "Whether you're creating documentation or a blog, Notaku makes it easy.",
              "name": "Simulator/Heading and supporting text/Supporting text",
              "previousContent": "Whether it's building a passive income stream through rental properties or capitalizing on property appreciation.",
              "previousText": "Whether it's building a passive income stream through rental properties or capitalizing on property appreciation.",
            },
            {
              "content": "More accessible and intuitive than traditional web design",
              "name": "Benefits/Heading",
              "previousContent": "More accessible and secure than going solo",
              "previousText": "More accessible and secure than going solo",
            },
            {
              "content": "Start without any coding experience",
              "name": "Benefits/Text Content/Item/_Feature text/Text and supporting text/Text",
              "previousContent": "Start without the need for large sums",
              "previousText": "Start without the need for large sums",
            },
            {
              "content": "Begin with just your Notion content, no extra tools needed",
              "name": "Benefits/Text Content/Item/_Feature text/Text and supporting text/Supporting text",
              "previousContent": "Begin with just $1,500, instead of purchasing an entire property.",
              "previousText": "Begin with just $1,500, instead of purchasing an entire property.",
            },
            {
              "content": "Forget about complex website management",
              "name": "Benefits/Text Content/Item/_Feature text/Text and supporting text/Text",
              "previousContent": "Forget about operational management",
              "previousText": "Forget about operational management",
            },
            {
              "content": "No design hassles or technical issues; we handle everything.",
              "name": "Benefits/Text Content/Item/_Feature text/Text and supporting text/Supporting text",
              "previousContent": "No tenant management or unexpected site issues. We take care of it.",
              "previousText": "No tenant management or unexpected site issues. We take care of it.",
            },
            {
              "content": "Get your website live in no time",
              "name": "Benefits/Text Content/Item/_Feature text/Text and supporting text/Text",
              "previousContent": "Get liquidity in 3 months",
              "previousText": "Get liquidity in 3 months",
            },
            {
              "content": "No need for external agencies or expertise",
              "name": "Benefits/Text Content/Item/_Feature text/Text and supporting text/Supporting text",
              "previousContent": "No longer depend on agencies or market conditions.",
              "previousText": "No longer depend on agencies or market conditions.",
            },
            {
              "content": "Experience the benefits of a versatile platform",
              "name": "Benefits/Text Content/Item/_Feature text/Text and supporting text/Text",
              "previousContent": "Benefit from diversification",
              "previousText": "Benefit from diversification",
            },
            {
              "content": "Avoid getting stuck with a single design; use Notaku for multiple projects",
              "name": "Benefits/Text Content/Item/_Feature text/Text and supporting text/Supporting text",
              "previousContent": "Avoid concentrating your capital in a single property.",
              "previousText": "Avoid concentrating your capital in a single property.",
            },
            {
              "content": "Empowerment",
              "name": "Benefits/Item/Text and supporting text/Text",
              "previousContent": "Impact",
              "previousText": "Impact",
            },
            {
              "content": "We aim to empower everyone to create stunning websites effortlessly.",
              "name": "Benefits/Item/Text and supporting text/Supporting text",
              "previousContent": "We want to enable everyone to build wealth through real estate.",
              "previousText": "We want to enable everyone to build wealth through real estate.",
            },
            {
              "content": "Clarity",
              "name": "Benefits/Item/Text and supporting text/Text",
              "previousContent": "Transparency",
              "previousText": "Transparency",
            },
            {
              "content": "We ensure clear communication with our users; no hidden fees or surprises.",
              "name": "Benefits/Item/Text and supporting text/Supporting text",
              "previousContent": "We operate with utmost transparency with our investors. No surprises.",
              "previousText": "We operate with utmost transparency with our investors. No surprises.",
            },
            {
              "content": "Ease of Use",
              "name": "Benefits/Item/Text and supporting text/Text",
              "previousContent": "Simplicity",
              "previousText": "Simplicity",
            },
            {
              "content": "Our platform is designed to make website creation straightforward and intuitive.",
              "name": "Benefits/Item/Text and supporting text/Supporting text",
              "previousContent": "We focus our energies on making the complex simple.",
              "previousText": "We focus our energies on making the complex simple.",
            },
            {
              "content": "Dependability",
              "name": "Benefits/Item/Text and supporting text/Text",
              "previousContent": "Reliability",
              "previousText": "Reliability",
            },
            {
              "content": "We strive to deliver a reliable and secure website building experience.",
              "name": "Benefits/Item/Text and supporting text/Supporting text",
              "previousContent": "We work to provide the safest investment experience.",
              "previousText": "We work to provide the safest investment experience.",
            },
            {
              "content": "Maximize your website's potential and reach a wider audience",
              "name": "Metrics/Heading/Heading",
              "previousContent": "Optimise your return rate and retain more of your income",
              "previousText": "Optimise your return rate and retain more of your income",
            },
            {
              "content": "Leverage Notaku to enhance your online presence and attract more visitors. Enjoy increased engagement and traffic to your site.",
              "name": "Metrics/Subheading/Text",
              "previousContent": "Secure premium profits. We seamlessly provide you with the highest returns. Keep up to an extra 17.6% after taxes. Some of your earnings could be exempt from local and city taxes.",
              "previousText": "Secure premium profits. We seamlessly provide you with the highest returns. Keep up to an extra 17.6% after taxes. Some of your earnings could be exempt from local and city taxes.",
            },
            {
              "content": "5x",
              "name": "Metrics/Item/Number",
              "previousContent": "11.7x",
              "previousText": "11.7x",
            },
            {
              "content": "Achieve exceptional results with our user-friendly tools and resources.",
              "name": "Metrics/Item/Text",
              "previousContent": "Attain prime returns. We effortlessly secure the utmost proceeds possible for you on here",
              "previousText": "Attain prime returns. We effortlessly secure the utmost proceeds possible for you on here",
            },
            {
              "content": "25%",
              "name": "Metrics/Item/Number",
              "previousContent": "17.6%",
              "previousText": "17.6%",
            },
            {
              "content": "Experience up to 25% more engagement with our optimized website templates.",
              "name": "Metrics/Item/Text",
              "previousContent": "Retain Up To 17.6% More, Post-Tax. A portion of your income may be free from state and local taxes.",
              "previousText": "Retain Up To 17.6% More, Post-Tax. A portion of your income may be free from state and local taxes.",
            },
            {
              "content": "Minimal fees",
              "name": "Metrics/Item/Number",
              "previousContent": "0.45%",
              "previousText": "0.45%",
            },
            {
              "content": "Enjoy low fees while using our platform, ensuring more value for your investment.",
              "name": "Metrics/Item/Text",
              "previousContent": "Minor fee. We shift your funds when a superior rate emerges from our Premium feature set.",
              "previousText": "Minor fee. We shift your funds when a superior rate emerges from our Premium feature set.",
            },
            {
              "content": "Notaku is your foundation for building an impressive online presence.",
              "name": "Features/Heading",
              "previousContent": "Real estate is the cornerstone to build your wealth.",
              "previousText": "Real estate is the cornerstone to build your wealth.",
            },
            {
              "content": "Increased reliability",
              "name": "Features/Item/Text Content/Text",
              "previousContent": "Improved stability",
              "previousText": "Improved stability",
            },
            {
              "content": "Our platform offers stability, minimizing risks associated with website management.",
              "name": "Features/Item/Text Content/Supporting text",
              "previousContent": "Historically, real estate has provided lower volatility compared to stock investments.",
              "previousText": "Historically, real estate has provided lower volatility compared to stock investments.",
            },
            {
              "content": "Consistent performance",
              "name": "Features/Item/Text Content/Text",
              "previousContent": "Steady income",
              "previousText": "Steady income",
            },
            {
              "content": "Achieve consistent traffic and engagement without relying on volatile trends.",
              "name": "Features/Item/Text Content/Supporting text",
              "previousContent": "Generate a consistent income through renting without being correlated to the market trends.",
              "previousText": "Generate a consistent income through renting without being correlated to the market trends.",
            },
            {
              "content": "Future-proof your website",
              "name": "Features/Item/Text Content/Text",
              "previousContent": "Inflation protection",
              "previousText": "Inflation protection",
            },
            {
              "content": "Ensure your website remains relevant and effective with our adaptive tools.",
              "name": "Features/Item/Text Content/Supporting text",
              "previousContent": "Safeguard your investment against inflation with our built-in inflation protection toolset.",
              "previousText": "Safeguard your investment against inflation with our built-in inflation protection toolset.",
            },
            {
              "content": "We provide small businesses with the same quality tools as large enterprises.",
              "name": "Features#2/Heading/Heading",
              "previousContent": "Offriamo ai piccoli investitori la qualità degli investitori istituzionali.",
              "previousText": "Offriamo ai piccoli investitori la qualità degli investitori istituzionali.",
            },
            {
              "content": "Trusted by industry leaders",
              "name": "Features#2/Item/Text",
              "previousContent": "Entità vigilata  da Banca di Italia",
              "previousText": "Entità vigilata  da Banca di Italia",
            },
            {
              "content": "We are a registered platform approved by regulatory authorities, ensuring constant oversight for our users.",
              "name": "Features#2/Item/Supporting text",
              "previousText": "Siamo una SICAF approvata da Banca di Italia e Consob, vigilata costantemente dalle autorità.",
            },
            {
              "content": "Discover more about our services",
              "name": "Features#2/Item/Primary Button/Text",
              "previousText": "Learn more",
            },
            {
              "content": "Complete transparency",
              "name": "Features#2/Item/Text",
              "previousText": "Massima trasparenza",
            },
            {
              "content": "Track your website's performance and explore detailed analytics directly from our user-friendly dashboard.",
              "name": "Features#2/Item/Supporting text",
              "previousText": "Monitora i tuoi investimenti, scopri i dettagli delle operazioni. Tutto dalla nostra App.",
            },
            {
              "content": "Find out more about our features",
              "name": "Features#2/Item/Primary Button/Text",
              "previousText": "Learn more",
            },
            {
              "content": "Security and reliability",
              "name": "Features#2/Item/Text",
              "previousText": "Sicurezza e affidabilità",
            },
            {
              "content": "Your projects are kept separate from our operational funds, ensuring your assets are secure even in unforeseen circumstances.",
              "name": "Features#2/Item/Supporting text",
              "previousText": "I tuoi investimenti sono distinti dal capitale di Part App e in caso di cessazione di operatività non perd",
            },
            {
              "content": "Learn more about our safety measures",
              "name": "Features#2/Item/Primary Button/Text",
              "previousText": "Learn more",
            },
            {
              "content": "Start building your online presence today and unlock your potential with Notaku!",
              "name": "CTA section/Heading",
              "previousText": "Invest in real estate today and start build your wealth",
            },
          ]
        `)
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

test(
    'NDJSONStream works',
    async () => {
        const stream = await streamText({
            prompt:
                `output in NDJSON format 7 objects with fields text, sentiment. These objects should come from the book Dune, give me many quotes in NDJSON format.` +
                `You can add lines that start with // in the NDJSON output to indicate a comment and reason about the next quote, use comments to think step by step about the quote and the meaning of the quote. You can also add comments between each field, if for example you want to explain the meaning of the text before deciding the sentiment of it.\n` +
                `Try to add as many comments as you can, add comments before each field, put the JSON in many lines so you can add the comments easily.\n` +
                `Add a comment before each sentiment field, between sentiment and text, explain there why you are deciding the sentiment of the text.`,
            model: openai('gpt-3.5-turbo'),
            temperature: 0.7,
        })
        for await (let chunk of NDJSONStream({
            stream,
            onToken(token) {
                process.stdout.write(token)
            },
        })) {
            console.log('chunk', chunk)
        }
    },
    1000 * 10,
)
test(
    'NDJSONStream can be aborted',
    async () => {
        let abortController = new AbortController()

        const stream = await streamText({
            prompt:
                `output in NDJSON format 7 objects with fields text, sentiment. These objects should come from the book Dune, give me many quotes in NDJSON format.` +
                `You can add lines that start with // in the NDJSON output to indicate a comment and reason about the next quote, use comments to think step by step about the quote and the meaning of the quote. You can also add comments between each field, if for example you want to explain the meaning of the text before deciding the sentiment of it.\n` +
                `Try to add as many comments as you can, add comments before each field, put the JSON in many lines so you can add the comments easily.\n` +
                `Add a comment before each sentiment field, between sentiment and text, explain there why you are deciding the sentiment of the text.`,
            model: openai('gpt-3.5-turbo'),
            temperature: 0.7,
            abortSignal: abortController.signal,
        })
        for await (let chunk of NDJSONStream({
            stream,
            onToken(token) {
                process.stdout.write(token)
            },
        })) {
            console.log('chunk', chunk)
            console.log('aborting')
            abortController.abort()
        }
    },
    1000 * 10,
)

test('removeMarkdownSnippets', async () => {
    let x = dedent`
    # hello

    this is a test

    \`\`\`js
    console.log('hello')
    \`\`\`

    `
    // console.log(x)
    expect(removeMarkdownSnippets(x)).not.toContain('```')
    expect(removeMarkdownSnippets(x)).toMatchInlineSnapshot(`
      "# hello

      this is a test

      console.log('hello')
      "
    `)
})

test('splitStringButKeepChar', async () => {
    expect(splitStringButKeepChar('hello world  xx ', ' '))
        .toMatchInlineSnapshot(`
      [
        "hello ",
        "world ",
        " ",
        "xx ",
      ]
    `)
    expect(
        splitStringButKeepChar('hello\nworld\n\n some bs shit here', '\n').map(
            (x) => JSON.stringify(x),
        ),
    ).toMatchInlineSnapshot(`
      [
        ""hello\\n"",
        ""world\\n"",
        ""\\n"",
        "" some bs shit here"",
      ]
    `)
    expect(
        splitStringButKeepChar(
            `{"nodeId":"XAJKcOOW8","text":"Join for free and explore endless possibilities.","previousText":"Join for free and start connecting."}
    {"nodeId":"uVCb29QJD","text":"Hassle-Free","previousText":"No Maintenance Required"}
    {"nodeId":"WuRl6Hyhg","text":"We manage updates and maintenance for you.","previousText":"We handle all updates and maintenance for you."}`,
            '\n',
        ).map((x) => JSON.parse(x)),
    ).toMatchInlineSnapshot(`
      [
        {
          "nodeId": "XAJKcOOW8",
          "previousText": "Join for free and start connecting.",
          "text": "Join for free and explore endless possibilities.",
        },
        {
          "nodeId": "uVCb29QJD",
          "previousText": "No Maintenance Required",
          "text": "Hassle-Free",
        },
        {
          "nodeId": "WuRl6Hyhg",
          "previousText": "We handle all updates and maintenance for you.",
          "text": "We manage updates and maintenance for you.",
        },
        {
          "nodeId": "dF7KU7H_S",
          "previousText": "Quick Setup",
          "text": "Easy Setup",
        },
        {
          "nodeId": "GUjrtdfZu",
          "previousText": "Start using the app within minutes.",
          "text": "Get started in just a few minutes.",
        },
        {
          "nodeId": "PvcCFRx0p",
          "previousText": "Diverse Features",
          "text": "Feature-Rich",
        },
        {
          "nodeId": "OvsbDInDl",
          "previousText": "Access a variety of tools tailored to your needs.",
          "text": "Access a wide range of tools tailored to your needs.",
        },
        {
          "nodeId": "nk5stNgwE",
          "previousText": "Impact",
          "text": "Impactful",
        },
        {
          "nodeId": "ZNSqRTPTe",
          "previousText": "We aim to revolutionize social connectivity.",
          "text": "We aim to revolutionize how you connect.",
        },
        {
          "nodeId": "vBnw_mEnl",
          "previousText": "Transparency",
          "text": "Transparent",
        },
        {
          "nodeId": "N0spmch6X",
          "previousText": "We provide clear and detailed insights into your activities.",
          "text": "We offer clear insights into your activities.",
        },
        {
          "nodeId": "ZtpzDReuy",
          "previousText": "Simplicity",
          "text": "Simple",
        },
        {
          "nodeId": "Ez7GQFDih",
          "previousText": "Our interface makes connecting easy.",
          "text": "Our interface makes everything easy.",
        },
        {
          "nodeId": "sBye5dU0E",
          "previousText": "Reliability",
          "text": "Reliable",
        },
        {
          "nodeId": "sLHXEyRh6",
          "previousText": "We ensure your data is secure and accessible.",
          "text": "Your data is secure and always accessible.",
        },
      ]
    `)
})
