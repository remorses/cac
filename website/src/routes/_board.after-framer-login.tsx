import { LoaderFunctionArgs } from '@remix-run/node'
import { db } from 'db/kysely'
import { generatePassword } from 'website/src/lib/ssr.server'
import { getSupabaseSession } from '../lib/supabase.server'
import { safeJsonParse } from 'website/src/lib/utils'
import {
    Form,
    useActionData,
    useNavigation,
    useSearchParams,
} from '@remix-run/react'
import { Button } from '@nextui-org/react'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from 'website/src/components/otp'
import { env } from 'website/src/lib/env'

export default function Page({}) {
    const actionData = useActionData<typeof action>()
    const [searchParams] = useSearchParams()

    let inner = null as any

    const isLoading = useNavigation().state !== 'idle'

    if (actionData?.confirmed) {
        inner = (
            <div className='text-2xl max-w-[300px] text-center'>
                You can go back to Framer to complete the login
            </div>
        )
    } else {
        let code = searchParams.get('code') || ''
        inner = (
            <Form method='post' className='gap-8 flex flex-col max-w-[700px] '>
                <div className='space-y-2'>
                    <div className=''>Device confirmation</div>
                    <div className='opacity-60'>
                        Please confirm this is the code displayed in your Framer
                        plugin screen
                    </div>
                </div>
                <div className='flex font-mono flex-row gap-6 text-4xl'>
                    {code.split('').map((char, i) => {
                        return (
                            <div
                                key={i}
                                className='p-3 rounded-md bg-default-50 px-6'
                            >
                                {char}
                            </div>
                        )
                    })}
                </div>
                <div className='flex gap-4'>
                    <Button
                        isLoading={isLoading}
                        className='w-auto shrink'
                        color='primary'
                        type='submit'
                    >
                        Confirm Login
                    </Button>
                    <Button
                        onClick={() => {
                            window.location.href = env.PUBLIC_URL!
                        }}
                        className='w-auto shrink'
                        variant='light'
                        type='button'
                    >
                        Cancel Login
                    </Button>
                </div>
            </Form>
        )
    }

    return (
        <>
            <div className='w-full gap-[60px] flex flex-col items-center'>
                {inner}
            </div>
        </>
    )
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { headers, userId, user, redirectTo } = await getSupabaseSession({
        request,
    })

    if (redirectTo) {
        return redirectTo
    }
    return {}
}

export async function action({ request }: LoaderFunctionArgs) {
    const { headers, userId, supabase, user, redirectTo } =
        await getSupabaseSession({
            request,
        })
    if (redirectTo) {
        console.log('redirecting to login')
        return redirectTo
    }
    if (!user || !user.email) {
        throw new Error('user not logged in')
    }
    const url = new URL(request.url)

    const key = url.searchParams.get('key') || ''
    let requestData = safeJsonParse(url.searchParams.get('data') || '{}')
    // console.log({ requestData })
    if (!key) {
        throw new Error('No key provided')
    }
    let orgId = userId
    await db
        .insertInto('Org')
        .values({
            orgId,
        })
        .onConflict((oc) => {
            return oc.columns(['orgId']).doNothing()
        })
        .execute()

    const [framerRequest, authUser] = await Promise.all([
        db
            .insertInto('FramerLoginSession')
            .values({
                key,
                createdAt: new Date(),
                usedByUserId: user.id,
                data: requestData,
                orgId,
            })
            .onConflict((oc) => {
                return oc.columns(['key']).doNothing()
            })
            .execute(),
        db
            .selectFrom('auth.users')
            .where('id', '=', user.id)
            .selectAll()
            .executeTakeFirst(),

        // db
        //     .updateTable('auth.users')
        //     .where('id', '=', user.id)
        //     .set({ raw_user_meta_data: JSON.stringify({}) }) // make session smaller
        //     .executeTakeFirst(),
    ])
    if (!authUser) {
        throw new Error('No auth user found for user')
    }
    return { confirmed: true }

    return {}
}
