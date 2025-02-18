import { Spinner } from '@nextui-org/react'
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
        <div className='flex flex-col items-center justify-center h-screen'>
            <Spinner />
        </div>
    )
}
