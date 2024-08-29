import { framer } from 'framer-plugin'
import { init, captureException } from '@sentry/browser'

init({
    dsn: 'https://b3801661934e0cd1f5e211e0305782ce@o4507497807609856.ingest.de.sentry.io/4507497810821200',
    integrations: [],

    // Performance Monitoring
    tracesSampleRate: 0.01, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 0.01,
    beforeSend(event) {
        // do not send in development
        if (process.env.NODE_ENV === 'development') {
            return null
        }
        if (event?.['name'] === 'AbortError') {
            return null
        }

        return event
    },
})

export function notifyError(error, msg?: string) {
    if (error instanceof Error && error.name === 'AbortError') {
        return
    }
    if (
        error instanceof Error &&
        error.message === 'BodyStreamBuffer was aborted'
    ) {
        return
    }

    framer.notify(String(error.message || error), { variant: 'error' })
    console.error(error)
    captureException(error, { extra: { msg } })
    // captureException(error, { extra: { msg } })
}
