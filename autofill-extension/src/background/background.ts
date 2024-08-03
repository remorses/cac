import { Hint } from '@/content/findHints'
import { openai } from '@ai-sdk/openai'
import { ChromeMessages } from '@/lib/utils'

import { streamText } from 'ai'
import { NDJSONStream } from 'website/src/lib/ndjson'

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
                const hints = hintsData.hints as Hint[]

                const dataUrl = await new Promise<string>((res) =>
                    chrome.tabs.captureVisibleTab(request.options, res),
                )
                const res = await streamText({
                    model: openai('gpt-4o'),
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { image: dataUrl, type: 'image' }, //
                            ],
                        },
                        {
                            role: 'user',
                            content: `this is a screenshot with vimium labels for each form element, for each form field return me the label and the form description. if a form item is a duplicate because part of a lit, append the item number in the name. return ndjson of objects with fields label, description. add comments with // if you want to reason about an element. only return valid ndjson and no other content`,
                        },
                    ],
                })
                type Chunk = {
                    label: string
                    description: string
                }

                for await (let chunk of NDJSONStream<Chunk>({
                    stream: res,
                })) {
                    console.log('chunk', chunk)
                    await chrome.runtime.sendMessage({
                        action: ChromeMessages.formInputFound,
                        data: chunk,
                    })
                }

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
