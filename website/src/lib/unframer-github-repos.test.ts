import { createExampleComponentCode } from 'unframer-workspace/dist/exporter'
import { configFromFetch } from 'unframer-workspace/src/cli'
import { expect, test } from 'vitest'
import { generateUnframerRepo } from './unframer-github-repos'

const projectId = 'cf755ed7d59e0319'

test(
    'create repo',
    async () => {
        const res = await generateUnframerRepo({
            projectId,
            projectTitle: 'example test repo',

            repo: 'example-test-repo-2',

            secret: 'x',
            // description: 'example test repo description',
        })
        console.log(res)
    },
    1000 * 100,
)
test(
    'example code',
    async () => {
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
                  <div className='flex flex-col'>
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
                      <BrandLogoFramerComponent.Responsive
                          image={{"id":"VXQWmbuFTfjDJWrhQLD1KvfD4.svg","url":"https://framerusercontent.com/images/VXQWmbuFTfjDJWrhQLD1KvfD4.svg","resolution":"auto","thumbnailUrl":"https://framerusercontent.com/images/VXQWmbuFTfjDJWrhQLD1KvfD4.svg?scale-down-to=512"}}
                      />
                      <TestmonialItemFramerComponent.Responsive
                          image={{"id":"kHDxLXejuT3j57hc5doGlWU1Jh8.svg","url":"https://framerusercontent.com/images/kHDxLXejuT3j57hc5doGlWU1Jh8.svg","resolution":"auto","thumbnailUrl":"https://framerusercontent.com/images/kHDxLXejuT3j57hc5doGlWU1Jh8.svg?scale-down-to=512"}}
                          name1={"Wade Warren"}
                          paragraph={"Security is non-negotiable in the decentralized world, and we take this aspect very seriously. Our solutions are built with a robust emphasis on security, utilizing advanced cryptographic"}
                          designation={"Flutter Developer"}
                      />
                      <ArticlesCardFramerComponent.Responsive
                          date={"Mar 06, 2024 "}
                          link={"/news/:slug"}
                          image={{"src":"https://framerusercontent.com/images/uSJiTd2e5Fi7BUC4TtutHC7nf88.png","type":"image","value":"data:framer/asset-reference,uSJiTd2e5Fi7BUC4TtutHC7nf88.png?originalFilename=Blog+1.png&preferredSize=auto"}}
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
