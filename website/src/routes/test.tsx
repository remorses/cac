import { Button } from '@nextui-org/react'
import { useLoaderData } from '@remix-run/react'

export function loader() {
    return (
        <Button
            onClick={() => {
                alert('hello')
            }}
            className='bg-gray-100'
        >
            hello
        </Button>
    )
}

export default function Page() {
    const data = useLoaderData()
    return data
}
