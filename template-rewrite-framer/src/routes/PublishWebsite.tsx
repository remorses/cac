import { Button } from '@/components/Button'
import { useNavigate } from 'react-router'
import { Form } from 'react-router-dom'

export function IsWebsitePublished() {
    const navigate = useNavigate()

    return (
        <Form method='GET' className='flex flex-col justify-start gap-4'>
            <div className='opacity-70'>
                Click the publish button, this is required to get the current
                website screenshot
            </div>
            <Button type='submit' className='framer-button-primary'>
                Ok, I clicked publish
            </Button>
        </Form>
    )
}
