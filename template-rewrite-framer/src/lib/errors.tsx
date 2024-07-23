import { framer } from 'framer-plugin'

export function notifyError(error, msg?: string) {
    framer.notify(String(error.message), { variant: 'error' })
    console.error(msg, error)
    // captureException(error, { extra: { msg } })
}
