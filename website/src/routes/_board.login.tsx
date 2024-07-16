import type { LoaderFunctionArgs } from '@remix-run/node'
import { zfd } from 'zod-form-data'

import { Button, Input } from '@nextui-org/react'
import { json, redirect } from '@remix-run/node'
import {
    Form,
    useActionData,
    useNavigation,
    useSearchParams,
} from '@remix-run/react'
import { createSupabaseAnon, getSupabaseSession } from '../lib/supabase.server'

import { z, ZodError } from 'zod'
import { notifyError } from '../lib/errors'
import { syncDbWithCrisp } from '../lib/ssr'
import { otpRedirectLink } from '../lib/utils'

export let loader = async ({ request, response }: LoaderFunctionArgs) => {
    const { headers, user, session } = await getSupabaseSession({
        request,
        response,
    })

    if (user?.id) {
        console.log('redirecting to /x because already logged in')
        return redirect('/x', { headers })
    }

    return json({ success: true }, { headers })
}

const schema = zfd.formData({
    email: z.string().email(),
})

export let action = async ({ request }: LoaderFunctionArgs) => {
    const { email } = schema.parse(await request.formData())
    const sites = await syncDbWithCrisp()
    // console.log({ sites })
    const operator = sites.find((site) =>
        site?.operators?.find((op) => op.details.email === email),
    )
    if (!operator) {
        return json(
            {
                error: 'No Crisp site found with this email, use the same email as your Crisp account',
            },
            { status: 400 },
        )
    }
    const supabase = createSupabaseAnon()
    // const admin = createSupabaseAdmin()
    // await admin.auth.admin.createUser({ email, })
    const { error, data } = await supabase.auth.signInWithOtp({
        email,

        options: {
            // emailRedirectTo: '/x',
        },
    })

    if (error) {
        notifyError(error, 'Sign in error')

        return { error: error.message }
    }

    const redirectLink = otpRedirectLink({
        email,
        next: request.url,
    })
    return redirect(redirectLink)
}

export default function LoginWithGoogle() {
    const actionData = useActionData<typeof action>()

    const [searchParams] = useSearchParams()
    const initialEmail = searchParams.get('email') || undefined
    const navigation = useNavigation()
    const isLoading = !!navigation.formAction
    return (
        <>
            <Form
                method='POST'
                className='flex gap-12 flex-col items-center justify-center'
            >
                <div className='flex text-center flex-col gap-3'>
                    {/* <div className='text-2xl'>Welcome</div> */}
                    <div className='text-2xl'>
                        Use the same email you use in Crisp
                    </div>
                    <div className='opacity-80 '>
                        Login only works if you already installed the Crisp
                        plugin
                    </div>
                </div>
                <div className='flex gap-2'>
                    <Input
                        type='email'
                        name='email'
                        defaultValue={initialEmail}
                        placeholder='tommy@example.com'
                        className='w-[300px]'
                    ></Input>
                    <Button isLoading={isLoading} type='submit'>
                        Login
                    </Button>
                </div>
                <div className='text-sm text-red-300'>{actionData?.error}</div>
            </Form>
        </>
    )
}
