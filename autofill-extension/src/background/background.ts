import { ChromeMessages } from '@/lib/utils'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('request', request)
    Promise.resolve().then(async () => {
        switch (request.action) {
            case ChromeMessages.start: {
                const tabs = await chrome.tabs.query({
                    active: true,
                    currentWindow: true,
                })
                const activeTab = tabs[0]
                if (!activeTab.id) {
                    console.error('No active tab')
                    return
                }
                console.log('sending message to screenshot')
                const hintsData = await chrome.tabs.sendMessage(activeTab.id, {
                    action: ChromeMessages.showHints,
                })

                console.log('hintsData', hintsData)
                const dataUrl = await new Promise<string>((res) =>
                    chrome.tabs.captureVisibleTab(request.options, res),
                )
                await chrome.tabs.sendMessage(activeTab.id, {
                    action: ChromeMessages.hideHints,
                })
                console.log('dataUrl', dataUrl)

                sendResponse({ status: 'completed' })
                return
            }
        }
    })
    return true
})
