import { Link } from 'react-router-dom'
import { Paths, withMode } from 'plugin-migrate/src/lib/utils'
import { Button } from 'plugin-migrate/src/components/Button'
import { useEffect, useRef } from 'react'

export function AlreadyHaveWebsite() {
    return (
        <div className='flex flex-col grow shrink-0 justify-start gap-6'>
            <div className='flex grow items-center justify-center gap-2 flex-col text-balance text-center'>
                <div className='font-semibold'>
                    Do you already have a website?
                </div>
                <div className='opacity-70 max-w-[180px]'>
                    This plugin can use your existing site content and migrate
                    it to a project.
                </div>
            </div>

            <div className='flex gap-3'>
                <Link
                    tabIndex={-1}
                    className='w-full block'
                    to={withMode(Paths.getWebsiteInfo)}
                >
                    <Button
                        tabIndex={0}
                        autoFocus
                        className='flex justify-center items-center w-full gap-2 px-4 py-2 rounded-md'
                    >
                        Yes
                    </Button>
                </Link>
                <Link
                    tabIndex={-1}
                    className='w-full block'
                    to={withMode(Paths.prompt)}
                >
                    <Button className='flex justify-center items-center w-full gap-2 px-4 py-2 rounded-md'>
                        No
                    </Button>
                </Link>
            </div>
        </div>
    )
}
