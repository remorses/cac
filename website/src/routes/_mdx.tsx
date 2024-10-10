// import "@code-hike/mdx/styles"
import { MetaFunction, Outlet } from '@remix-run/react'
import { MDXProvider } from '@mdx-js/react'
import { MDXComponents } from 'mdx/types'

const components: MDXComponents = {}

export default function Page() {
    return (
        <MDXProvider components={components}>
            <div className='px-6 md:px-12 pt-12 pb-24 md:pt-24 w-full flex flex-col items-center '>
                <div
                    style={{
                        contentVisibility: 'auto',
                    }}
                    className='prose dark:prose-invert prose-quoteless items-start min-w-0 w-full max-w-[800px] lg:prose-img:max-w-[500px] prose-img:mx-auto'
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
