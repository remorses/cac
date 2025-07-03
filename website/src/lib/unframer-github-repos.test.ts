import { createExampleComponentCode } from 'unframer-workspace/src/exporter'
import { configFromFetch } from 'unframer-workspace/src/cli'
import { describe, expect, test } from 'vitest'
import { generateRepoName, generateUnframerRepo } from './unframer-github-repos'
import { Octokit } from 'octokit'
import { env } from './env'

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
    'create repo, without ai',
    async () => {
        const projectId = 'cf755ed7d59e0319'
        const repo = 'example-test-repo-3'
        const octokit = new Octokit({ auth: env.GITHUB_TOKEN_UNFRAMER_ORG })
        try {
            console.log(`deleting repo ${repo}`)
            await octokit.rest.repos.delete({
                owner: 'unframer',
                repo,
            })
            // It can take a few seconds for GitHub to fully delete the repo
            console.log(`waiting for github to delete repo ${repo}`)
            await new Promise((res) => setTimeout(res, 4 * 1000))
        } catch (e) {
            if (e.status === 404) {
                // repo does not exist, ok
            } else {
                throw e
            }
        }
        const start = Date.now()
        const res = await generateUnframerRepo({
            projectId,
            projectTitle: 'example test repo',
            repo,
            projectSecret: 'x',
            addProjectUserAsContributor: true,
            useAI: false,
            // description: 'example test repo description',
        })
        const duration = Date.now() - start
        console.log(`Time taken: ${duration / 1000}s`) // takes about 20 seconds first time, 6 seconds on existing repo
        // console.log(res)
    },
    1000 * 100,
)

test(
    'create repo for 547a70ab05fb01e5',
    async () => {
        const projectId = '547a70ab05fb01e5'
        const res = await generateUnframerRepo({
            projectId,
            repo: `test-for-547a70ab05fb01e5-ai`,
            addProjectUserAsContributor: false,
            useAI: true,
            projectSecret: '547a70ab05fb01e5',
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
