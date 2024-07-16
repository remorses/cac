import { Button, Link } from '@nextui-org/react'

export function RaycastLink({ raycastUrl }) {
    return (
        <Button

            as={Link}
            className='bg-blue-500'
            showAnchorIcon
            // className='font-bold'
            size='lg'
            variant='solid'
            href={raycastUrl}
        >
            Open Raycast Extension
        </Button>
    )
}
