import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData } from 'react-router'
import { env } from '../lib/env'
// @ts-ignore
import orgImg from 'website/public/migrate-plugin-assets/ogimage.jpeg'
import ContactFramerComponent from '../framer/contact'
import { Footer } from './home'
import { PageContainer } from '../components/Container'

export const meta: MetaFunction = () => {
    return [
        { title: 'Contact Tommy' },
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

type LoaderData = {
    initialMessage?: string;
};

export const loader = ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const initialMessage = url.searchParams.get('initialMessage') || undefined;
    return { initialMessage };
};

export default function Index() {
    const { initialMessage } = useLoaderData() as LoaderData;
    return (
        <PageContainer>
            <div className='flex flex-col grow w-full items-center p-16 mx-auto gap-16'>
                <ContactFramerComponent.Responsive
                    // @ts-ignore
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            const form = document.querySelector('form')
                            if (form) {
                                form.submit()
                                e.preventDefault()
                            }
                        }
                    }}
                    defaultMessageValue={initialMessage}
                    className=''
                />
                <div className='grow'></div>
            </div>
        </PageContainer>
    )
}
