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
            secret: secret || undefined,
        }

        // Remove the query params
        url.searchParams.delete('userId')
        url.searchParams.delete('secret')

        // Set the cookie and redirect
        return redirect(url.pathname + url.search, {
            headers: {
                'Set-Cookie': serialize(
                    'mcpUrlInfo',
                    encodeURIComponent(JSON.stringify(mcpUrlInfo)),
                    {
                        path: '/',
                        httpOnly: false, // Allow JS access
                        sameSite: 'lax',
                        maxAge: 60 * 60 * 24 * 30, // 30 days
                    },
                ),
                'Cache-Control':
                    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            },
        })
    }

    return null
}

function CursorIcon({}) {
    return (
        <svg className='size-5' viewBox='0 0 466.73 533.32' xmlns='http://www.w3.org/2000/svg'>
            <path
                d='m233.37 266.66 231.16 133.46c-1.42 2.46-3.48 4.56-6.03 6.03l-216.06 124.74c-5.61 3.24-12.53 3.24-18.14 0l-216.06-124.74c-2.55-1.47-4.61-3.57-6.03-6.03z'
                fill='#72716d'
            />
            <path
                d='m233.37 0v266.66l-231.16 133.46c-1.42-2.46-2.21-5.3-2.21-8.24v-250.44c0-5.89 3.14-11.32 8.24-14.27l216.05-124.74c2.81-1.62 5.94-2.43 9.07-2.43z'
                fill='#55544f'
            />
            <path
                d='m464.52 133.2c-1.42-2.46-3.48-4.56-6.03-6.03l-216.06-124.74c-2.8-1.62-5.93-2.43-9.06-2.43v266.66l231.16 133.46c1.42-2.46 2.21-5.3 2.21-8.24v-250.44c0-2.95-.78-5.77-2.21-8.24z'
                fill='#43413c'
            />
            <path
                d='m448.35 142.54c1.31 2.26 1.49 5.16 0 7.74l-209.83 363.42c-1.41 2.46-5.16 1.45-5.16-1.38v-239.48c0-1.91-.51-3.75-1.44-5.36l216.42-124.95h.01z'
                fill='#d6d5d2'
            />
            <path
                d='m448.35 142.54-216.42 124.95c-.92-1.6-2.26-2.96-3.92-3.92l-207.39-119.74c-2.46-1.41-1.45-5.16 1.38-5.16h419.65c2.98 0 5.4 1.61 6.7 3.87z'
                fill='#fff'
            />
        </svg>
    )
}

export const InstallInCursorButton = () => {
    const [mcpUrlInfo, setMcpUrlInfo] = useState<{
        userId?: string
        secret?: string
    }>({})

    useEffect(() => {
        const cookies = parse(document.cookie)
        if (cookies.mcpUrlInfo) {
            try {
                const info = JSON.parse(decodeURIComponent(cookies.mcpUrlInfo))
                setMcpUrlInfo(info)
            } catch {}
        }
    }, [])

    const makeCursorInstallLink = (name: string, configObj: object) => {
        const json = JSON.stringify(configObj)
        const b64 = btoa(unescape(encodeURIComponent(json)))
        return `https://cursor.com/en/install-mcp?name=${encodeURIComponent(name)}&config=${encodeURIComponent(b64)}`
    }

    const userId = mcpUrlInfo.userId || 'xxx'
    const secret = mcpUrlInfo.secret || 'xxx'

    const cursorInstallUrl = makeCursorInstallLink('framer', {
        type: 'sse',
        url: `https://mcp.unframer.co/sse?id=${userId}&secret=${secret}`,
    })

    return (
        <a
            href={cursorInstallUrl}
            target='_blank'
            className='inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors no-underline'
        >
            <CursorIcon />
            Install in Cursor
        </a>
    )
}

export const CodeBlock = ({
    children,
    language,
    title,
}: {
    children: React.ReactNode
    language?: string
    title?: string
}) => {
    const [copied, setCopied] = useState(false)
    const [mcpUrlInfo, setMcpUrlInfo] = useState<{
        userId?: string
        secret?: string
    }>({})

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
            <pre
                className={`dark:bg-neutral-900 !mt-0 text-white whitespace-pre-wrap ${title ? 'rounded-b-lg' : 'rounded-lg'} p-4 overflow-x-auto`}
            >
                <code
                    className={
                        language
                            ? `language-${language} whitespace-pre-wrap`
                            : ''
                    }
                >
                    {content}
                </code>
            </pre>
        </div>
    )
}

const components: MDXComponents = {
    CodeBlock,
    InstallInCursorButton,
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
