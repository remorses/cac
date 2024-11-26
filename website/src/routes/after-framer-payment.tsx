// http://localhost:8045/spiceblow/after-payment
import { ActionFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export const loader = async () => {
    return json({ message: 'You can go back to Framer now' })
}

export default function AfterPayment() {
    const { message } = useLoaderData<typeof loader>()

    return (
        <div className='flex flex-col max-w-md text-center mx-auto justify-center items-center h-screen'>
            <div className='text-2xl font-bold'>{message}</div>
            <div className='mt-4 opacity-60 text-balance '>
                You can now return to Framer and continue using the Framer
                plugin.
            </div>
        </div>
    )
}
