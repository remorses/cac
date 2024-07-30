import { LoaderFunctionArgs } from '@remix-run/node'
import { db } from 'db/kysely'
import { generatePassword } from 'website/src/lib/ssr.server'
import { getSupabaseSession } from '../lib/supabase.server'
import { safeJsonParse } from 'website/src/lib/utils'

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
    const { headers, userId, supabase, user, redirectTo } =
        await getSupabaseSession({
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

    return {}
}
