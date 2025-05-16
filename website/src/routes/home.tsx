import type { MetaFunction } from 'react-router'
import FooterFramerComponent from '../framer-old/footer'
import { env } from '../lib/env'
// @ts-ignore
import orgImg from 'website/public/migrate-plugin-assets/ogimage.jpeg'
import TabsContentFramerComponent from '../framer/tabs-content'
import TopContentFramerComponent from '../framer/top-content'

export const meta: MetaFunction = () => {
    return [
        { title: 'The best Framer plugins' },
        {
            name: 'description',
            content:
                'Export Framer to React, sync Framer with GitHub, rewrite Framer content with AI, automatically migrate website content to Framer',
        },
        {
            property: 'og:image',
            content: new URL(orgImg, env.PUBLIC_URL).href,
        },
    ]
}

export default function Index() {
    return (
        <div className='flex w-full absolute left-0 flex-col bg-gray-50 grow min-h-[100vh] gap-[100px] items-stretch'>
            <div className='flex flex-col max-w-[800px] p-16 mx-auto gap-16'>
                <TopContentFramerComponent.Responsive className='' />
                <TabsContentFramerComponent.Responsive />
                {/* <Footer /> */}
            </div>
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
