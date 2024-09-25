import { init, captureException, flush } from '@sentry/node'
import { sortUserPlugins } from 'vite'

init({
    dsn: 'https://3e3f1075fec9ee2de1e0f79026b5f734@o4508014272446464.ingest.de.sentry.io/4508014292697168',

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
        if (process.env.BYTECODE_RUN) {
            return null
        }
        if (event?.['name'] === 'AbortError') {
            return null
        }

        return event
    },
})

export async function notifyError(error, msg?: string) {
    console.error(msg, error)
    captureException(error, { extra: { msg } })
    await flush(1000) // delivery timeout in ms
}

export class AppError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'AppError'
    }
}
