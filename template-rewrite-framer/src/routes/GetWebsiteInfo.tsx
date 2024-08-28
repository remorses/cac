import { Button } from 'template-rewrite-framer/src/components/Button'
import { Paths, withMode } from 'template-rewrite-framer/src/lib/utils'

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
                navigate(withMode(Paths.scrapeWebsite, { domain }), {})
            }}
            className='flex flex-col grow justify-start gap-4'
        >
            <div className='flex grow flex-col justify-start gap-3'>
                <div className='grow flex justify-center flex-col text-balance text-center gap-2'>
                    <div className='font-semibold'>Add your website</div>
                    <div className='opacity-70'>
                        The plugin will apply your content to the current page,
                        or add new text based on your website.
                    </div>
                </div>

                <input
                    placeholder='www.framer.com/home'
                    type='text'
                    autoFocus
                    required
                    name='domain'
                    className='rounded-md p-2 w-full bg-framer-tertiary'
                />
                <Button type='submit' className='framer-button-primary'>
                    Get Content
                </Button>
            </div>
        </form>
    )
}
