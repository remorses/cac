import { Spinner } from "@heroui/react"
import { useEffect } from 'react'
import { sleep } from 'website/src/lib/utils'

export default function PluginLinkMigrate() {
    useEffect(() => {
        sleep(2 * 1000).then(() => {
            window.location.href =
                'https://www.framer.com/marketplace/plugins/migrate--atog5qz8imo0pji1b10z8alr7/'
        })
    }, [])

    return (
        <>
            <div className='flex flex-col items-center justify-center h-screen'>
                <Spinner />
            </div>
            <script
                dangerouslySetInnerHTML={{
                    __html: 'window.lemonSqueezyAffiliateConfig = { store: "unframer", debug: true };',
                }}
            />

            <script src='https://lmsqueezy.com/affiliate.js' />
        </>
    )
}
