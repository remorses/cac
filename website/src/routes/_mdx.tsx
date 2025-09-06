// import "@code-hike/mdx/styles"
import { Outlet, redirect } from 'react-router'
import { CopyIcon, CheckIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-typescript'
// import 'prismjs/components/prism-toml' this adds a weird new line on some tokens because of display table
import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from 'mdx/types'
import { serialize, parse } from 'cookie'
import type { Route } from './+types/_mdx'

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const secret = url.searchParams.get('secret')

    if (userId && secret) {
        const mcpUrlInfo = {
            userId: userId || undefined,
            secret: secret || undefined
        }

        // Remove the query params
        url.searchParams.delete('userId')
        url.searchParams.delete('secret')

        // Set the cookie and redirect
        return redirect(url.pathname + url.search, {
            headers: {
                'Set-Cookie': serialize('mcpUrlInfo', encodeURIComponent(JSON.stringify(mcpUrlInfo)), {
                    path: '/',
                    httpOnly: false, // Allow JS access
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 30 // 30 days
                })
            }
        })
    }

    return null
}

export const CodeBlock = ({
    children,
    language,
    title
}: {
    children: React.ReactNode
    language?: string
    title?: string
}) => {
    const [copied, setCopied] = useState(false)
    const [mcpUrlInfo, setMcpUrlInfo] = useState<{ userId?: string; secret?: string }>({})

    useEffect(() => {
        const cookies = parse(document.cookie)
        if (cookies.mcpUrlInfo) {
            try {
                const info = JSON.parse(decodeURIComponent(cookies.mcpUrlInfo))
                setMcpUrlInfo(info)
            } catch {}
        }
    }, [])

    let content = String(children)

    // Replace placeholders with cookie values
    const replacements: Record<string, string> = {
        $userId: mcpUrlInfo.userId || 'xxx',
        $secret: mcpUrlInfo.secret || 'xxx',
    }

    Object.entries(replacements).forEach(([placeholder, value]) => {
        content = content.replaceAll(placeholder, value)
    })

    useEffect(() => {
        const loadPrismAndHighlight = async () => {

            Prism.highlightAll()
        }

        loadPrismAndHighlight()
    }, [content])

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    return (
        <div className='relative  flex flex-col not-prose group my-4'>
            {title && (
                <div className='bg-neutral-800 text-neutral-300 text-sm px-4 py-2 rounded-t-lg font-mono'>
                    {title}
                </div>
            )}
            <button
                onClick={handleCopy}
                className='absolute top-2 right-2 p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity z-10'
                title='Copy to clipboard'
            >
                {copied ? (
                    <CheckIcon className='size-4 text-green-400' />
                ) : (
                    <CopyIcon className='size-4 text-neutral-300' />
                )}
            </button>
            <pre className={`dark:bg-neutral-900 !mt-0 text-white whitespace-pre-wrap ${title ? 'rounded-b-lg' : 'rounded-lg'} p-4 overflow-x-auto`}>
                <code className={language ? `language-${language} whitespace-pre-wrap` : ''}>
                    {content}
                </code>
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
