import { test, expect } from 'vitest'
import { blue } from 'picocolors'
import {
    fetchFormattedHtml,
    formatHtmlForPrompt,
    getWebsiteInfo,
} from './htmlrewrite.server'

test(
    'getWebsiteInfo',
    async ({}) => {
        console.log('fetching formatted html')
        const html = await fetchFormattedHtml('https://holocron.so')
        console.log('extracting content')
        const stream = await getWebsiteInfo({
            html,

            signal: new AbortController().signal,

            onToken(token) {
                process.stdout.write(token)
            },
        })
        let res
        for await (let message of stream) {
            console.log(message)
            if (message.finalObject) {
                res = message.finalObject
            }
        }
        expect(res).toMatchInlineSnapshot(`
          {
            "extractedContent": [
              {
                "content": "holocron",
                "hierarchy": "nav/logo",
              },
              {
                "content": "Home",
                "hierarchy": "nav/link1",
                "href": "./",
              },
              {
                "content": "Blog",
                "hierarchy": "nav/link2",
                "href": "./",
              },
              {
                "content": "Signup or Login",
                "hierarchy": "nav/button",
                "href": "https://holocron.so/login?",
              },
              {
                "content": "holocron is now in alpha",
                "hierarchy": "header/news",
              },
              {
                "content": "Notion like editor for your markdown files",
                "hierarchy": "header/heading",
              },
              {
                "content": "Start Writing Now",
                "hierarchy": "header/button1",
                "href": "https://holocron.so/login",
              },
              {
                "content": "Wanna Talk?",
                "hierarchy": "header/button2",
                "href": "/cdn-cgi/l/email-protection#95e1faf8f8ecd5fbfae1f4fee0bbe6faaae6e0f7fff0f6e1a8fdfaf9faf6e7fafb",
              },
              {
                "content": "Wanna Talk?",
                "hierarchy": "header/button3",
                "href": "/cdn-cgi/l/email-protection#285c474545516846475c49435d065b47175b5d4a424d4b5c15404744474b5a4746",
              },
              {
                "content": "Make your markdown files editable by everyone. Let non technical team members write docs, save 1000+ hours of your engineers time!",
                "hierarchy": "header/description",
              },
              {
                "content": "Support for all popular website generators: Docusaurus, Mkdocs, Nextra, Vitepress and your own custom codebase.",
                "hierarchy": "header/statistics",
              },
              {
                "content": "Hero Image",
                "hierarchy": "hero/image",
              },
              {
                "content": "Write, Edit & Publish",
                "hierarchy": "textOnlySection/title1",
              },
              {
                "content": "Create, Edit & Push.",
                "hierarchy": "textOnlySection/title2",
              },
              {
                "content": "Create, Edit & Collaborate.",
                "hierarchy": "textOnlySection/subheading",
              },
              {
                "content": "Platform to create, edit and publish your Markdown docs. Works with any codebase, easy collaboration, always in sync with your GitHub repo.",
                "hierarchy": "textOnlySection/description1",
              },
              {
                "content": "Easier way to create, distribute, and monetize podcasts. Create your show using one platform. Use one tool to edit, collaborate on episodes, and publish at any time.",
                "hierarchy": "textOnlySection/description2",
              },
              {
                "content": "Easier way to create, distribute, and monetize podcasts. Create your show using one platform. Use one tool to edit, collaborate on episodes, and publish at any time.",
                "hierarchy": "textOnlySection/description3",
              },
              {
                "content": "Support for Markdown and MDX",
                "hierarchy": "featureCards/feature1/title",
              },
              {
                "content": "Support for all popular website generators: Docusaurus, Mkdocs, Nextra, Vitepress and your own custom codebase.",
                "hierarchy": "featureCards/feature1/description",
              },
              {
                "content": "10x faster onboarding",
                "hierarchy": "featureCards/feature2/title",
              },
              {
                "content": "Non techincal team members no longer need to learn git, markdown, VSCode.",
                "hierarchy": "featureCards/feature2/description",
              },
              {
                "content": "Let everyone edit your markdown files",
                "hierarchy": "featureCards/feature3/title",
              },
              {
                "content": "Non techincal team members can now write Markdown",
                "hierarchy": "featureCards/feature3/description",
              },
              {
                "content": "Own Your Content",
                "hierarchy": "mobileHighlight/title1",
              },
              {
                "content": "Listen us from our users",
                "hierarchy": "mobileHighlight/title2",
              },
              {
                "content": "Don't let a third party store all your data, your docs are valuable as much as your code, you should keep them together on GitHub",
                "hierarchy": "mobileHighlight/description1",
              },
              {
                "content": "We can't explain ourselves like our customers and their numbers can. Listen us from them.",
                "hierarchy": "mobileHighlight/description2",
              },
              {
                "content": "without Holocron",
                "hierarchy": "chats/withoutHolocron/title",
              },
              {
                "content": "Hey, I need to edit the docs, how can i do it?",
                "hierarchy": "chats/withoutHolocron/message1",
              },
              {
                "content": "We keep our docs on Github, you will need to download the repo and commit your changes",
                "hierarchy": "chats/withoutHolocron/message2",
              },
              {
                "content": "I created my Github account, now what?",
                "hierarchy": "chats/withoutHolocron/message3",
              },
              {
                "content": "This is gonna be hard, go to our repo and download it",
                "hierarchy": "chats/withoutHolocron/message4",
              },
              {
                "content": "Ok i downloaded the folder but it's full of .md files, how do i edit them?",
                "hierarchy": "chats/withoutHolocron/message5",
              },
              {
                "content": "Download VSCode and open the folder, you will also have to learn markdown, search for a cheatsheet",
                "hierarchy": "chats/withoutHolocron/message6",
              },
              {
                "content": "Ok that took quite a bit, i did my edits (i hope i didn't break anything), how do i publish?",
                "hierarchy": "chats/withoutHolocron/message7",
              },
              {
                "content": "Stage, commit and push your changes with Git",
                "hierarchy": "chats/withoutHolocron/message8",
              },
              {
                "content": "with Holocron",
                "hierarchy": "chats/withHolocron/title",
              },
              {
                "content": "Hey! Sign up to Holocron at this link and start writing https://holoc...",
                "hierarchy": "chats/withHolocron/message1",
              },
              {
                "content": "Done, that was fast!",
                "hierarchy": "chats/withHolocron/message2",
              },
              {
                "content": "Pricing",
                "hierarchy": "pricing/title",
              },
              {
                "content": "Pricing that scale with your team and company size",
                "hierarchy": "pricing/description",
              },
              {
                "content": "For Open Source",
                "hierarchy": "pricing/plan1/title",
              },
              {
                "content": "Free for open source projects",
                "hierarchy": "pricing/plan1/description",
              },
              {
                "content": "$0 / per month",
                "hierarchy": "pricing/plan1/price",
              },
              {
                "content": "Real Time Collaboration",
                "hierarchy": "pricing/plan1/feature1",
              },
              {
                "content": "Sync with Github",
                "hierarchy": "pricing/plan1/feature2",
              },
              {
                "content": "MDX components",
                "hierarchy": "pricing/plan1/feature3",
              },
              {
                "content": "Seat based",
                "hierarchy": "pricing/plan2/title",
              },
              {
                "content": "For companies and startups",
                "hierarchy": "pricing/plan2/description",
              },
              {
                "content": "$6 / per seat per month (min 6 seats)",
                "hierarchy": "pricing/plan2/price",
              },
              {
                "content": "Real Time Collaboration",
                "hierarchy": "pricing/plan2/feature1",
              },
              {
                "content": "Sync with Github",
                "hierarchy": "pricing/plan2/feature2",
              },
              {
                "content": "MDX components",
                "hierarchy": "pricing/plan2/feature3",
              },
              {
                "content": "Enterprise",
                "hierarchy": "pricing/enterprise/title",
              },
              {
                "content": "For personalized needs",
                "hierarchy": "pricing/enterprise/description",
              },
              {
                "content": "Custom / per month",
                "hierarchy": "pricing/enterprise/price",
              },
              {
                "content": "Need help?",
                "hierarchy": "faq/title",
              },
              {
                "content": "Don't worry, we got you. Here are some answers for your questions.",
                "hierarchy": "faq/description",
              },
              {
                "content": "What Markdown features are supported?",
                "hierarchy": "faq/question1",
              },
              {
                "content": "How does the GitHub Integration works?",
                "hierarchy": "faq/question2",
              },
              {
                "content": "How do i publish my docs to a website?",
                "hierarchy": "faq/question3",
              },
              {
                "content": "Do you support real time collaboration?",
                "hierarchy": "faq/question4",
              },
              {
                "content": "holocron",
                "hierarchy": "footer/company",
              },
              {
                "content": "The editing platform for Markdown. Make your markdown files editable by everyone. Let non technical team members write docs, save 1000+ hours of your engineers time!",
                "hierarchy": "footer/description",
              },
              {
                "content": "Home",
                "hierarchy": "footer/product/link1",
                "href": "https://holocron.so/?",
              },
              {
                "content": "Pricing",
                "hierarchy": "footer/product/link2",
                "href": "https://holocron.so/#pricing",
              },
              {
                "content": "About",
                "hierarchy": "footer/company/link1",
                "href": "https://holocron.so/?",
              },
              {
                "content": "Blog",
                "hierarchy": "footer/company/link2",
                "href": "https://holocron.so/blog?",
              },
              {
                "content": "Privacy",
                "hierarchy": "footer/legal/link1",
                "href": "https://holocron.so/privacy?",
              },
              {
                "content": "Terms",
                "hierarchy": "footer/legal/link2",
                "href": "https://holocron.so/terms?x",
              },
            ],
            "websiteDescription": "This is a SaaS website for the company Holocron, offering a platform to create, edit, and publish Markdown documents. The main purpose is to provide a collaborative editing experience for non-technical team members, saving time for engineers. The tone of the language is professional and informative. The website is in English.",
          }
        `)
    },
    1000 * 100,
)

test('formatHtmlForPrompt', async () => {
    const res = await fetch('https://notaku.so')
    // const html = await res.text()
    const newHtml = await formatHtmlForPrompt(res)
    expect(newHtml).toMatchInlineSnapshot(
        `"<!DOCTYPE html><html><body><div><div><div></div><div><div></div><div><div><div><div><div><a href="/"><span> Notaku</span></a></div><div></div><div><div><button><div>Product</div></button><div><div><a href="/product/docs"><div></div><div><p>Docs website</p><p>Knowledge base and docs website</p></div></a><a href="/product/blog"><div></div><div><p>Blog website</p><p>Share stories and announcements</p></div></a><a href="/product/changelog"><div></div><div><p>Changelog website</p><p>Track company progress and updates</p></div></a><a href="/product/roadmap"><div></div><div><p>Roadmap website</p><p>Show your company future roadmap</p></div></a><a href="/product/help-desk"><div></div><div><p>Help Desk website</p><p>Help guides and articles</p></div></a></div></div></div><a href="/showcase">Showcase</a><a href="/#pricing">Pricing</a><div><a href="/">Login or Sign Up</a></div></div><button></button></div></div></div><div><div><div><div><div><div>Notaku</div><span> <h1><div>Turn <div><span>Notion</span></div> into a professional docs website</div></h1></span></div><span> <div>Publish awesome websites using Notion to manage content.<br/>Save 500+ hours of dev work. No design or code skills required.</div></span><div><div><div><div><div><button type="button" aria-label="login with google"><div><div><div></div><div></div></div><div><div>Sign Up With Google</div></div></div></button><div><div>join 1000+ happy companies</div></div></div></div></div></div><div></div></div></div></div></div></div><div><div><div>Write in Notion...</div><div></div><div>...publish on your domain</div></div><div><figure><div><div><span></span><span></span><span></span></div><div>notion.so</div></div><div><img alt="image" /></div></figure><figure><div><div><span></span><span></span><span></span></div><div>docs.example.com</div></div><div><img alt="image" /></div></figure></div></div><div><div><div><div></div><div><div>Trusted by innovative companies</div></div><div></div></div></div></div><div><div><div><div><img alt="logo" /></div><div><img alt="logo" /></div><div><img alt="logo" /></div><div><img alt="logo" /></div><div><img alt="logo" /></div></div></div></div><div><div><div></div><div></div><div></div><div><div><div><div><div><div>Notion as CMS</div><div><div>Keep your websites content in Notion</div></div><div><div>Notaku uses Notion as CMS for your docs, blog, changelog and roadmap<br/>All your team members can edit and publish new content super fast<br/></div></div></div><div><div><figure><div><div><span></span><span></span><span></span></div><div>notion.so</div></div><div><img alt="Sidebar illustration" /></div></figure></div></div></div></div></div></div></div></div><section aria-labelledby="testimonials-title"><div><div><h2>Loved by businesses worldwide</h2><p>Making amazing companies most productive than ever</p></div><ul><li><ul><li><figure><blockquote><p>Thank you for building it and doing such a great job. We tried the competition and Notaku is easier, more intuitive and has all the features we need. We’re happy customers!</p></blockquote><figcaption><div><div>Alexandre Solleiro</div><div>COO polkamarkets.com</div></div><div><img alt="profile photo" /></div></figcaption></figure></li><li><figure><blockquote><p>Great job! We love it at replay.io. Using it for both docs and changelog</p></blockquote><figcaption><div><div>Jason Laster</div><div>CEO replay.io</div></div><div><img alt="profile photo" /></div></figcaption></figure></li></ul></li><li><ul><li><figure><blockquote><p>We&#x27;re using Notaku Docs for formcarry.com, and it&#x27;s a blessing, when editing something we just change the Notion document and documentation got the changes, I honestly don&#x27;t want to spend my time on other web app, Notion is the best CMS, I have it on my computer and phone so I have the opportunity to edit it any time.</p></blockquote><figcaption><div><div>@nusualabuga</div><div>Founder of formcarry.com</div></div><div><img alt="profile photo" /></div></figcaption></figure></li><li><figure><blockquote><p>Huge congrats. We switched from a public Notion to Notaku and couldn&#x27;t be happier</p></blockquote><figcaption><div><div>Nish Ithayakumar</div><div>Co-founder usenimbus.com</div></div><div><img alt="profile photo" /></div></figcaption></figure></li></ul></li><li><ul><li><figure><blockquote><p>Very impressive - being able to build all these different kinds of sites using Notion is incredible!</p></blockquote><figcaption><div><div>Gladys Atienza</div><div>Customer service operations</div></div><div><img alt="profile photo" /></div></figcaption></figure></li><li><figure><blockquote><p>Awesome product and really active founder and development.</p></blockquote><figcaption><div><div>Luis PW</div><div>Senior SEO Consultant</div></div><div><img alt="profile photo" /></div></figcaption></figure></li></ul></li></ul></div></section><div></div><div><div></div><div></div><div></div><div><section aria-labelledby="features-title"><div><div><h2>Everything you need to publish awesome content</h2><p>Notaku can create all the necessary websites for your product</p></div><button type="button" aria-hidden="true"></button><div><div><div role="tablist" aria-orientation="horizontal"><div><h3><button role="tab" type="button" aria-selected="true"><span></span>Documentation</button></h3><p>Website to keep all your product public docs</p></div><div><h3><button role="tab" type="button" aria-selected="false"><span></span>Help Desk</button></h3><p>For support articles and tutorials</p></div><div><h3><button role="tab" type="button" aria-selected="false"><span></span>Blog</button></h3><p>Website to publish articles and blog posts</p></div><div><h3><button role="tab" type="button" aria-selected="false"><span></span>Changelog</button></h3><p>Release notes, new features and fixes</p></div><div><h3><button role="tab" type="button" aria-selected="false"><span></span>Roadmap</button></h3><p>Show a public roadmap and let users vote on features</p></div></div></div><div><div role="tabpanel"><div><div></div><p>Website to keep all your product public docs</p></div><div><figure><div><div><span></span><span></span><span></span></div><div>docs.example.com</div></div><div><img alt="" /></div></figure></div></div><div role="tabpanel"><div><div></div><p>For support articles and tutorials</p></div><div><figure><div><div><span></span><span></span><span></span></div><div>help.example.com</div></div><div><img alt="" /></div></figure></div></div><div role="tabpanel"><div><div></div><p>Website to publish articles and blog posts</p></div><div><figure><div><div><span></span><span></span><span></span></div><div>blog.example.com</div></div><div><img alt="" /></div></figure></div></div><div role="tabpanel"><div><div></div><p>Release notes, new features and fixes</p></div><div><figure><div><div><span></span><span></span><span></span></div><div>changelog.example.com</div></div><div><img alt="" /></div></figure></div></div><div role="tabpanel"><div><div></div><p>Show a public roadmap and let users vote on features</p></div><div><figure><div><div><span></span><span></span><span></span></div><div>roadmap.example.com</div></div><div><img alt="" /></div></figure></div></div></div></div></div></section><div><div><div></div><div></div><div></div><div><div><div><div><div><div>All the features you expect and more</div><p>Notaku has everything you need to publish awesome websites</p></div><div><div><div><div></div><div><div>Super fast search</div><div>Notaku websites have very fast search built in. Your users will be able to find what they are looking for in seconds.</div></div></div><div></div><div><div><div><figure><div><div><span></span><span></span><span></span></div><div>docs.example.com</div></div><div><img alt="" /></div></figure></div><div></div></div></div></div><div><div><div></div><div><div>Optimized for speed</div><div>Notaku websites are built with speed in mind. We host your websites in a CDN, fast and reliable.</div></div></div><div></div><div><div><img alt="" /></div></div></div><div><div><div></div><div><div>Social media images</div><div>Notaku automatically creates images for your links on social media</div></div></div><div></div><div><div><img alt="" /></div></div></div><div><div><div></div><div><div>Excellent SEO, organic traffic goes brrr</div><div>Many users found their organic traffic doubled after integrating Notaku</div></div></div><div></div><div><img alt="" /></div></div><div><div><div></div><div><div>Multi language</div><div>You can write your content in multiple languages in different Notion pages</div></div></div><div></div><div><div><img alt="" /></div></div></div><div><div><div></div><div><div>Collect feedback</div><div>Notaku can collect feedback on your pages, both rating and text feedback</div></div></div><div></div><div><div><img alt="" /></div></div></div><div><div><div></div><div><div>Send emails</div><div>Notaku can collect your visitors emails and send weekly summary emails</div></div></div><div></div><div><div><img alt="" /></div></div></div><div><div><div></div><div><div>Ask AI and Semantic Search</div><div>Users can ask questions to your website and get answers from your Notion content</div></div></div><div></div><div><div><img alt="" /></div></div></div><div><div><div></div><div><div>Multiple Versions</div><div>Publish multiple versions of your website connected to different Notion pages, for example a v1 and a v2</div></div></div><div></div><div><div><img alt="" /></div></div></div><div><div><div></div><div><div>Subdomain or /subdirectory</div><div>Notaku can be hosted on subdomains or subdirectories (/docs and /blog) using a reverse proxy like Cloudflare and Next.js</div></div></div><div></div><div><div><img alt="" /></div></div></div><div><div><div></div><div><div>Embed in your app with a widget</div><div>Notaku websites can be embedded in your app with a slick widget</div></div></div><div></div><div><div><video></video></div></div></div></div></div></div></div></div></div></div></div></div><div><div></div><div></div><div></div><div><div><h2>Pricing Plans</h2><p>VAT not included</p><div><div><div><div><button type="button">Monthly billing</button><button type="button">Yearly billing</button></div></div></div><div><div><div><div><h2>Free</h2><p>20 pages</p><p><span>$0</span> <span>/mo</span></p><div></div></div><div><h3>What&#x27;s included</h3><div role="list"><div><div>20 Notion pages</div></div><div><div>notaku.site subdomain</div></div></div></div></div></div><div><div><div><h2>Basic </h2><p>50 pages</p><p><span>$17</span> <span>/mo</span></p><div></div></div><div><h3>What&#x27;s included</h3><div role="list"><div><div>50 Notion pages</div></div><div><div>1 Seat</div></div><div><div>Custom Domain</div></div><div><div><div><div>Basic Customization</div></div></div></div><div><div><div><div>Basic Search</div></div></div></div></div></div></div></div><div><div><div><h2>Business </h2><p>150 pages</p><p><span>$37</span> <span>/mo</span></p><div></div></div><div><h3>What&#x27;s included</h3><div role="list"><div><div>150 Notion pages</div></div><div><div>5 Seats</div></div><div><div>Custom Domain</div></div><div><div><div><div>Advanced Customization</div></div></div></div><div><div><div><div>Custom JavaScript &amp; CSS</div></div></div></div><div><div><div><div>User Feedback</div></div></div></div><div><div><div><div>Password Protection &amp; Private Notion</div></div></div></div><div><div><div><div>Full text search</div></div></div></div><div><div><div><div>Embeddable Widget</div></div></div></div></div></div></div></div><div><div><div><h2>Business Plus </h2><p>2K pages</p><p><span>$97</span> <span>/mo</span></p><div></div></div><div><h3>What&#x27;s included</h3><div role="list"><div><div>2000 Notion pages</div></div><div><div>Unlimited Seats</div></div><div><div>Custom Domain</div></div><div><div><div><div>Advanced Customization</div></div></div></div><div><div><div><div>Custom JavaScript &amp; CSS</div></div></div></div><div><div><div><div>User Feedback</div></div></div></div><div><div><div><div>Password Protection &amp; Private Notion</div></div></div></div><div><div><div><div>Full text search</div></div></div></div><div><div><div><div>Embeddable Widget</div></div></div></div><div><div><div><div>Versions</div></div></div></div><div><div><div><div>Auto Sync</div></div></div></div><div><div><div><div>Host on a subdirectory (/docs and /help)</div></div></div></div></div></div></div></div></div></div></div></div></div><div><div><div>Frequently asked questions</div><div><div><div><div><div><div><ul><li><div><div>Is there a free trial?</div><div></div><button></button></div><div><div>You can try Notaku without a subscription, to get Pro features you will need to buy a subscription. If you are not satisfied you can be refunded within 30 days of purchase.</div></div></li><li><div><div>How are Notion pages counted?</div><div></div><button></button></div><div><div>All Notion pages and database items with content inside (not empty pages) are counted. Notion pages connected as versions are not counted but must be below the plan limit.</div></div></li><li><div><div>What happens after I exceed my Notion pages limit?</div><div></div><button></button></div><div><div>Only part of your Notion pages will be synced. </div></div></li><li><div><div>What Notion blocks are supported?</div><div></div><button></button></div><div><div><span>Notaku supports most blocks from Notion, you can take a look at a demo showing supported blocks <a href="https://notaku.so/docs/supported-blocks" target="_blank">here</a>.</span></div></div></li><li><div><div>Can i create simple Terms of Service and FAQ pages?</div><div></div><button></button></div><div><div><span>Yes, you can use the &quot;Simple Layout&quot; template to create simple pages like Terms of Service and Privacy Policy.<br/><br/>Websites created using the simple layout look <a href="https://example.simple.notaku.site" target="_blank">like this</a><br/><br/>You can use all Notion blocks, for example you can add toggle blocks to create FAQ titles the user can click to expand.</span></div></div></li><li><div><div>Can i use my own analytics service? Can I inject custom code?</div><div></div><button></button></div><div><div><span>Yes, The Notaku dashboard lets you inject custom code, for example to add your own analytics service.<br/><br/></span></div></div></li><li><div><div>Who is behind Notaku?</div><div></div><button></button></div><div><div><span>I am Tommy, a software engineer living in Italy. you can chat with me on <a href="https://twitter.com/__morse" target="_blank">X</a> :)</span></div></div></li></ul></div></div></div></div></div></div></div></div><div><div><div></div><div></div><div></div><div><div><div><div><h2>Publish awesome websites with Notion</h2><div>Build in minutes what other companies create in months<br/></div><div><div><div><button type="button" aria-label="login with google"><div><div><div></div><div></div></div><div><div>Sign Up With Google</div></div></div></button></div></div></div></div></div></div></div></div></div><div><div><div><div><div>Company</div><div><a href="https://twitter.com/NotakuHQ" target="_blank">Twitter</a><a href="https://status.notaku.so" target="_blank">Status</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="https://notaku.so/docs/company/refund-policy" target="_blank">Refund Policy</a><a href="/partner">Affiliate program</a><a href="/docs/company/mission">Mission</a></div></div><div><div>Resources</div><div><a href="/docs">Docs</a><a href="/blog">Blog</a><a href="/notion-icons-generator">Icons generator</a><a href="/gitbook-importer">Gitbook to Notion</a><a href="/showcase">Showcase</a><a href="/tools/notion-clickable-images">Notion image links tool</a></div></div><div><div>Notion templates</div><div><a href="https://brave-iberis-6ea.notion.site/Notaku-docs-tamplate-6eb4a7eb45f846cbbbe4e666b992013b" target="_blank">Docs template</a><a href="https://brave-iberis-6ea.notion.site/415a59813d7f49f99783e89c7573d20a" target="_blank">Blog template</a><a href="https://brave-iberis-6ea.notion.site/63f6ba64add348e9933ca22a58615941" target="_blank">Changelog template</a></div></div><div><div>Comparisons</div><div><a href="/comparisons/helpkit" target="_blank">Helpkit</a><a href="/comparisons/feather" target="_blank">Feather</a><a href="/comparisons/gitbook" target="_blank">GitBook</a><a href="/comparisons/readme" target="_blank">Readme</a><a href="/comparisons/super" target="_blank">Super</a></div></div></div></div></div></div></div></div></div></body></html>"`,
    )
})
