import { findHints, Hint } from '@/content/findHints'
import {
    hideHints,
    showHints,
    setHintRenderSettings,
} from '@/content/HintRenderer'
import {
    ChromeMessages,
    ChromeMessageType,
    SetHintValueMessage,
    sleep,
} from '@/lib/utils'

let hints = [] as Hint[]
chrome.runtime.onMessage.addListener(
    (request: ChromeMessageType, sender, sendResponse) => {
        Promise.resolve()
            .then(async () => {
                try {
                    switch (request.action) {
                        case ChromeMessages.showHints: {
                            console.log('showHints')
                            hints = findHints()
                            console.log('hints', hints)

                            showHints(hints)
                            await sleep(1)

                            return { status: 'completed', hints }
                        }
                        case ChromeMessages.hideHints: {
                            console.log('hideHints')
                            hideHints()
                            return { status: 'completed', hints }
                        }
                        case ChromeMessages.setHintValue: {
                            let data = request.data
                            console.log('setHintValue', data)
                            if (!data.value) {
                                console.log('no value provided')
                                return {
                                    status: 'error',
                                    error: 'No value provided',
                                }
                            }
                            const findRes = findHint({ label: data.label })
                            if (!findRes.element) {
                                console.log(
                                    'no element found for label',
                                    data.label,
                                )
                                return findRes
                            }
                            let el = findRes.element
                            if (el instanceof HTMLInputElement) {
                                el.focus()
                                // change the background color to indicate the element is focused
                                let prevBackground = el.style.backgroundColor
                                el.style.backgroundColor =
                                    'rgba(255, 255, 0, 0.5)'
                                el.value = data.value
                                await sleep(100)
                                el.style.backgroundColor = prevBackground
                                return { status: 'completed' }
                            } else if (false) {
                                //
                            } else {
                                console.error('Unhandled element type', el)
                                return {
                                    status: 'error',
                                    error: 'Unhandled element type',
                                }
                            }
                            return
                        }
                        case ChromeMessages.highlightInputFound: {
                            let data = request.data
                            console.log('highlightInputFound', data)

                            const findRes = findHint({ label: data.label })
                            if (!findRes.element) {
                                console.log(
                                    'no element found for label',
                                    data.label,
                                )
                                return findRes
                            }
                            let el = findRes.element
                            if (el instanceof HTMLInputElement) {
                                el.focus()
                                el.style.backgroundColor =
                                    'rgba(255, 255, 0, 0.5)'
                                return { status: 'completed' }
                            } else {
                                console.log(
                                    'element is not an input element',
                                    el,
                                )
                                return {
                                    status: 'error',
                                    error: 'element is not an input element',
                                }
                            }
                        }
                        case ChromeMessages.dehilightAll: {
                            for (let hint of hints) {
                                if (hint.element instanceof HTMLInputElement) {
                                    try {
                                        hint.element.style.backgroundColor = ''
                                    } catch (error) {
                                        console.error(
                                            'Error dehighlighting',
                                            error,
                                        )
                                    }
                                }
                            }
                            return
                        }
                        default:
                            console.log('Unhandled message', request)
                            // Handle other message types or do nothing
                            return { status: 'unhandled' }
                    }
                } catch (error) {
                    console.error('Error processing message', error)
                    return { status: 'error', error: error.message }
                }
            })
            .then((x) => {
                sendResponse(x || {})
            })
            .catch((error) => {
                console.error('Error processing message', error)
                sendResponse({ status: 'error', error: error.message })
            })

        return true // Keeps the message channel open
    },
)
function findHint({ label }) {
    if (!hints.length) {
        console.error('No hints found')
        return { status: 'error', error: 'No hints found' }
    }
    const foundHint = hints.find(
        (hint) => hint.label.toUpperCase() === label.toUpperCase(),
    )
    if (!foundHint) {
        console.error('Hint not found for', label)
        console.log(
            `label ${label} not founf in ${JSON.stringify(hints.map((x) => x.label))}`,
        )
        return { status: 'error', error: 'Hint not found' }
    }
    const el = foundHint.element
    if (!el) {
        console.error('Element not found', label)
        return { status: 'error', error: 'Element not found' }
    }
    return { status: 'success', element: el }
}
