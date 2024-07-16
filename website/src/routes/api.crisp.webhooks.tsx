import { ActionFunctionArgs, json } from '@remix-run/node'
import { notifyError } from '../lib/errors'

export enum AIStatus {
    enabled = 'enabled',
    disabled = 'disabled',
}

export enum Action {
    enable_ai = 'enable_ai',
    request_human = 'request_human',
    mark_as_resolved = 'mark_as_resolved',
}

export type ConversationMetadata = {
    aiStatus?: AIStatus
    choice?: Action
    aiDisabledDate?: Date
}

type HookEventType =
    | 'message:send'
    | 'message:received'
    | 'message:updated'
    | 'message:compose:send'
    | 'message:notify:unread:send'
    | 'message:acknowledge:delivered'
    | 'session:set_data'

type HookDataType = 'text'

type HookFrom = 'user' | 'operator'

type HookBodyBase = {
    website_id: string
    event: HookEventType
    timestamp: number
    data: {
        [key: string]: any
    }
}

type HookBodySetData = HookBodyBase & {
    event: Extract<HookEventType, 'session:set_data'>
    data: {
        session_id: string
        website_id: string
        data: {
            aiStatus: string
            aiDisabledDate: string
        }
    }
}

type HookBodyMessageSent = HookBodyBase & {
    event: Extract<HookEventType, 'message:send'>
    data: {
        type: HookDataType
        origin: string
        content: string
        visitorId: number
        from: HookFrom
        user: {
            nickname: string
            user_id: string
        }
        stamped: boolean
        session_id: string
        website_id: string
    }
}

type HookBodyMessageUpdated = HookBodyBase & {
    event: Extract<HookEventType, 'message:updated'>
    data: {
        content: {
            id: string
            text: string
            explain: string
            value?: string
            choices?: {
                value: Action
                icon: string
                label: string
                selected: boolean
            }[]
        }
        visitorId: number
        session_id: string
        website_id: string
    }
}

type HookBody = HookBodyBase | HookBodyMessageSent | HookBodyMessageUpdated

export function loader({ request }: ActionFunctionArgs) {
    return 'use POST instead'
}

export const action = async ({ request: req }: ActionFunctionArgs) => {
    let body = {} as HookBody
    try {
        // res.status(200).send('Handling...')
        // const host = req?.headers?.['host'];
        // const subdomain = getSubdomain(host!);
        body = (await req.json()) as HookBody

        const _timestamp = req.headers['x-crisp-request-timestamp']
        const _signature = req.headers['x-crisp-signature']

        // const verified = CrispClient.verifyHook(
        //   process.env.CRISP_HOOK_SECRET!,
        //   body,
        //   _timestamp as any,
        //   _signature as any
        // );

        // if (!verified) {
        // TODO
        // ATM verifyHook() always returns false 🤔
        // }

        const attempt = req.headers['x-delivery-attempt-count']
        if (attempt && attempt !== '1') {
            console.log('x-delivery-attempt-count abort')
            return "Not the first attempt, don't handle."
        }

        // const newChoice = body?.data?.content?.choices?.find(
        //   (one: any) => one.selected
        // );

        console.log(`webhook event:`, JSON.stringify(body, null, 2))
        if (!body?.event) {
            return json({ status: 'error', message: 'Invalid event' })
        }
        switch (body?.event) {
            case 'message:send':
                if (
                    body.data.origin === 'chat' &&
                    body.data.from === 'user' &&
                    body.data.type === 'text'
                ) {
                    // CrispClient.website.composeMessageInConversation(
                    //     body.website_id,
                    //     body.data.session_id,
                    //     {
                    //         type: 'start',
                    //         from: 'operator',
                    //     },
                    // )

                    try {
                        // await handleQuery(
                        //     body.website_id,
                        //     body.data.session_id,
                        //     body.data.content,
                        //     t,
                        // )
                    } catch (err) {
                        notifyError(err)
                    }
                }

                break
            case 'message:received':
                if (
                    body.data.from === 'operator' &&
                    body.data.type === 'text'
                ) {
                }
                break
            case 'message:updated':
                break
            default:
                console.log('Unhandled event', body.event)
                break
        }

        // CrispClient.website.composeMessageInConversation(
        //     body.website_id,
        //     body.data.session_id,
        //     {
        //         type: 'stop',
        //         from: 'operator',
        //     },
        // )
        return json({ status: 'success' })
    } catch (error: any) {
        notifyError(error)
        return json({ status: 'error', message: error.message })
    } finally {
    }
}
