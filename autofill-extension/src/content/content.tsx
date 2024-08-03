import { findHints } from '@/content/findHints'
import {
    hideHints,
    showHints,
    setHintRenderSettings,
} from '@/content/HintRenderer'
import { ChromeMessages, sleep } from '@/lib/utils'

let hintChars = 'adsfghjkl'
function generateHintStrings({ characters = hintChars, count }) {
    const hints = ['']
    let offset = 0
    while (hints.length - offset < count || hints.length === 1) {
        const hint = hints[offset++]
        for (const c of characters) {
            hints.push(hint + c)
        }
    }
    return hints.slice(offset, offset + count)
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    Promise.resolve().then(async () => {
        if (request.action === ChromeMessages.beforeScreenshot) {
            try {
                console.log('beforeScreenshot')
                const hints = findHints()
                console.log('hints', hints)
                let strings = generateHintStrings({
                    count: hints.length,
                })
                showHints(hints, strings)
                const res = await chrome.runtime.sendMessage({
                    action: ChromeMessages.captureScreenshot,
                    options: request.options,
                })

                console.log('captureScreenshot res', res)
                await sleep(200)

                console.log('deactivating')
                // hideHints()
                sendResponse({ status: 'completed', result: res })
            } catch (error) {
                console.error('Error capturing screenshot', error)
                sendResponse({ status: 'error', error: error.message })
            }
        } else {
            console.log('Unhandled message', request)
            // Handle other message types or do nothing
            sendResponse({ status: 'unhandled' })
        }
    })

    return true // Keeps the message channel open
})
