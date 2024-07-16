import NavFramerComponent from '../framer/nav'
import { framerPluginUrl, framerUrl } from '../lib/env'
import { Footer } from '../routes/home'

export function PageContainer({ children }) {
    return (
        <div className='pt-2 w-full grow flex flex-col h-full'>
            <NavFramerComponent.Responsive
                crispPlugin={framerPluginUrl}
                ctaVariant=' Login button'
                className='!w-full'
                raycastUrl={framerUrl}
                variants={{ base: 'Mobile', lg: 'Desktop' }}
            />
            <div className='flex gap-12 pt-[100px] grow flex-col items-center text-gray-100 justify-center'>
                {children}
            </div>
            <div className='grow pb-[100px]'></div>
            <Footer />
        </div>
    )
}

