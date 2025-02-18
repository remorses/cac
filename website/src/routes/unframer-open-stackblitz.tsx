import { Button, Spinner } from '@nextui-org/react'
import { useEffect } from 'react'
import { generateStackblitzProject } from 'website/src/lib/utils'

export default function OpenStackblits() {
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        const projectId = searchParams.get('projectId')
        const title = searchParams.get('title') || ''
        generateStackblitzProject({ projectId, title })
    }, [])
    return (
        <div className='flex gap-6 flex-col items-center justify-center h-screen'>
            <Spinner />
            <Button className=''>
                <div className='flex items-center text-xs justify-center gap-2'>
                    {/* <MaterialSymbolsBolt className="size-[14px] shrink-0" /> */}
                    Open Demo Project in Stackblitz
                </div>
            </Button>
        </div>
    )
}
