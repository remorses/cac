
import { Link } from 'react-router-dom'
import { Paths, withMode } from '@/lib/utils'


export function AlreadyHaveWebsite() {
    return (
        <div className='flex flex-col justify-start gap-6'>
            <div className='opacity-70'>
                This plugin can use your existing website content to migrate it
                to Framer
            </div>
            <div className='flex gap-4 '>
                <Link
                    className='flex items-center bg-framer-secondary border-framer-secondary grow gap-2 px-4 py-2 rounded-md  cursor-pointer'
                    to={withMode(Paths.checkWebsiteIsPublished)}
                >
                    Yes
                </Link>
                <Link
                    className='flex items-center grow gap-2 px-4 py-2 rounded-md bg-framer-secondary cursor-pointer'
                    to={withMode(Paths.prompt)}
                >
                    No
                </Link>
            </div>
        </div>
    )
}