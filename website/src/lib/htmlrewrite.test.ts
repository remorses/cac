import { test, expect } from 'vitest'
import { formatHtmlForPrompt, getWebsiteInfo } from './htmlrewrite.server'

test(
    'getWebsiteInfo',
    async () => {
        const res = await getWebsiteInfo({
            url: 'https://holocron.so',
            onObject(obj) {
                console.log('object', JSON.stringify(obj))
            },
            signal: new AbortController().signal,
            // onToken(token) {
            //     process.stdout.write(token)
            // },
        })
        expect(res).toMatchInlineSnapshot(`
          [
            {
              "content": "holocron",
              "hierarchy": "nav/logo",
            },
            {
              "content": "Home",
              "hierarchy": "nav/link",
              "href": "./",
            },
            {
              "content": "Blog",
              "hierarchy": "nav/link",
              "href": "./",
            },
            {
              "content": "Signup or Login",
              "hierarchy": "nav/button",
              "href": "https://holocron.so/login?",
            },
            {
              "content": "Notion like editor for your markdown files",
              "hierarchy": "hero/heading",
            },
            {
              "content": "Start Writing Now",
              "hierarchy": "hero/button",
              "href": "https://holocron.so/login",
            },
            {
              "content": "Wanna Talk?",
              "hierarchy": "hero/button",
              "href": "/cdn-cgi/l/email-protection#780c171515013816170c19130d560b17470b0d1a121d1b0c45101714171b0a1716",
            },
            {
              "content": "Make your markdown files editable by everyone. Let non technical team members write docs, save 1000+ hours of your engineers time!",
              "hierarchy": "hero/paragraph",
            },
            {
              "content": "Avatar 1",
              "hierarchy": "hero/image",
            },
            {
              "content": "Avatar 2",
              "hierarchy": "hero/image",
            },
            {
              "content": "Avatar 3",
              "hierarchy": "hero/image",
            },
            {
              "content": "Avatar 4",
              "hierarchy": "hero/image",
            },
            {
              "content": "Avatar 5",
              "hierarchy": "hero/image",
            },
            {
              "content": "Write, Edit & Publish",
              "hierarchy": "features/heading",
            },
            {
              "content": "Platform to create, edit and publish your Markdown docs. Works with any codebase, easy collaboration, always in sync with your GitHub repo.",
              "hierarchy": "features/paragraph",
            },
            {
              "content": "Support for Markdown and MDX",
              "hierarchy": "features/heading",
            },
            {
              "content": "Support for all popular website generators: Docusaurus, Mkdocs, Nextra, Vitepress and your own custom codebase.",
              "hierarchy": "features/paragraph",
            },
            {
              "content": "10x faster onboarding",
              "hierarchy": "features/heading",
            },
            {
              "content": "Non technical team members no longer need to learn git, markdown, VSCode.",
              "hierarchy": "features/paragraph",
            },
            {
              "content": "Sync with GitHub",
              "hierarchy": "features/heading",
            },
            {
              "content": "Holocron changes back to GitHub",
              "hierarchy": "features/paragraph",
            },
            {
              "content": "Holocron listens for any change from GitHub",
              "hierarchy": "features/paragraph",
            },
            {
              "content": "Automatic conflict resolution",
              "hierarchy": "features/paragraph",
            },
            {
              "content": "Let everyone edit your markdown files",
              "hierarchy": "features/heading",
            },
            {
              "content": "Non technical team members can now write Markdown",
              "hierarchy": "features/paragraph",
            },
            {
              "content": "Real Time Collaboration",
              "hierarchy": "features/heading",
            },
            {
              "content": "Support for all popular website generators: Docusaurus, Mkdocs, Nextra, Vitepress and your own custom codebase.",
              "hierarchy": "features/paragraph",
            },
            {
              "content": "Own Your Content",
              "hierarchy": "features/heading",
            },
            {
              "content": "Don't let a third party store all your data, your docs are valuable as much as your code, you should keep them together on GitHub",
              "hierarchy": "features/paragraph",
            },
            {
              "content": "without Holocron",
              "hierarchy": "testimonial/heading",
            },
            {
              "content": "Based on a true story",
              "hierarchy": "testimonial/paragraph",
            },
            {
              "content": "Hey, I need to edit the docs, how can i do it?",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "We keep our docs on Github, you will need to download the repo and commit your changes",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "I created my Github account, now what?",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "This is gonna be hard, go to our repo and download it",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "Ok i downloaded the folder but it's full of .md files, how do i edit them?",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "Download VSCode and open the folder, you will also have to learn markdown, search for a cheatsheet",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "Ok that took quite a bit, i did my edits (i hope i didn't break anything), how do i publish?",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "Stage, commit and push your changes with Git",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "I need to login to Github with Git, do you know how to do it?",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "Download Github Desktop it will make things easier",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "Ok I pushed my changes to Github finally 🚀",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "You took down prod, don't force push to main next time 😬",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "with Holocron",
              "hierarchy": "testimonial/heading",
            },
            {
              "content": "Hey, I need to edit the docs, how can i do it?",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "Hey! Sign up to Holocron at this link and start writing https://holoc…",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "Done, that was fast!",
              "hierarchy": "testimonial/quote",
            },
            {
              "content": "Pricing",
              "hierarchy": "pricing/heading",
            },
            {
              "content": "Pricing that scale with your team and company size",
              "hierarchy": "pricing/paragraph",
            },
            {
              "content": "For Open Source",
              "hierarchy": "pricing/heading",
            },
            {
              "content": "Free for open source projects",
              "hierarchy": "pricing/paragraph",
            },
            {
              "content": "$0 / per month",
              "hierarchy": "pricing/price",
            },
            {
              "content": "Real Time Collaboration",
              "hierarchy": "pricing/feature",
            },
            {
              "content": "Sync with Github",
              "hierarchy": "pricing/feature",
            },
            {
              "content": "MDX components",
              "hierarchy": "pricing/feature",
            },
            {
              "content": "Request access",
              "hierarchy": "pricing/button",
              "href": "/cdn-cgi/l/email-protection#5b2f343636221b333437343829343575283464282e39313e382f6633343734382934357e696b342b3e357e696b28342e29383e",
            },
            {
              "content": "Seat based",
              "hierarchy": "pricing/heading",
            },
            {
              "content": "For companies and startups",
              "hierarchy": "pricing/paragraph",
            },
            {
              "content": "$6 / per seat per month (min 6 seats)",
              "hierarchy": "pricing/price",
            },
            {
              "content": "Real Time Collaboration",
              "hierarchy": "pricing/feature",
            },
            {
              "content": "Sync with Github",
              "hierarchy": "pricing/feature",
            },
            {
              "content": "MDX components",
              "hierarchy": "pricing/feature",
            },
            {
              "content": "Get started now",
              "hierarchy": "pricing/button",
              "href": "https://holocron.so/login",
            },
            {
              "content": "Enterprise",
              "hierarchy": "pricing/heading",
            },
            {
              "content": "For personalized needs",
              "hierarchy": "pricing/paragraph",
            },
            {
              "content": "Custom / per month",
              "hierarchy": "pricing/price",
            },
            {
              "content": "Real Time Collaboration",
              "hierarchy": "pricing/feature",
            },
            {
              "content": "Sync with Github",
              "hierarchy": "pricing/feature",
            },
            {
              "content": "MDX components",
              "hierarchy": "pricing/feature",
            },
            {
              "content": "Request access",
              "hierarchy": "pricing/button",
              "href": "/cdn-cgi/l/email-protection#384c575555417856574c59534d164b57074b4d5a525d5b4c05505754575b4a57561d0a085d564c5d4a484a514b5d",
            },
            {
              "content": "Need help?",
              "hierarchy": "faq/heading",
            },
            {
              "content": "Don't worry, we got you. Here are some answers for your questions.",
              "hierarchy": "faq/paragraph",
            },
            {
              "content": "What Markdown features are supported?",
              "hierarchy": "faq/question",
            },
            {
              "content": "How does the GitHub Integration works?",
              "hierarchy": "faq/question",
            },
            {
              "content": "How do i publish my docs to a website?",
              "hierarchy": "faq/question",
            },
            {
              "content": "Do you support real time collaboration?",
              "hierarchy": "faq/question",
            },
            {
              "content": "holocron",
              "hierarchy": "footer/logo",
            },
            {
              "content": "The editing platform for Markdown. Make your markdown files editable by everyone. Let non technical team members write docs, save 1000+ hours of your engineers time!",
              "hierarchy": "footer/paragraph",
            },
            {
              "content": "Home",
              "hierarchy": "footer/link",
              "href": "https://holocron.so/?",
            },
            {
              "content": "Pricing",
              "hierarchy": "footer/link",
              "href": "https://holocron.so/#pricing",
            },
            {
              "content": "About",
              "hierarchy": "footer/link",
              "href": "https://holocron.so/?",
            },
            {
              "content": "Blog",
              "hierarchy": "footer/link",
              "href": "https://holocron.so/blog?",
            },
            {
              "content": "Contact",
              "hierarchy": "footer/link",
              "href": "/cdn-cgi/l/email-protection#abdfc4c6c6d2ebc3c4c7c4c8d9c4c585d8c4",
            },
            {
              "content": "Privacy",
              "hierarchy": "footer/link",
              "href": "https://holocron.so/privacy?",
            },
            {
              "content": "Terms",
              "hierarchy": "footer/link",
              "href": "https://holocron.so/terms?x",
            },
          ]
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
