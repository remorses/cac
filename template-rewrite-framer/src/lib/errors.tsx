import { framer } from 'framer-plugin'
import { init, captureException } from '@sentry/browser'

init({
      dsn: "https://d6ad60582fec2961afffe60e5a189844@o4508014272446464.ingest.de.sentry.io/4508014275985488",

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
