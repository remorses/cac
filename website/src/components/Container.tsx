import NavFramerComponent from '../framer/navigation'
import { installFramerPluginUrl } from '../lib/env'
import { Footer } from '../routes/home'

export function PageContainer({ children }) {
    return (
        <div className='pt-2 w-full grow flex flex-col h-full'>
            <NavFramerComponent.Responsive
                framerPlugin={installFramerPluginUrl}
                // ctaVariant=' Login button'
                className='!w-full'
                // variants={{ base: 'Mobile', lg: 'Desktop' }}
            />
            <div className='flex gap-12 pt-[100px] grow flex-col items-center text-gray-100 justify-center'>
                {children}
            </div>
            <div className='grow pb-[100px]'></div>
            <Footer />
        </div>
    )
}
