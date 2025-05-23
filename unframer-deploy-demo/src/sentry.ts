import * as sentry from '@sentry/node'

const SENTRY_DSN =
    'https://67125acb9a41f616144a07c90a16775e@o4508014272446464.ingest.de.sentry.io/4509202968674384'


sentry.init({
    dsn: SENTRY_DSN,
    beforeSend(event) {
        if (event?.['name'] === 'AbortError') return null
        return event
    },
})

export async function notifyError(error: unknown, msg?: string) {
    console.error(msg, error)

    sentry.captureException(error, { extra: { msg } })
    await sentry.flush(1000)
}
