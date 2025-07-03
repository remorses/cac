import { createExampleComponentCode } from 'unframer-workspace/src/exporter'
import { configFromFetch } from 'unframer-workspace/src/cli'
import { describe, expect, test } from 'vitest'
import { generateRepoName, generateUnframerRepo } from './unframer-github-repos'

test('generateRepoName', () => {
    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: 'My Project',
        }),
    ).toMatchInlineSnapshot(`"my-project-cf755"`)
    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: 'Untitled',
        }),
    ).toMatchInlineSnapshot(`"untitled-cf755"`)
    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: 'template (Copy)',
        }),
    ).toMatchInlineSnapshot(`"template-copy-cf755"`)
    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: '',
        }),
    ).toMatchInlineSnapshot(`"cf755"`)

    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: 'Hello World!',
        }),
    ).toMatchInlineSnapshot(`"hello-world-cf755"`)

    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: 'Repo_123',
        }),
    ).toMatchInlineSnapshot(`"repo-123-cf755"`)

    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: 'Something   With  Spaces',
        }),
    ).toMatchInlineSnapshot(`"something-with-spaces-cf755"`)

    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: '  Leading and Trailing  ',
        }),
    ).toMatchInlineSnapshot(`"leading-and-trailing-cf755"`)

    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: 'Ünicode Çhärß',
        }),
    ).toMatchInlineSnapshot(`"ünicode-çhärß-cf755"`)

    expect(
        generateRepoName({
            projectId: 'cf755ed7dsdf0319',
            projectTitle: 'CAPS lock',
        }),
    ).toMatchInlineSnapshot(`"caps-lock-cf755"`)
})

test(
    'create repo',
    async () => {
        const projectId = 'cf755ed7d59e0319'
        const res = await generateUnframerRepo({
            projectId,
            projectTitle: 'example test repo',
            repo: 'example-test-repo-2',
            projectSecret: 'x',
            // description: 'example test repo description',
        })
        // console.log(res)
    },
    1000 * 100,
)
test(
    'example code',
    async () => {
        const projectId = 'cf755ed7d59e0319'
        const { config } = await configFromFetch({ projectId })
        const { exampleCode } = await createExampleComponentCode({
            config,
            outDir: 'framer',
        })
        expect(exampleCode).toMatchInlineSnapshot(`
          "import './framer/styles.css'

          import NavigationFramerComponent from './framer/navigation'
          import HeroFramerComponent from './framer/hero'
          import PricingBannerFramerComponent from './framer/pricing-banner'
          import FooterFramerComponent from './framer/footer'
          import FeatureListFramerComponent from './framer/feature-list'
          import ServiceSliderFramerComponent from './framer/service-slider'
          import SectionTitleFramerComponent from './framer/section-title'
          import ButtonFramerComponent from './framer/button'
          import BrandLogoFramerComponent from './framer/brand-logo'
          import TestmonialItemFramerComponent from './framer/testmonial-item'
          import ArticlesCardFramerComponent from './framer/articles-card'

          export default function App() {
            return (
              <div className='flex flex-col items-center gap-3 '>
                <NavigationFramerComponent.Responsive
                  ctaVariant={"Primary"}
                />
                <HeroFramerComponent.Responsive/>
                <PricingBannerFramerComponent.Responsive/>
                <FooterFramerComponent.Responsive
                  year={"2024"}
                />
                <FeatureListFramerComponent.Responsive/>
                <ServiceSliderFramerComponent.Responsive/>
                <SectionTitleFramerComponent.Responsive
                  text={"We are pioneers in harnessing the power of Blockchain and Web3 technologies to drive innovation, security, and decentralization."}
                  title={"Smart Automation"}
                  tagline={"Systems and Building Web3"}
                  iconVisible={true}
                  textVisible={true}
                />
                <ButtonFramerComponent.Responsive
                  link={"/news"}
                  buttonTitle={"Read all blog"}
                  iconVisibility={true}
                />
                <BrandLogoFramerComponent.Responsive/>
                <TestmonialItemFramerComponent.Responsive
                  name1={"Wade Warren"}
                  paragraph={"Security is non-negotiable in the decentralized world, and we take this aspect very seriously. Our solutions are built with a robust emphasis on security, utilizing advanced cryptographic"}
                  designation={"Flutter Developer"}
                />
                <ArticlesCardFramerComponent.Responsive
                  date={"Mar 06, 2024 "}
                  link={"/news/:slug"}
                  title={"Discoveries from Our Thinkers"}
                  excerpt={"Experience seamless integration with decentralized applications (DApps)."}
                />
              </div>
            );
          };"
        `)
    },
    1000 * 100,
)
