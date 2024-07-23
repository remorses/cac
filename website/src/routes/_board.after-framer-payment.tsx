import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
    json,
    useSubmit,
    useLoaderData,
    useSearchParams,
    redirect,
    useNavigation,
    useActionData,
    Form,
} from '@remix-run/react'
import { useState } from 'react'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from '../components/otp'
import { getSupabaseSession } from '../lib/supabase.server'
import { Button } from '@nextui-org/react'
import { notifyError } from '../lib/errors'
import { fromZodError } from 'zod-validation-error'
import NavFramerComponent from '../framer/nav'
import { db } from 'db/kysely'
import { generatePassword } from 'website/src/lib/ssr.server'
import { getOrgCredits } from 'website/src/lib/credits'

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
