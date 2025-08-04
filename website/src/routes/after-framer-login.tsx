import { Button } from '@heroui/react'
import { LoaderFunctionArgs } from 'react-router'
import {
    Form,
    useActionData,
    useNavigation,
    useSearchParams,
} from 'react-router'
import { db } from 'db/kysely'
import { prisma } from 'db'
import { safeJsonParse } from 'website/src/lib/utils'
import { getSupabaseSession } from '../lib/supabase.server'
import { PluginName } from 'db'

export default function Page({}) {
    const actionData = useActionData<typeof action>()
    const [searchParams] = useSearchParams()

    let inner = null as any

    const isLoading = useNavigation().state !== 'idle'

    if (actionData?.confirmed) {
        inner = (
            <div className='text-2xl flex flex-col gap-6 items-center max-w-[300px] text-center'>
                <PhFramerLogoFill className='!w-12 text-white' />
                <div className=''>
                    You can go back to Framer to complete the login
                </div>
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
                    {/* <Button
                        onClick={() => {
                            window.location.href = env.PUBLIC_URL!
                        }}
                        className='w-auto shrink'
                        variant='light'
                        type='button'
                    >
                        Cancel Login
                    </Button> */}
                </div>
            </Form>
        )
    }

    return (
        <>
            <div className='w-full md:-mt-[100px] grow justify-center h-full gap-[60px] flex flex-col items-center'>
                {inner}
            </div>
        </>
    )
}

export async function loader({ request }: LoaderFunctionArgs) {
    const { headers, userId, user, redirectTo } = await getSupabaseSession({
        request,
    })
    const url = new URL(request.url)
    const pluginName: PluginName | '' =
        (url.searchParams.get('pluginName') as any) || ''
    if (redirectTo) {
        return redirectTo
    }

    return {}
}

async function confirmLogin({
    key,
    projectName,
    projectId,
    requestData,
    userId,
    pluginName,
    framerUserId,
}: {
    key: string
    projectName: string
    projectId: string
    requestData: any
    userId: string
    pluginName?: PluginName
    framerUserId: string
}) {
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

    if (pluginName !== undefined && !PluginName[pluginName]) {
        pluginName = undefined
    }

    const [framerRequest, authUser] = await Promise.all([
        prisma.framerLoginSession.upsert({
            where: { key },
            create: {
                key,
                createdAt: new Date(),
                usedByUserId: userId,
                data: requestData,
                projectId,
                projectName,
                pluginName,
                orgId,
                framerUserId,
            },
            update: {},
        }),
        db
            .selectFrom('auth.users')
            .where('id', '=', userId)
            .selectAll()
            .executeTakeFirst(),
    ])
    if (!authUser) {
        throw new Error('No auth user found for user')
    }
    return { confirmed: true }
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
    const projectName = url.searchParams.get('projectName') || ''
    const projectId = url.searchParams.get('projectId') || ''
    const pluginName: any = url.searchParams.get('pluginName') || ''
    const framerUserId = url.searchParams.get('framerUserId') || ''
    let requestData = safeJsonParse(url.searchParams.get('data') || '{}')

    return await confirmLogin({
        key,
        projectName,
        projectId,
        requestData,
        pluginName,
        userId,
        framerUserId,
    })
}

export function PhFramerLogoFill(props) {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 256 256'
            {...props}
        >
            <path
                fill='currentColor'
                d='M200 112h-51l56.27 50a8 8 0 0 1-5.27 14h-64v64a8 8 0 0 1-13.66 5.66l-72-72A8 8 0 0 1 48 168v-64a8 8 0 0 1 8-8h51L50.69 46A8 8 0 0 1 56 32h144a8 8 0 0 1 8 8v64a8 8 0 0 1-8 8'
            ></path>
        </svg>
    )
}
