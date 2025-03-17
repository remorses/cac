import type { LoaderFunctionArgs } from 'react-router'

import { Link } from '@nextui-org/react'
import { data as json } from 'react-router'
import { useLoaderData } from 'react-router'
import { db } from 'db/kysely'
import { generatePassword } from 'website/src/lib/ssr.server'
import { BlockWithStep } from '../components/BlockWithStep'
import { framerUrl, installFramerPluginUrl } from '../lib/env'
import { createSupabaseAnon, getSupabaseSession } from '../lib/supabase.server'

export let loader = async ({ request }: LoaderFunctionArgs) => {
    const { headers, supabase, user, redirectTo } = await getSupabaseSession({
        request,
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

    return json({}, { headers })
}

export default function Page() {
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
