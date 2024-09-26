import type { MetaFunction } from '@remix-run/node'
import FeatureListFramerComponent from '../framer/feature-list'
import FooterFramerComponent from '../framer/footer'
import HeroFramerComponent from '../framer/hero'
import NavFramerComponent from '../framer/nav'
import PricingBannerFramerComponent from '../framer/pricing-banner'
import { installFramerPluginUrl, framerUrl, env } from '../lib/env'
// @ts-ignore
import orgImg from 'website/public/migrate-plugin-assets/ogimage.jpeg'

export const meta: MetaFunction = () => {
    return [
        { title: 'Migrate Template - Framer Plugin' },
        {
            name: 'description',
            content:
                'Framer Plugin to migrate content from your existing website to a new Framer template, or start from scratch with a description of your new website. Save hours of work',
        },
        {
            property: 'og:image',
            content: new URL(orgImg, env.PUBLIC_URL).href,
        },
    ]
}

export default function Index() {
    return (
        <div className='flex flex-col -hue-rotate-30 grow min-h-full h-full gap-[100px] items-stretch'>
            <NavFramerComponent.Responsive
                variants={{ base: 'Mobile', md: 'Tablet', lg: 'Desktop' }}
                framerPlugin={installFramerPluginUrl}
                className='!w-full'
            />
            <HeroFramerComponent.Responsive
                variants={{ base: 'mobile', md: 'desktop' }}
                style={{ width: '100%' }}
                // secondButton={framerUrl}
                cta={installFramerPluginUrl}
            />
            <div className='grow'></div>
            <FeatureListFramerComponent.Responsive
                variants={{ base: 'mobile', md: 'desktop' }}
                className='!w-full'
            />
            <PricingBannerFramerComponent.Responsive
                framerUrl={installFramerPluginUrl}
                variants={{ base: 'Mobile', md: 'Tablet', lg: 'Desktop' }}
                className='!w-full'
            />
            <div className='grow ' />
            <Footer />
        </div>
    )
}

export function Footer() {
    return (
        <FooterFramerComponent.Responsive
            variants={{ base: 'Mobile', md: 'Tablet', lg: 'Desktop' }}
            className='!w-full '
            terms={new URL('/terms', env.PUBLIC_URL).toString()}
            login={new URL('/login', env.PUBLIC_URL).toString()}
            policy={new URL('/privacy', env.PUBLIC_URL).toString()}
            year={String(new Date().getFullYear())}
        />
    )
}
