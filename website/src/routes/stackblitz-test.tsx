import { useEffect } from 'react'
import { generateStackblitzProject } from 'website/src/lib/utils'

export default function Page() {
    const startProject = () => {
        generateStackblitzProject({projectId: '3e9f5e2dfe1fa837'})
    }

    return (
        <button onClick={startProject}>
            Start Project
        </button>
    )
}
