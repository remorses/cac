import { Hint } from '@/content/findHints'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import {
    ChromeMessages,
    ChromeMessageType,
    ExtractedFormInput,
    SetHintValueMessage,
} from '@/lib/utils'

import { CoreMessage, streamText } from 'ai'
import { NDJSONStream } from 'website/src/lib/ndjson'
import { ImageActionData } from '@/routes/Login'

if (process.env.NODE_ENV !== 'production') {
    console.log('overriding logging to localhost:8832')
    console.log = (...args) => {
        fetch('http://localhost:8832', {
            method: 'POST',
            body: args
                .map((x) => {
                    if (typeof x === 'object') {
                        return JSON.stringify(x, (k, v) => {
                            // if value is too long, truncate it
                            if (typeof v === 'string' && v.length > 100) {
                                return v.slice(0, 100) + '...'
                            }
                            return v
                        })
                    }
                    return String(x)
                })
                .join(' '),
        })
    }
}

console.log('background starting')
chrome.runtime.onMessage.addListener(
    (request: ChromeMessageType, sender, sendResponse) => {
        console.log('background request', request)
        Promise.resolve()
            .then(async () => {
                switch (request.action) {
                    case ChromeMessages.start: {
                        const files = request.files
                        const tabs = await chrome.tabs.query({
                            active: true,
                            currentWindow: true,
                        })
                        const activeTab = tabs[0]
                        if (!activeTab.id) {
                            console.error('No active tab')
                            return { status: 'error', error: 'No active tab' }
                        }
                        console.log('sending message to screenshot')
                        const hintsData = await chrome.tabs.sendMessage(
                            activeTab.id,
                            {
                                action: ChromeMessages.showHints,
                            } satisfies ChromeMessageType,
                        )

                        // console.log('hintsData', hintsData)
                        const hints = hintsData.hints as Hint[]

                        const dataUrl = await new Promise<string>((res) =>
                            chrome.tabs.captureVisibleTab({}, res),
                        )
                        await chrome.tabs.sendMessage(activeTab.id, {
                            action: ChromeMessages.hideHints,
                        } satisfies ChromeMessageType)
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
                        let extractionText = ''
                        const res = await streamText({
                            model: anthropic('claude-3-5-sonnet-20240620'),
                            onFinish({ text }) {
                                console.log('extract form llm response', text)
                                extractionText = text
                            },
                            messages: [...initialMessages],
                        })

                        const foundHints = [] as ExtractedFormInput[]
                        for await (let chunk of NDJSONStream<ExtractedFormInput>(
                            {
                                stream: res,
                            },
                        )) {
                            console.log('chunk', chunk)
                            foundHints.push(chunk)
                            await chrome.tabs.sendMessage(activeTab.id, {
                                action: ChromeMessages.highlightInputFound,
                                data: chunk,
                            } satisfies ChromeMessageType)
                            // don't await here, so popup can be closed
                            chrome.runtime.sendMessage({
                                action: ChromeMessages.formInputFound,
                                data: chunk,
                            } satisfies ChromeMessageType)
                        }
                        console.log(
                            'finished all the labels extracted from screenshot',
                        )
                        console.log('asking for values to fill the inputs')
                        const stream2 = await streamText({
                            model: anthropic('claude-3-5-sonnet-20240620'),
                            onFinish({ text }) {
                                console.log('fill value llm response', text)
                            },
                            messages: [
                                ...initialMessages,
                                {
                                    role: 'assistant',
                                    content: extractionText,
                                },
                                {
                                    role: 'user',
                                    content: fillValuePrompt,
                                },

                                {
                                    role: 'user',
                                    content: files.map((file) => ({
                                        image: file.dataUrl,
                                        type: 'image',
                                    })),
                                },
                            ],
                        })

                        for await (let chunk of NDJSONStream<SetHintValueMessage>(
                            {
                                stream: stream2,
                            },
                        )) {
                            console.log('chunk', chunk)
                            await chrome.tabs.sendMessage(activeTab.id, {
                                action: ChromeMessages.setHintValue,
                                data: chunk,
                            } satisfies ChromeMessageType)
                        }
                        await chrome.tabs.sendMessage(activeTab.id, {
                            action: ChromeMessages.dehilightAll,
                        } satisfies ChromeMessageType)

                        console.log('dataUrl', dataUrl)

                        return { status: 'completed' }
                    }
                }
            })
            .then((response) => sendResponse(response))
            .catch((error) => {
                console.error('Error processing message', error)
                sendResponse({ status: 'error', error: error.message })
            })

        return true
    },
)

const fillValuePrompt = `
Now that you extracted the possible form input elements and their vimium labels you will have to fill the inputs with the content from another image containing relevant data for the form.

The image contains textual data that needs to be transcribed into the web form

### Input:
1. Image containing textual data.
2. Vimium labels of the web form fields.

### Output:
Return NDJSON objects with the following fields:
- label: The Vimium label of the web form field.
- value: The value to fill in the web form based on the image content.
- description: The description of the form input field found in the image.

For the description you should include the parent section that you can extrapolate from the context, for example for an italian F24 tax form you would include sections like

### Requirements:
1. Identify the relevant information from the image based on labels and descriptions.
2. Skip fields that should remain empty; not all information in the image should be filled into the web form and some form inputs may already be filled.
3. Ensure the correct mapping of image content to web form fields.
4. Maintain the logical order of filling, top to bottom, with related values grouped together.
6. Use comments (//) to reason about specific elements if necessary.

you don't need to fill all the form values, just fill the ones relevant to the data in the image.

Make use of commas for decimal values, if the contextual data contains commas in the numbers add them in the form input too,

### Example NDJSON Output:

{"label": "FN", "description": "Full Name", "value": "John Doe"}
{"label": "AS", "description": "Street Address", "value": "123 Main St"}
{"label": "DF", "description": "Apartment, suite, unit, building, floor, etc.", "value": "Apt 4B"}
{"label": "GH", "description": "City", "value": "Springfield"}
{"label": "JK", "description": "State", "value": "IL"}
{"label": "LZ", "description": "ZIP Code", "value": "62704"}
{"label": "XC", "description": "Phone Number", "value": "555-1234"}
{"label": "VB", "description": "Email Address", "value": "john.doe@example.com"}
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
  3. Append item numbers for duplicate form items that are part of a list. the item number should be the same for related items, items related to a single identity
  4. Use comments (//) to reason about specific elements if necessary.

  ### Example NDJSON Output:

  {"label": "AS", "description": "Full Name"}
  {"label": "DF", "description": "Street Address"}
  {"label": "GH", "description": "Apartment, suite, unit, building, floor, etc."}
  {"label": "JK", "description": "City"}
  {"label": "FG", "description": "State"}
  {"label": "HJ", "description": "ZIP Code"}
  {"label": "KD", "description": "Phone Number"}
  {"label": "SA", "description": "Email Address"}

Skip fields that are already filled or unrelated to the data in the image;

use uppercase letters for the labels so they are dislplayed exactly like in vimium

extract form inputs from top to bottom, always try to fill the firm form inputs first and leave blank additional ones on the bottom.

`
