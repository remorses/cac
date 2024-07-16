import { Button } from '@nextui-org/react'
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Link, json, redirect } from '@remix-run/react'
import NavFramerComponent from '../framer/nav'
import { framerPluginUrl, framerUrl } from '../lib/env'
import HeroFramerComponent from '../framer/hero'
import FooterFramerComponent from '../framer/footer'
import { getSupabaseSession } from '../lib/supabase.server'
import FeatureListFramerComponent from '../framer/feature-list'
import PricingBannerFramerComponent from '../framer/pricing-banner'

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
        <div className='flex flex-col grow min-h-full h-full gap-[100px] items-stretch'>
            <NavFramerComponent.Responsive
                variants={{ base: 'Mobile', md: 'Tablet', lg: 'Desktop' }}
                framerPlugin={framerPluginUrl}
                className='!w-full'
            />
            <HeroFramerComponent.Responsive
                variants={{ base: 'mobile', md: 'desktop' }}
                style={{ width: '100%' }}
                secondButton={framerUrl}
                cta={framerPluginUrl}
            />
            <div className='grow'></div>
            <FeatureListFramerComponent.Responsive
                variants={{ base: 'mobile', md: 'desktop' }}
                className='!w-full'
            />
            <PricingBannerFramerComponent.Responsive
                framerUrl={framerPluginUrl}
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
