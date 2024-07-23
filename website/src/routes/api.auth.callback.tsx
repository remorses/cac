import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { getSupabaseWithHeaders } from '../lib/supabase.server'
import { notifyError } from '../lib/errors'
import { prisma } from 'db/prisma'

export async function loader({ request, response }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const code = url.searchParams.get('code') || ''
    const type = url.searchParams.get('type') || ''
    const isFramerPlugin = url.searchParams.get('framer-plugin') || ''

    const next = url.searchParams.get('next') || '/x'

    if (code) {
        const { headers, supabase } = getSupabaseWithHeaders({
            request,
            response,
        })

        const {
            error,
            data: { user },
        } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            notifyError(error, 'Error exchanging code for session')
        }

        if (user) {
            const userId = user.id
            const org = await prisma.org.findFirst({
                where: {
                    orgId: userId,
                },
            })
            if (!org) {
                await prisma.org.upsert({
                    where: { orgId: userId },
                    create: {
                        name: user.email,
                    },
                    update: {},
                })
            }
        }

        return redirect(next, { headers })
    }
    if (type === 'magiclink') {
        const { headers, supabase } = getSupabaseWithHeaders({
            request,
            response,
        })
        const token_hash = url.searchParams.get('token_hash') || ''
        const { error } = await supabase.auth.verifyOtp({ token_hash, type })

        if (error) {
            notifyError(error, 'Error verifying OTP')
        }
        return redirect(next, { headers })
    }
    return redirect(next)
}
