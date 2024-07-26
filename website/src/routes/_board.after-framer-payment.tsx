import { LoaderFunctionArgs } from '@remix-run/node'
import {
    useLoaderData
} from '@remix-run/react'
import { getOrgCredits } from 'website/src/lib/credits'
import { getSupabaseSession } from '../lib/supabase.server'

export default function Page({}) {
    const { credits } = useLoaderData<typeof loader>()
    return (
        <>
            <div className='w-full gap-[60px] flex flex-col items-center'>
                <div className='text-2xl max-w-[300px] text-center'>
                    You now have {credits.remaining} credits
                </div>
                <div className='text-2xl max-w-[300px] text-center'>
                    You can go back to Framer to use the credits
                </div>
            </div>
        </>
    )
}

export async function loader({ request, response }: LoaderFunctionArgs) {
    const { headers, supabase, user, redirectTo } = await getSupabaseSession({
        request,
        response,
    })
    if (redirectTo) {
        console.log('redirecting to login')
        return redirectTo
    }
    if (!user || !user.email) {
        throw new Error('user not logged in')
    }
    const credits = await getOrgCredits({ orgId: user.id })

    return { credits }
}
