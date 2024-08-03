import { Hint } from '@/content/findHints'
import { openai } from '@ai-sdk/openai'
import { ChromeMessages, SetHintValueMessage } from '@/lib/utils'

import { CoreMessage, streamText } from 'ai'
import { NDJSONStream } from 'website/src/lib/ndjson'
import { ImageActionData } from '@/routes/Login'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('request', request)
    Promise.resolve().then(async () => {
        switch (request.action) {
            case ChromeMessages.start: {
                const files = request.files as ImageActionData[]
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
                await chrome.tabs.sendMessage(activeTab.id, {
                    action: ChromeMessages.hideHints,
                })
                const initialMessages: CoreMessage[] = [
                    {
                        role: 'user',
                        content: [
                            { image: dataUrl, type: 'image' }, //
                        ],
                    },
                    {
                        role: 'user',
                        content: promptExtract,
                    },
                ]
                const res = await streamText({
                    model: openai('gpt-4o'),
                    onFinish({ text }) {
                        console.log('extract form llm response', text)
                    },
                    messages: [...initialMessages],
                })
                type Chunk = {
                    label: string
                    description: string
                }

                const foundHints = [] as Chunk[]
                for await (let chunk of NDJSONStream<Chunk>({
                    stream: res,
                })) {
                    console.log('chunk', chunk)
                    foundHints.push(chunk)
                    // don't await here, so popup can be closed
                    chrome.runtime.sendMessage({
                        action: ChromeMessages.formInputFound,
                        data: chunk,
                    })
                    await chrome.tabs.sendMessage(activeTab.id, {
                        action: ChromeMessages.highlightInputFound,
                        data: chunk,
                    })
                }
                const stream2 = await streamText({
                    model: openai('gpt-4o'),
                    onFinish({ text }) {
                        console.log('fill value llm response', text)
                    },
                    messages: [
                        ...initialMessages,
                        {
                            role: 'user',
                            content: files.map((file) => ({
                                image: file.dataUrl,
                                type: 'image',
                            })),
                        },
                        {
                            role: 'user',
                            content: fillValuePrompt,
                        },
                    ],
                })

                for await (let chunk of NDJSONStream<SetHintValueMessage>({
                    stream: stream2,
                })) {
                    console.log('chunk', chunk)
                    await chrome.tabs.sendMessage(activeTab.id, {
                        action: ChromeMessages.setHintValue,
                        data: chunk,
                    })
                }
                await chrome.tabs.sendMessage(activeTab.id, {
                    action: ChromeMessages.dehilightAll,
                })

                console.log('dataUrl', dataUrl)

                sendResponse({ status: 'completed' })
                return
            }
        }
    })
    return true
})

const fillValuePrompt = `
  Given an image containing textual data that needs to be transcribed into a web form, extract and automate the filling of corresponding web form values.

  ### Input:
  1. Image containing textual data.
  2. Vimium labels of the web form fields.

  ### Output:
  Return NDJSON objects with the following fields:
  - label: The Vimium label of the web form field.
  - value: The value to fill in the web form based on the image content.
  - description: The description of the form input field found in the image.

  ### Requirements:
  1. Identify the relevant information from the image based on labels and descriptions.
  2. Skip fields that should remain empty; not all information in the image should be filled into the web form and some form inputs may already be filled.
  3. Ensure the correct mapping of image content to web form fields.
  4. Maintain the logical order of filling, top to bottom, with related values grouped together.
  6. Use comments (//) to reason about specific elements if necessary.

  ### Example NDJSON Output:

  {"label": "AB", "description": "Full Name", "value": "John Doe"}
  {"label": "CD", "description": "Street Address", "value": "123 Main St"}
  {"label": "EF", "description": "Apartment, suite, unit, building, floor, etc.", "value": "Apt 4B"}
  {"label": "GH", "description": "City", "value": "Springfield"}
  {"label": "IJ", "description": "State", "value": "IL"}
  {"label": "KL", "description": "ZIP Code", "value": "62704"}
  {"label": "MN", "description": "Phone Number", "value": "555-1234"}
  {"label": "OP", "description": "Email Address", "value": "john.doe@example.com"}
  `

const promptExtract = `
  Given a screenshot with Vimium labels for each form element, extract the form descriptions for each form input. Ensure the output follows the logical order of filling, top to bottom, with related values grouped together.

  ### Input:
  1. Screenshot with Vimium labels for each form element.

  ### Output:
  Return NDJSON objects with the following fields:
  - label: The Vimium label (character pair) of the form field.
  - description: The form input description.

  ### Requirements:
  1. Extract and return labels and descriptions in the order a human would fill the form, top to bottom.
  2. Group related values together, ensuring items in a list or table rows are close to each other.
  3. Append item numbers for duplicate form items that are part of a list.
  4. Use comments (//) to reason about specific elements if necessary.

  ### Example NDJSON Output:

  {"label": "AB", "description": "Full Name"}
  {"label": "CD", "description": "Street Address"}
  {"label": "EF", "description": "Apartment, suite, unit, building, floor, etc."}
  {"label": "GH", "description": "City"}
  {"label": "IJ", "description": "State"}
  {"label": "KL", "description": "ZIP Code"}
  {"label": "MN", "description": "Phone Number"}
  {"label": "OP", "description": "Email Address"}
  {"label": "QR_1", "description": "Item 1 Description"}
  {"label": "QR_2", "description": "Item 2 Description"}
  {"label": "QR_3", "description": "Item 3 Description"}

Skip fields that are already filled or unrelated to the data in the image;

Make use of commas for decimal values

Fill form inputs from top to bottom, always try to fill the firm form inputs first and leave blank additional ones on the bottom.

`
