import type { LoaderFunctionArgs } from '@remix-run/node'

import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import {
    createSupabaseAdmin,
    createSupabaseAnon,
    getSupabaseSession,
} from '../lib/supabase.server'
import { RaycastLink } from '../components/RaycastLink'
import { raycastLink } from '../lib/utils'
import { Link } from '@nextui-org/react'
import { framerUrl } from '../lib/env'
import { BlockWithStep } from '../components/BlockWithStep'
import { generatePassword } from '../lib/ssr'
import { notifyError } from '../lib/errors'
import { db } from 'db/kysely'

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
    const operator = await db
        .selectFrom('auth.users')
        .where('id', '=', user.id)
        .selectAll()
        .executeTakeFirst()
    if (!operator) {
        throw new Error('No operator found for user')
    }

    const password = await Promise.resolve().then(async () => {
        if (operator.plainPassword) {
            return operator.plainPassword
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
            <h1 className='text-2xl font-semibold'>Crisp Setup Completed</h1>
            <BlockWithStep step={1}>
                <div className=''>
                    <Link
                        target='_blank'
                        href='https://www.raycast.com/?via=tommy'
                        className='underline'
                    >
                        Install Raycast
                    </Link>{' '}
                    if not already installed
                </div>
            </BlockWithStep>
            <BlockWithStep step={2}>
                <div className=''>
                    <Link
                        className='underline'
                        href='raycast://extensions/xmorse/crisp'
                    >
                        Install the Crisp Raycast extension
                    </Link>
                </div>
            </BlockWithStep>
            <BlockWithStep step={3} isLast>
                <Link
                    className='underline'
                    href={raycastLink({ session: sessionToPass })}
                >
                    Open Raycast Extension
                </Link>
                <div className=''>
                    After opening the Raycast extension you will be logged in
                    and be able to use it right away
                </div>
            </BlockWithStep>
        </div>
    )
}
