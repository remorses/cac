import { init, captureException, flush } from '@sentry/node'
import { sortUserPlugins } from 'vite'

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
