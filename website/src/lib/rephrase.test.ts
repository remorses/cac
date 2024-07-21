import {
    NDJSONStream,
    rephrase,
    splitStringButKeepChar,
} from 'website/src/lib/elysia.server'
import { expect, test } from 'vitest'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

test(
    'rephrase a test template',
    async () => {
        const stream = await rephrase({
            description:
                'A website to generate websites from Notion called Notaku',
            textToReplace,
            exampleTextToMigrate: exampleTextToMigrate as any,
            signal: new AbortController().signal,
            onToken(token) {
                process.stdout.write(token)
            },
        })
        let resultNodeIds = new Set<string>()
        let results = [] as any[]
        for await (let chunk of stream) {
            let prevLen = resultNodeIds.size

            resultNodeIds.add(chunk.nodeId)
            if (resultNodeIds.size === prevLen) {
                console.error('XXX duplicate nodeId', chunk)
            }
            const node = textToReplace.find((x) => x.nodeId === chunk.nodeId)
            if (!node) {
                console.error(
                    'XXX LLM returned text for a non existent previous node',
                    chunk,
                )
            }
            const { nodeId, ...interestingFields } = chunk
            results.push({
                name: node?.name,
                previousTextReal: node?.text,
                ...interestingFields,
            })

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
              "nodeId": "SS1_IlbK4",
              "previousText": "Get Real Estate income, without owning a house",
              "previousTextReal": "Get Real Estate income, without owning a house",
              "text": "Turn Notion into a professional docs website",
            },
            {
              "nodeId": "r85QKi2A3",
              "previousText": "Average return on investment of 7%",
              "previousTextReal": "Average return on investment of 7%",
              "text": "Publish awesome websites with Notion",
            },
            {
              "nodeId": "xNZzVo4o8",
              "previousText": "Withdraw your funds every 3 months",
              "previousTextReal": "Withdraw your funds every 3 months",
              "text": "Save 500+ hours of dev work",
            },
            {
              "nodeId": "Pm2TsJPFV",
              "previousText": "Investment selection from qualified SGRs",
              "previousTextReal": "Investment selection from qualified SGRs",
              "text": "No design or code skills required",
            },
            {
              "nodeId": "OGQRRyVtY",
              "previousText": "Helping teams at the world's best companies",
              "previousTextReal": "Helping teams at the world's best companies",
              "text": "Empowering creators at top companies",
            },
            {
              "nodeId": "VcP2b7dBO",
              "previousText": "Invest in income-generating real estate, easily.",
              "previousTextReal": "Invest in income-generating real estate, easily.",
              "text": "Everything you need to publish awesome content",
            },
            {
              "nodeId": "PFUEfzvNa",
              "previousText": "1",
              "previousTextReal": "1",
              "text": "1",
            },
            {
              "nodeId": "RdJFsLG7c",
              "previousText": "Create your profile in 3 minutes",
              "previousTextReal": "Create your profile in 3 minutes",
              "text": "Connect your Notion account",
            },
            {
              "nodeId": "Y1bWcTLsu",
              "previousText": "2",
              "previousTextReal": "2",
              "text": "2",
            },
            {
              "nodeId": "Bssk7Dw7Y",
              "previousText": "Invest in our real estate portfolio",
              "previousTextReal": "Invest in our real estate portfolio",
              "text": "Choose a template",
            },
            {
              "nodeId": "gaujCenE2",
              "previousText": "3",
              "previousTextReal": "3",
              "text": "3",
            },
            {
              "nodeId": "sgSdApz6H",
              "previousText": "View the trend of collected rents and appreciation",
              "previousTextReal": "View the trend of collected rents and appreciation",
              "text": "Customize your content",
            },
            {
              "nodeId": "KmUWluNGN",
              "previousText": "4",
              "previousTextReal": "4",
              "text": "4",
            },
            {
              "nodeId": "MRzIAF1Ol",
              "previousText": "Request redemption every 3 months, or reinvest your earnings",
              "previousTextReal": "Request redemption every 3 months, or reinvest your earnings",
              "text": "Publish and track your site",
            },
            {
              "nodeId": "QLIAZsMFx",
              "previousText": "Evaluate your potential return",
              "previousTextReal": "Evaluate your potential return",
              "text": "Evaluate your website's performance",
            },
            {
              "nodeId": "v5GFm72p8",
              "previousText": "Whether it's building a passive income stream through rental properties or capitalizing on property appreciation.",
              "previousTextReal": "Whether it's building a passive income stream through rental properties or capitalizing on property appreciation.",
              "text": "Monitor engagement and analytics to optimize your content.",
            },
            {
              "nodeId": "gGZMdPVcX",
              "previousText": "More accessible and secure than going solo",
              "previousTextReal": "More accessible and secure than going solo",
              "text": "More accessible and secure than traditional site builders",
            },
            {
              "nodeId": "BIOg3Ncg2",
              "previousText": "Start without the need for large sums",
              "previousTextReal": "Start without the need for large sums",
              "text": "Start without the need for coding skills",
            },
            {
              "nodeId": "XAJKcOOW8",
              "previousText": "Begin with just $1,500, instead of purchasing an entire property.",
              "previousTextReal": "Begin with just $1,500, instead of purchasing an entire property.",
              "text": "Begin with just a Notion account, no coding required.",
            },
            {
              "nodeId": "uVCb29QJD",
              "previousText": "Forget about operational management",
              "previousTextReal": "Forget about operational management",
              "text": "Forget about technical maintenance",
            },
            {
              "nodeId": "WuRl6Hyhg",
              "previousText": "No tenant management or unexpected site issues. We take care of it.",
              "previousTextReal": "No tenant management or unexpected site issues. We take care of it.",
              "text": "No server management or unexpected technical issues. We handle it all.",
            },
            {
              "nodeId": "dF7KU7H_S",
              "previousText": "Get liquidity in 3 months",
              "previousTextReal": "Get liquidity in 3 months",
              "text": "Get real-time updates",
            },
            {
              "nodeId": "GUjrtdfZu",
              "previousText": "No longer depend on agencies or market conditions.",
              "previousTextReal": "No longer depend on agencies or market conditions.",
              "text": "No longer depend on developers or technical staff.",
            },
            {
              "nodeId": "PvcCFRx0p",
              "previousText": "Benefit from diversification",
              "previousTextReal": "Benefit from diversification",
              "text": "Benefit from a variety of templates",
            },
            {
              "nodeId": "OvsbDInDl",
              "previousText": "Avoid concentrating your capital in a single property.",
              "previousTextReal": "Avoid concentrating your capital in a single property.",
              "text": "Avoid spending time designing from scratch.",
            },
            {
              "nodeId": "nk5stNgwE",
              "previousText": "Impact",
              "previousTextReal": "Impact",
              "text": "Impact",
            },
            {
              "nodeId": "ZNSqRTPTe",
              "previousText": "We want to enable everyone to build wealth through real estate.",
              "previousTextReal": "We want to enable everyone to build wealth through real estate.",
              "text": "We aim to empower everyone to create professional websites.",
            },
            {
              "nodeId": "vBnw_mEnl",
              "previousText": "Transparency",
              "previousTextReal": "Transparency",
              "text": "Transparency",
            },
            {
              "nodeId": "N0spmch6X",
              "previousText": "We operate with utmost transparency with our investors. No surprises.",
              "previousTextReal": "We operate with utmost transparency with our investors. No surprises.",
              "text": "We operate with full transparency. No hidden fees.",
            },
            {
              "nodeId": "ZtpzDReuy",
              "previousText": "Simplicity",
              "previousTextReal": "Simplicity",
              "text": "Simplicity",
            },
            {
              "nodeId": "Ez7GQFDih",
              "previousText": "We focus our energies on making the complex simple.",
              "previousTextReal": "We focus our energies on making the complex simple.",
              "text": "We focus on making website creation simple.",
            },
            {
              "nodeId": "sBye5dU0E",
              "previousText": "Reliability",
              "previousTextReal": "Reliability",
              "text": "Reliability",
            },
            {
              "nodeId": "sLHXEyRh6",
              "previousText": "We work to provide the safest investment experience.",
              "previousTextReal": "We work to provide the safest investment experience.",
              "text": "We work to provide the most reliable website creation experience.",
            },
            {
              "nodeId": "DXU4V16vB",
              "previousText": "Optimise your return rate and retain more of your income",
              "previousTextReal": "Optimise your return rate and retain more of your income",
              "text": "Optimize your website's performance",
            },
            {
              "nodeId": "igHOKwwEG",
              "previousText": "Secure premium profits. We seamlessly provide you with the highest returns. Keep up to an extra 17.6% after taxes. Some of your earnings could be exempt from local and city taxes.",
              "previousTextReal": "Secure premium profits. We seamlessly provide you with the highest returns. Keep up to an extra 17.6% after taxes. Some of your earnings could be exempt from local and city taxes.",
              "text": "Maximize your website's reach and user engagement with our tools.",
            },
            {
              "nodeId": "EipHOyo0G",
              "previousText": "11.7x",
              "previousTextReal": "11.7x",
              "text": "10x",
            },
            {
              "nodeId": "kHlbTp9Qv",
              "previousText": "Attain prime returns. We effortlessly secure the utmost proceeds possible for you on here",
              "previousTextReal": "Attain prime returns. We effortlessly secure the utmost proceeds possible for you on here",
              "text": "Achieve top results. We ensure the best possible outcomes for your site.",
            },
            {
              "nodeId": "JyH1PN0Mv",
              "previousText": "17.6%",
              "previousTextReal": "17.6%",
              "text": "20%",
            },
            {
              "nodeId": "Vwox3zTmj",
              "previousText": "Retain Up To 17.6% More, Post-Tax. A portion of your income may be free from state and local taxes.",
              "previousTextReal": "Retain Up To 17.6% More, Post-Tax. A portion of your income may be free from state and local taxes.",
              "text": "Increase your engagement by up to 20%.",
            },
            {
              "nodeId": "cJAcsVl7T",
              "previousText": "0.45%",
              "previousTextReal": "0.45%",
              "text": "0.5%",
            },
            {
              "nodeId": "W6AjogO7U",
              "previousText": "Minor fee. We shift your funds when a superior rate emerges from our Premium feature set.",
              "previousTextReal": "Minor fee. We shift your funds when a superior rate emerges from our Premium feature set.",
              "text": "Minimal fee. We continuously improve your site's performance.",
            },
            {
              "nodeId": "GdtktOrDy",
              "previousText": "Real estate is the cornerstone to build your wealth.",
              "previousTextReal": "Real estate is the cornerstone to build your wealth.",
              "text": "Turn Notion into the foundation of your online presence.",
            },
            {
              "nodeId": "nmbjLnYjg",
              "previousText": "Improved stability",
              "previousTextReal": "Improved stability",
              "text": "Enhanced stability",
            },
            {
              "nodeId": "Rwuqt5rvG",
              "previousText": "Historically, real estate has provided lower volatility compared to stock investments.",
              "previousTextReal": "Historically, real estate has provided lower volatility compared to stock investments.",
              "text": "Historically, Notion-based sites provide stable performance compared to custom-built sites.",
            },
            {
              "nodeId": "L9Y61DsaF",
              "previousText": "Steady income",
              "previousTextReal": "Steady income",
              "text": "Consistent updates",
            },
            {
              "nodeId": "tefWgIUuj",
              "previousText": "Generate a consistent income through renting without being correlated to the market trends.",
              "previousTextReal": "Generate a consistent income through renting without being correlated to the market trends.",
              "text": "Ensure your content remains up-to-date without constant manual intervention.",
            },
            {
              "nodeId": "aV2icA9HT",
              "previousText": "Inflation protection",
              "previousTextReal": "Inflation protection",
              "text": "Future-proof",
            },
            {
              "nodeId": "ZtwUSI4jD",
              "previousText": "Safeguard your investment against inflation with our built-in inflation protection toolset.",
              "previousTextReal": "Safeguard your investment against inflation with our built-in inflation protection toolset.",
              "text": "Protect your website from becoming outdated with our tools.",
            },
            {
              "nodeId": "qXzMW4gBj",
              "previousText": "Offriamo ai piccoli investitori la qualità degli investitori istituzionali.",
              "previousTextReal": "Offriamo ai piccoli investitori la qualità degli investitori istituzionali.",
              "text": "We offer top-tier quality for all users.",
            },
            {
              "nodeId": "OEdynltbl",
              "previousText": "Entità vigilata  da Banca di Italia",
              "previousTextReal": "Entità vigilata  da Banca di Italia",
              "text": "Regulated by top authorities",
            },
            {
              "nodeId": "GpjQuak_P",
              "previousText": "Siamo una SICAF approvata da Banca di Italia e Consob, vigilata costantemente dalle autorità.",
              "previousTextReal": "Siamo una SICAF approvata da Banca di Italia e Consob, vigilata costantemente dalle autorità.",
              "text": "We are a certified platform, constantly monitored by industry authorities.",
            },
            {
              "nodeId": "co7B89zmA",
              "previousText": "Learn more",
              "previousTextReal": "Learn more",
              "text": "Learn more",
            },
            {
              "nodeId": "pr9zJKxIX",
              "previousText": "Massima trasparenza",
              "previousTextReal": "Massima trasparenza",
              "text": "Maximum transparency",
            },
            {
              "nodeId": "Cg2oZ9zMm",
              "previousText": "Monitora i tuoi investimenti, scopri i dettagli delle operazioni. Tutto dalla nostra App.",
              "previousTextReal": "Monitora i tuoi investimenti, scopri i dettagli delle operazioni. Tutto dalla nostra App.",
              "text": "Track your site's performance and details. All from our dashboard.",
            },
            {
              "nodeId": "sYqVHjGdV",
              "previousText": "Learn more",
              "previousTextReal": "Learn more",
              "text": "Learn more",
            },
            {
              "nodeId": "XoLRo8GTw",
              "previousText": "Sicurezza e affidabilità",
              "previousTextReal": "Sicurezza e affidabilità",
              "text": "Security and reliability",
            },
            {
              "nodeId": "pb7BQRxcQ",
              "previousText": "I tuoi investimenti sono distinti dal capitale di Part App e in caso di cessazione di operatività non perd",
              "previousTextReal": "I tuoi investimenti sono distinti dal capitale di Part App e in caso di cessazione di operatività non perd",
              "text": "Your site data is distinct from Notaku's assets and remains safe under all circumstances.",
            },
            {
              "nodeId": "ZYlpRrMcv",
              "previousText": "Learn more",
              "previousTextReal": "Learn more",
              "text": "Learn more",
            },
            {
              "nodeId": "NCu7_Gelj",
              "previousText": "Invest in real estate today and start build your wealth",
              "previousTextReal": "Invest in real estate today and start build your wealth",
              "text": "Create your Notaku website today and start reaching your audience",
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
    'NDJSONStream',
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
})
