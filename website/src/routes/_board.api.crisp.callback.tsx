import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import {
    Form,
    json,
    useLoaderData,
    useNavigation,
    useSearchParams,
} from '@remix-run/react'
import { notifyError } from '../lib/errors'
import { generatePassword, getCrispData, syncSite } from '../lib/ssr'
import { createSupabaseAdmin, getSupabaseSession } from '../lib/supabase.server'
import { otpRedirectLink } from '../lib/utils'
import { Button } from '@nextui-org/react'
import { db } from 'db/kysely'

// https://app.krispcall.com/login?crm=crispchat&website_id=794809b8-5948-4269-a3ba-33ec690dabd7&token=35781a01-8153-4c52-a9f7-f04970c2e396&payload=&locale=en
export async function loader({ request, response }: LoaderFunctionArgs) {
    try {
        const url = new URL(request.url)
        const websiteId = url.searchParams.get('website_id') || ''
        const token = url.searchParams.get('token') || ''
        const selectedEmail = decodeURIComponent(
            url.searchParams.get('email') || '',
        )
        if (!websiteId || !token) {
            return json({
                state: 'error' as const,
                message: 'Invalid request, missing token or website_id',
            })
        }
        const { supabase, headers, session, user, userId } =
            await getSupabaseSession({
                request,
                response,
            })

        const { operators, site, sub } = await getCrispData({ websiteId })
        if (!sub) {
            return {
                state: 'error' as const,
                message: "Crisp plugin not connected, can't find site",
            }
        }

        if (token !== sub.token) {
            return json({
                state: 'error' as const,
                message: 'Invalid crisp token',
            })
        }

        const loggedInOperator = operators.find(
            (x) => x.details.email === session?.user?.email,
        )

        if (!loggedInOperator) {
            console.log(
                'Cannot find operator with user email: ${session?.user?.email}, different email in crisp and user, asking to re-login',
                operators.map((x) => x.details.email),
                'email confirmed at?',
                user?.email_confirmed_at,
            )
        }
        // if user is logged in and has an operator already, redirect to open the extension
        if (userId && loggedInOperator && user?.email_confirmed_at) {
            await syncSite({ websiteId })
            return redirect('/x', { headers })
        }
        const supabaseAdmin = createSupabaseAdmin()
        // TODO later, ask user what is his email to send otp not only to the owner. but i need to know the email before because it is needed for otp verification
        const owners = operators.filter((x) => x.details.role === 'owner')
        if (!owners.length) {
            return json({
                state: 'error' as const,
                message: 'No Crisp owner found with this website id',
            })
        }
        const emails = owners.map((x) => x.details.email)
        const email = (function () {
            if (emails.length === 1) {
                return emails[0]
            }
            return emails.find((x) => x === selectedEmail)
        })()
        if (!email) {
            return json({
                state: 'select-email' as const,
                emails,
            })
        }
        console.log(`logging in ${email}`)
        await syncSite({ websiteId })
        const [operator, dbUser] = await Promise.all([
            db
                .selectFrom('operators')
                .where('crispEmail', '=', email)
                .selectAll()
                .executeTakeFirst(),
            db
                .selectFrom('auth.users')
                .where('email', '=', email)
                .executeTakeFirst(),
        ])
        const password = await Promise.resolve().then(async () => {
            if (operator?.userPassword) {
                console.log(`using existing operator password`)
                return operator?.userPassword
            }
            console.log('Creating user password')
            let password = generatePassword()

            // if (error) {
            //     console.error('Failed to create user password')
            //     throw error
            // }
            await db
                .updateTable('operators')
                .set('userPassword', password)
                .where('crispEmail', '=', email)
                .execute()

            return password
        })

        if (!dbUser) {
            console.log('Creating new user after installation')
            const {
                error,
                data: { user },
            } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            })
            if (error) {
                console.log('Error creating user')
                throw error
            }
            if (!user) {
                throw new Error('User not created, something went wrong')
            }
        }
        const {
            data: { user: supabaseUser },
            error: sessionError,
        } = await supabase.auth.signInWithPassword({
            email,
            password,
            // options: {},
        })
        if (sessionError) {
            console.log('Error signing in with new user')
            throw sessionError
        }
        if (!supabaseUser) {
            throw new Error('User not found, something went wrong')
        }

        // update the operators and siteOperators to have the userId
        await syncSite({ websiteId })
        return redirect('/x', { headers })

        // await supabaseAdmin.auth.signInWithOtp({
        //     email,
        //     options: {
        //         shouldCreateUser: true,
        //         emailRedirectTo: request.url,
        //     },
        // })
        // // await Promise.all(
        // //     operators.map(async (operator) => {

        // //     }),
        // // )

        // const redirectLink = otpRedirectLink({ email, next: request.url })
        // console.log(
        //     'Redirecting to otp, then back to /crisp/callback to finish setup',
        //     redirectLink,
        // )
        // return redirect(redirectLink)
    } catch (error: any) {
        notifyError(error, 'Error verifying crisp token')
        return json(
            {
                message: error.message,
                state: 'error' as const,
            },
            { status: 500 },
        )
        // return new Response(error.message, { status: 500 })
    }
    return redirect('/')
}

export default function Page() {
    const data = useLoaderData<typeof loader>()
    const state = data.state
    const [searchParams] = useSearchParams()
    const navigation = useNavigation()
    const isLoading = navigation.state !== 'idle'
    if (state === 'error') {
        return (
            <div>
                <div className=''>Error</div>
                <div className=''>{data.message}</div>
            </div>
        )
    }
    if (state === 'select-email') {
        return (
            <Form  method='GET' className='flex flex-col gap-4'>
                {Array.from(searchParams.entries()).map(([key, value]) => (
                    <input key={key} type='hidden' name={key} value={value} />
                ))}
                <label htmlFor='' className='flex flex-col gap-4'>
                    <div className=''>What is your email?</div>
                    <select
                        name='email'
                        required
                        className='py-3 px-4 pe-9 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-default-200 dark:border-transparent dark:text-neutral-400 dark:focus:ring-neutral-600'
                    >
                        {data.emails.map((email) => (
                            <option value={email}>{email}</option>
                        ))}
                    </select>
                </label>
                <Button isLoading={isLoading} type='submit'>
                    Submit
                </Button>
            </Form>
        )
    }
    // if (state === 'success') {
    //     return (
    //         <div className='flex flex-col gap-8'>
    //             <div className=''>Crisp Setup Completed</div>
    //             <RaycastLink raycastUrl={data.raycastUrl} />
    //         </div>
    //     )
    // }
    return null
}
