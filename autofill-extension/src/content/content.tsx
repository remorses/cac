import { findHints, Hint } from '@/content/findHints'
import {
    hideHints,
    showHints,
    setHintRenderSettings,
} from '@/content/HintRenderer'
import { ChromeMessages, SetHintValueMessage, sleep } from '@/lib/utils'

let hints = [] as Hint[]
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    Promise.resolve().then(async () => {
        try {
            switch (request.action) {
                case ChromeMessages.showHints: {
                    console.log('showHints')
                    hints = findHints()
                    console.log('hints', hints)

                    showHints(hints)
                    await sleep(1)

                    sendResponse({ status: 'completed', hints })
                    return
                }
                case ChromeMessages.hideHints: {
                    console.log('hideHints')
                    hideHints()
                    sendResponse({ status: 'completed', hints })
                    return
                }
                case ChromeMessages.setHintValue: {

                    let data: SetHintValueMessage = request.data
                    console.log('setHintValue', data)

                    if (!hints.length) {
                        console.error('No hints found')
                        sendResponse({
                            status: 'error',
                            error: 'No hints found',
                        })
                        return
                    }
                    const foundHint = hints.find(
                        (hint) => hint.label === data.label,
                    )
                    if (!foundHint) {
                        console.error('Hint not found', data.label)
                        sendResponse({
                            status: 'error',
                            error: 'Hint not found',
                        })
                        return
                    }
                    const el = foundHint.element
                    if (!el) {
                        console.error('Element not found', data.label)
                        sendResponse({
                            status: 'error',
                            error: 'Element not found',
                        })
                        return
                    }
                    if (el instanceof HTMLInputElement) {
                        el.value = data.value
                        el.focus()
                    } else if (false) {
                        //
                    } else {
                        console.error('Unhandled element type', el)
                        sendResponse({
                            status: 'error',
                            error: 'Unhandled element type',
                        })
                        return
                    }
                    return
                }
                default:
                    console.log('Unhandled message', request)
                    // Handle other message types or do nothing
                    sendResponse({ status: 'unhandled' })
                    break
            }
        } catch (error) {
            console.error('Error processing message', error)
            sendResponse({ status: 'error', error: error.message })
        }
    })

    return true // Keeps the message channel open
})
