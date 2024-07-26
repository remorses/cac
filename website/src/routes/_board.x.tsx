import type { LoaderFunctionArgs } from '@remix-run/node'

import { Link } from '@nextui-org/react'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { db } from 'db/kysely'
import { generatePassword } from 'website/src/lib/ssr.server'
import { BlockWithStep } from '../components/BlockWithStep'
import { framerUrl, installFramerPluginUrl } from '../lib/env'
import { createSupabaseAnon, getSupabaseSession } from '../lib/supabase.server'

export let loader = async ({ request, response }: LoaderFunctionArgs) => {
    const { headers, supabase, user, redirectTo } = await getSupabaseSession({
        request,
        response,
    })
    if (redirectTo) {
        console.log('redirecting to login')
        return redirectTo
    }
    if (!user || !user.email) {
        throw new Error('user has no email or not found')
    }
    const authUser = await db
        .selectFrom('auth.users')
        .where('id', '=', user.id)
        .selectAll()
        .executeTakeFirst()
    if (!authUser) {
        throw new Error('No operator found for user')
    }

    const password = await Promise.resolve().then(async () => {
        if (authUser.plainPassword) {
            return authUser.plainPassword
        }
        console.log('Creating user password')
        let password = generatePassword()
        const {
            data: {},
            error,
        } = await supabase.auth.updateUser({
            password,
        })

        if (error) {
            console.error('Failed to create user password')
            throw error
        }
        await db
            .updateTable('auth.users')
            .set('plainPassword', password)
            .where('id', '=', user.id)
            .execute()

        return password
    })
    const tempSupabase = createSupabaseAnon()
    // i am logging in again with password because supabase will log out the user if the refresh token is used in 2 places at the same time
    const {
        data: { session: sessionToPass },
        error: signInError,
    } = await tempSupabase.auth.signInWithPassword({
        email: user.email,
        password,
    })
    if (signInError) {
        console.error('Failed to sign in')
        throw signInError
    }
    if (!sessionToPass) {
        throw new Error('No session')
    }

    return json({ sessionToPass }, { headers })
}

export default function Page() {
    const { sessionToPass } = useLoaderData<any>()

    return (
        <div className='flex max-w-[500px] flex-col items-center gap-4'>
            <h1 className='text-2xl font-semibold'>Plugin Setup Completed</h1>
            <BlockWithStep step={1}>
                <div className=''>
                    <Link
                        target='_blank'
                        href={installFramerPluginUrl}
                        className='underline'
                    >
                        Install the Framer plugin
                    </Link>{' '}
                    if not already installed
                </div>
            </BlockWithStep>
            <BlockWithStep isLast step={2}>
                <div className=''>
                    <Link
                        target='_blank'
                        className='underline'
                        href={framerUrl}
                    >
                        Open Framer and use the plugin
                    </Link>
                </div>
            </BlockWithStep>
        </div>
    )
}
