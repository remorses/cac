import { Link } from 'react-router-dom'
import { Paths, withMode } from 'template-rewrite-framer/src/lib/utils'
import { Button } from 'template-rewrite-framer/src/components/Button'
import { useEffect, useRef } from 'react'

export function AlreadyHaveWebsite() {
    return (
        <div className='flex flex-col grow shrink-0 justify-start gap-6'>
            <div className='opacity-70'>
                This plugin can use your existing website content to migrate it
                to Framer
            </div>
            <div className='flex gap-4  '>
                <Link
                    tabIndex={-1}
                    className='w-full'
                    to={withMode(Paths.getWebsiteInfo)}
                >
                    <Button
                        tabIndex={0}
                        autoFocus
                        className='flex justify-center items-center w-full gap-2 px-4 py-2 rounded-md'
                    >
                        Yes, use existing site content
                    </Button>
                </Link>
                <Link
                    tabIndex={-1}
                    className='w-full'
                    to={withMode(Paths.prompt)}
                >
                    <Button className='flex justify-center items-center w-full gap-2 px-4 py-2 rounded-md'>
                        No, start from scratch
                    </Button>
                </Link>
            </div>
        </div>
    )
}
