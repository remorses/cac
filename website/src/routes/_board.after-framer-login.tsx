import { LoaderFunctionArgs } from '@remix-run/node'
import { db } from 'db/kysely'
import { generatePassword } from 'website/src/lib/ssr.server'
import { getSupabaseSession } from '../lib/supabase.server'

export default function Page({}) {
    return (
        <>
            <div className='w-full gap-[60px] flex flex-col items-center'>
                <div className='text-2xl max-w-[300px] text-center'>
                    You can go back to Framer to complete the login
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
    const url = new URL(request.url)

    const key = url.searchParams.get('key') || ''
    if (!key) {
        throw new Error('No key provided')
    }
    const [framerRequest, authUser] = await Promise.all([
        db
            .insertInto('FramerLoginRequest')
            .values({ key, createdAt: new Date(), usedByUserId: user.id })
            .onConflict((oc) => {
                return oc.doNothing()
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
    if (!authUser.plainPassword) {
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
    }

    return {}
}
