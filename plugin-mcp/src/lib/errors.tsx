import { framer } from 'framer-plugin'
import { init, captureException } from 'sentries'

init({
    dsn: 'https://d6ad60582fec2961afffe60e5a189844@o4508014272446464.ingest.de.sentry.io/4508014275985488',

    integrations: [],

    // Performance Monitoring
    tracesSampleRate: 0.01, //  Capture 100% of the transactions

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 0.01,
    beforeSend(event, hint) {
        // do not send in development
        if (process.env.NODE_ENV === 'development') {
            return null
        }
        if (event?.['name'] === 'AbortError') {
            return null
        }

        if (hint?.originalException instanceof KnownError) {
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

    console.error(error?.error || error)
    captureException(error?.error || error, { extra: { msg } })
    framer.notify(String(error.message || error), { variant: 'error' })
    // captureException(error, { extra: { msg } })
}


export class KnownError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = 'KnownError'
        Object.setPrototypeOf(this, KnownError.prototype)
    }
}
