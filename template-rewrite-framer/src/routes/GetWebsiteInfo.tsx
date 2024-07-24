import { Button } from '@/components/Button'
import {
    Paths,
    withMode
} from '@/lib/utils'

import { useLocation, useNavigate } from 'react-router'

export function GetWebsiteInfo() {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                const data = new FormData(e.target as any)
                const domain = data.get('domain')?.toString() || ''
                navigate(withMode(Paths.scrapeWebsite, { domain }))
            }}
            className='flex flex-col justify-start gap-4'
        >
            <div className='flex flex-col justify-start gap-4'>
                <div className='opacity-70'>
                    The website's content will be extracted to apply to this new
                    website.
                </div>
                <input
                    placeholder='example.com'
                    type='text'
                    name='domain'
                    className='rounded-md p-2 w-full bg-framer-tertiary'
                />
                <Button type='submit' className='framer-button-primary'>
                    Get Website Content
                </Button>
            </div>
        </form>
    )
}
