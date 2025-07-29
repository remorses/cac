// import "@code-hike/mdx/styles"
import { Outlet, useSearchParams } from 'react-router'
import { CopyIcon, CheckIcon } from 'lucide-react'
import { useState } from 'react'

import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from 'mdx/types'

export const CodeBlock = ({ children }: { children: React.ReactNode }) => {
    const [searchParams] = useSearchParams()
    const [copied, setCopied] = useState(false)

    let content = String(children)

    // Replace placeholders with query params
    const replacements: Record<string, string> = {
        $userId: searchParams.get('userId') || 'xxx',
        $secret: searchParams.get('secret') || 'xxx',
    }

    Object.entries(replacements).forEach(([placeholder, value]) => {
        content = content.replaceAll(placeholder, value)
    })

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    return (
        <div className='relative group my-4'>
            <button
                onClick={handleCopy}
                className='absolute top-2 right-2 p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity'
                title='Copy to clipboard'
            >
                {copied ? (
                    <CheckIcon className='size-4 text-green-400' />
                ) : (
                    <CopyIcon className='size-4 text-neutral-300' />
                )}
            </button>
            <pre className='dark:bg-neutral-900 text-white rounded-lg p-4 overflow-x-auto'>
                <code>{content}</code>
            </pre>
        </div>
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
