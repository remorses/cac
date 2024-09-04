import { findHints, Hint } from '@/content/findHints'
import userEvent from '@testing-library/user-event'

import { hideHints, showHints } from '@/content/HintRenderer'
import {
    ChromeMessageType,
    DATA_LLM_ID,
    PRESET_ID_LEN,
    generateRandomString,
    isFillableElement,
    sleep,
} from '@/lib/utils'

let hints = [] as Hint[]

const user = userEvent.setup()

async function getPageHtml() {
    // TODO unwrap web components, if a component is using ARIA and is openable, open it so the html contains all the options, for example open all the comboboxes and toggles to show the contents inside.
    
    let html = document.documentElement.outerHTML
    return html
}

chrome.runtime.onMessage.addListener(
    (request: ChromeMessageType, sender, sendResponse) => {
        Promise.resolve()
            .then(async () => {
                try {
                    switch (request.action) {
                        case 'showHints': {
                            console.log('showHints')
                            hints = findHints()

                            let documentHtml = await getPageHtml()

                            let msg: ChromeMessageType = {
                                action: 'showHints',
                                // hints,
                                documentHtml,
                            }
                            return msg

                            console.log('hints', hints)

                            showHints(hints)
                            await sleep(1)
                            await takeViewportScreenshots()
                        }
                        case 'hideHints': {
                            console.log('hideHints')
                            hideHints()
                            return { status: 'completed', hints }
                        }
                        case 'setHintValue': {
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
                            if (!findRes?.element) {
                                console.log(
                                    'no element found for label',
                                    data.label,
                                )
                                return findRes
                            }
                            let el = findRes.element
                            if (isFillableElement(el)) {
                                // change the background color to indicate the element is focused
                                let prevBackground = el.style.backgroundColor
                                el.style.backgroundColor =
                                    'rgba(255, 255, 0, 0.5)'
                                if (el.value) {
                                    console.log(
                                        `element already has value ${el.value}, ignoring`,
                                    )
                                    return
                                }
                                if (el.type === 'checkbox') {
                                    let shouldToggle =
                                        el.checked !== (data.value === 'true')
                                    if (shouldToggle) {
                                        await user.click(el)
                                    }
                                } else if (el.type === 'radio') {
                                    let shouldToggle = el.value === data.value
                                    if (shouldToggle) {
                                        await user.click(el)
                                    }
                                } else if (el.tagName === 'SELECT') {
                                    const x = await user.selectOptions(
                                        el,
                                        data.value,
                                    )
                                } else if (el.tagName === 'INPUT') {
                                    const x = await user.type(
                                        el,
                                        data.value,
                                        {},
                                    )
                                } else {
                                    el.value = data.value || ''
                                }
                                await sleep(100)
                                el.style.backgroundColor = prevBackground
                                return { status: 'completed' }
                            } else {
                                console.error('Unhandled element type', el)
                                return {
                                    status: 'error',
                                    error: 'Unhandled element type',
                                }
                            }
                            return
                        }
                        case 'highlightInputFound': {
                            let data = request.data
                            console.log('highlightInputFound', data)

                            const findRes = findHint({ label: data.label })
                            if (!findRes?.element) {
                                console.log(
                                    'no element found for label',
                                    data.label,
                                )
                                return findRes
                            }
                            let el = findRes.element
                            if (isFillableElement(el)) {
                                if (document.activeElement !== el) {
                                    el.focus()
                                }
                                el.style.backgroundColor =
                                    'rgba(255, 255, 0, 0.5)'
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
                        case 'dehighlightAll': {
                            for (let hint of hints) {
                                if (isFillableElement(hint.element)) {
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
            `label ${label} not found in ${JSON.stringify(hints.map((x) => x.label))}`,
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

function renderDebugPanel({ screenshots = [] as string[] }) {
    let debugId = 'autofill-debug-panel'
    if (document.getElementById(debugId)) {
        console.log('Debug panel already exists')
        document.body.removeChild(document.getElementById(debugId)!)
    }
    const debugPanel = document.createElement('div')
    debugPanel.id = debugId
    debugPanel.style.position = 'fixed'
    debugPanel.style.top = '0'
    debugPanel.style.left = '0'
    // debugPanel.style.width = '100%'
    // debugPanel.style.height = '100%'
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    debugPanel.style.zIndex = '1000'
    debugPanel.style.display = 'flex'
    debugPanel.style.justifyContent = 'center'
    debugPanel.style.alignItems = 'center'
    // debugPanel.style.flexDirection = 'column'
    debugPanel.style.gap = '10px'
    const closeButton = document.createElement('button')
    closeButton.innerText = 'X'
    closeButton.style.position = 'absolute'
    closeButton.style.top = '10px'
    closeButton.style.right = '10px'
    closeButton.style.backgroundColor = 'red'
    closeButton.style.color = 'white'
    closeButton.style.border = 'none'
    closeButton.style.padding = '5px 10px'
    closeButton.style.cursor = 'pointer'
    closeButton.addEventListener('click', () => {
        document.body.removeChild(debugPanel)
    })
    debugPanel.appendChild(closeButton)
    document.body.appendChild(debugPanel)
    for (let screenshot of screenshots) {
        const img = document.createElement('img')
        img.src = screenshot
        img.style.height = '300px'
        debugPanel.appendChild(img)
    }
    return debugPanel
}

async function takeViewportScreenshots() {
    const interpolation = 0.8
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const screenshotsUrls = [] as string[]
    const fullHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight,
    )

    const numScreenshots = Math.ceil(
        fullHeight / (viewportHeight * interpolation),
    ) // 20% overlap
    console.log('numScreenshots', numScreenshots)
    const originalScrollPosition = window.scrollY

    for (let i = 0; i < numScreenshots; i++) {
        window.scrollTo(0, i * viewportHeight * interpolation) // 20% overlap
        await sleep(20)
        const visible = getAllVIsibleInputElements()
        if (!visible.length) {
            console.log(
                'no visible elements found on page',
                i,
                i * viewportHeight * interpolation,
            )
            continue
        }
        const message: ChromeMessageType = await chrome.runtime.sendMessage({
            action: 'captureVisibleTab',
            index: i,
        } satisfies ChromeMessageType)
        if (message?.action === 'captureVisibleTab' && message.dataUrl) {
            screenshotsUrls.push(message.dataUrl)
        }
    }

    // renderDebugPanel({ screenshots: screenshotsUrls })

    window.scrollTo(0, originalScrollPosition)
    console.log(
        'done screen shotting the page, screenshots',
        screenshotsUrls.length,
    )
}

function getAllVIsibleInputElements() {
    const elements = Array.from(
        document.querySelectorAll('input, textarea, select'),
    ) as HTMLElement[]

    return elements.filter((el) => {
        const style = window.getComputedStyle(el)
        return el.offsetWidth > 0 && el.offsetHeight > 0
    })
}
