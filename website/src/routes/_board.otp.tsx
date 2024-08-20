import { zfd } from 'zod-form-data'
import { z } from 'zod'
import { ActionFunctionArgs } from '@remix-run/node'
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

const otpSchema = zfd.formData({
    code: z.string().length(6),
    email: z.string().email(),
    next: z.string(),
})

export async function action({ request, }:ActionFunctionArgs) {
    try {
        const { headers, supabase, userId } = await getSupabaseSession({
            request,
           
        })

        const form = await request.formData()
        const { code, next, email } = otpSchema.parse(form)
        // console.log({ code, next, email })
        const { error, data } = await supabase.auth.verifyOtp({
            type: 'email',
            email,
            token: code,
        })
        if (error) {
            return json({ error: error.message }, { status: 400 })
        }
        return redirect(next || '/x', { headers })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            error = fromZodError(error)
        }
        notifyError(error, 'Error verifying OTP')
        return json({ error: error.message }, { status: 400 })
    }
}

export default function Page() {
    return <OtpPage />
}

function OtpPage() {
    const [value, setValue] = useState('')
    const submit = useSubmit()
    const [searchParams] = useSearchParams()
    const nav = useNavigation()

    const isLoading = !!nav.formAction
    const email = searchParams.get('email') || ''
    const actionData = useActionData<typeof action>()
    if (!email) {
        return (
            <div className='text-red-300'>Missing email search parameter</div>
        )
    }
    return (
        <Form method='POST' className='flex flex-col items-center gap-6'>
            <div className='text-center text-xl '>
                Enter the OTP code received at {email}
            </div>
            <div className=''>
                <input type='hidden' name='email' value={email} />
                <input
                    type='hidden'
                    name='next'
                    value={searchParams.get('next') || ''}
                />
                <input type='hidden' name='code' value={value} />
                <InputOTP
                    className=''
                    autoFocus
                    onComplete={(e) => {
                        const form = document.querySelector('form')
                        if (!form) return
                        submit(form)
                    }}
                    value={value}
                    onChange={setValue}
                    maxLength={6}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>
            <Button
                className='w-full max-w-[300px]'
                isLoading={isLoading}
                type='submit'
            >
                Login
            </Button>
            <div className='text-red-300 text-sm'>{actionData?.error}</div>
        </Form>
    )
}
