import { ChromeMessages, sleep } from '@/lib/utils'


let mods = new LinkHints([])

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    Promise.resolve().then(async () => {
        if (request.action === ChromeMessages.beforeScreenshot) {
            try {
                console.log('beforeScreenshot')
                await mods.toggleHints({ modeIndex: 0 })

                const res = await chrome.runtime.sendMessage({
                    action: ChromeMessages.captureScreenshot,
                    options: request.options,
                })

                console.log('captureScreenshot res', res)
                await sleep(200)
                await mods.toggleHints({ modeIndex: 0 })
                console.log('deactivating')

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
