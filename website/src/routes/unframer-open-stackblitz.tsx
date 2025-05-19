import { Button, Spinner } from "@heroui/react"
import { useSearchParams } from 'react-router';
import { useEffect } from 'react'
import { generateStackblitzProject } from 'website/src/lib/utils'

export default function OpenStackblits() {
    const [searchParams] = useSearchParams()
    const projectId = searchParams.get('projectId')
    const title = searchParams.get('title') || ''

    return (
        <div className='flex gap-6 flex-col items-center justify-center h-screen'>
            <h1 className='max-w-sm text-center text-balance'>
                Click the button below to open a demo project with your Framer components in Stackblitz.
            </h1>
            <Button
                onPress={() => generateStackblitzProject({ projectId, title })}
                color='primary'
                className=''
            >
                <div className='flex items-center justify-center gap-2'>
                    {/* <MaterialSymbolsBolt className="size-[14px] shrink-0" /> */}
                    Open Demo Project in Stackblitz
                </div>
            </Button>
        </div>
    )
}
