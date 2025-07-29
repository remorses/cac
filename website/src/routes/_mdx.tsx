// import "@code-hike/mdx/styles"
import { Outlet, useSearchParams } from 'react-router'


import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from 'mdx/types'

export const CodeBlock = ({ children }: { children: React.ReactNode }) => {
    const [searchParams] = useSearchParams()

    let content = String(children)

    // Replace placeholders with query params
    const replacements: Record<string, string> = {
        $userId: searchParams.get('userId') || 'xxx',
        $secret: searchParams.get('secret') || 'xxx',
    }

    Object.entries(replacements).forEach(([placeholder, value]) => {
        content = content.replaceAll(placeholder, value)
    })

    return (
        <pre className='dark:bg-neutral-900 text-white rounded-lg p-4 overflow-x-auto my-4'>
            <code>{content}</code>
        </pre>
    )
}

const components: MDXComponents = {
    CodeBlock,
}

export default function Page() {
    return (
        <MDXProvider components={components}>
            <div className='px-6 md:px-12 pt-12 pb-24 md:pt-24 w-full flex flex-col items-center '>
                <div
                    style={{
                        contentVisibility: 'auto',
                    }}
                    className='prose  prose-neutral dark:prose-invert prose-quoteless items-start min-w-0 w-full max-w-[800px] lg:prose-img:max-w-[500px] prose-img:mx-auto'
                >
                    <Outlet />
                </div>
                <div className='pt-24 flex flex-col text-sm items-center gap-4'>
                    {/* <div className=''>
                        Written by{' '}
                        <a
                            className='underline'
                            href='https://twitter.com/__morse'
                        >
                            @__morse
                        </a>
                    </div> */}
                </div>
            </div>
        </MDXProvider>
    )
}
