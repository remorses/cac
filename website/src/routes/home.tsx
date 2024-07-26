import type { MetaFunction } from '@remix-run/node'
import FeatureListFramerComponent from '../framer/feature-list'
import FooterFramerComponent from '../framer/footer'
import HeroFramerComponent from '../framer/hero'
import NavFramerComponent from '../framer/nav'
import PricingBannerFramerComponent from '../framer/pricing-banner'
import { installFramerPluginUrl, framerUrl } from '../lib/env'

export const meta: MetaFunction = () => {
    return [
        { title: 'Unframer - Framer Plugins' },
        {
            name: 'description',
            content: 'Framer Plugins to make Framer more powerful',
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
            terms='/terms'
            login='/login'
            policy='/privacy'
            year={String(new Date().getFullYear())}
        />
    )
}
