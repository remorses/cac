import {
    ChromeMessageType,
    EnrichedElementPart,
    ExtractedFormInput,
    FileObject,
    SetHintValueMessage,
} from '@/lib/utils'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

import { CoreMessage, streamObject } from 'ai'
import { yieldNewArrayItems } from 'website/src/lib/ndjson'

if (process.env.NODE_ENV !== 'production') {
    console.log('overriding logging to localhost:8832')
    const cb = (...args) => {
        fetch('http://localhost:8832', {
            method: 'POST',
            body: args
                .map((x) => {
                    if (x instanceof Error) {
                        return `Error: ${x.message}`
                    }
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
                }, 2)
                .join(' '),
        })
    }
    console.log = cb
    console.error = cb
    console.warn = cb
    console.info = cb
}

console.log('background starting')

let screenshots = [] as FileObject[]

let filledFormInputs = [] as SetHintValueMessage[]

export const extractedFormInputSchema = z.object({
    label: z.string(),
    description: z.string(),
    value: z.string(),
})

export const filledFormInputSchema = z.object({
    label: z.string(),
    description: z.string(),
    value: z.string(),
})

const model = anthropic('claude-3-5-sonnet-20240620')

chrome.runtime.onMessage.addListener(
    (request: ChromeMessageType, sender, sendResponse) => {
        console.log('background request', request)
        Promise.resolve()
            .then(async () => {
                switch (request.action) {
                    case 'captureVisibleTab': {
                        const dataUrl = await new Promise<string>((res, rej) =>
                            chrome.tabs.captureVisibleTab(
                                { format: 'png' },
                                res,
                            ),
                        )
                        if (!dataUrl) {
                            console.log('no data url found after capture')
                            return {}
                        }
                        if (process.env.NODE_ENV !== 'production') {
                            // chrome.downloads.download({
                            //     url: dataUrl,
                            //     filename: `screenshot_${request.index}.png`,
                            // })
                        }
                        screenshots.push({
                            name: request.index.toString(),
                            dataUrl: dataUrl,
                        })
                        return {}
                    }
                    case 'popupLoader': {
                        const canUndo = filledFormInputs.length > 0
                        const msg: ChromeMessageType = {
                            action: 'popupLoader',
                            data: {
                                canUndo,
                            },
                        }
                        return msg
                    }
                    case 'undoFilling': {
                        for (let filledFormInput of filledFormInputs) {
                            chrome.runtime.sendMessage({
                                action: 'setHintValue',
                                data: {
                                    ...filledFormInput,
                                    value: '',
                                },
                            } satisfies ChromeMessageType)
                        }
                        filledFormInputs = []
                        return {}
                    }
                    case 'start': {
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
                        const message: ChromeMessageType =
                            await chrome.tabs.sendMessage(activeTab.id, {
                                action: 'showHints',
                            } satisfies ChromeMessageType)

                        await chrome.tabs.sendMessage(activeTab.id, {
                            action: 'hideHints',
                        } satisfies ChromeMessageType)
                        if (!screenshots.length) {
                            console.log(
                                'no screenshots found, aborting extraction',
                            )
                            return { status: 'error', error: 'No screenshots' }
                        }
                        console.log('screenshots', screenshots)
                        const initialMessages: CoreMessage[] = [
                            {
                                role: 'user',
                                content: [
                                    ...screenshots
                                        .filter(Boolean)
                                        .filter((x) => x.dataUrl)
                                        .map((screenshot, index) => {
                                            return {
                                                image: screenshot.dataUrl,
                                                type: 'image' as const,
                                            }
                                        }),
                                ],
                            },
                            {
                                role: 'user',
                                content: promptExtract,
                            },
                        ]
                        screenshots = []

                        console.log('starting llm extraction of the labels')
                        const schema = z.object({
                            elements: z.array(extractedFormInputSchema),
                        })
                        const res = await streamObject({
                            model,

                            schema,
                            messages: [...initialMessages],
                        })

                        const foundHints = [] as Array<
                            ExtractedFormInput & EnrichedElementPart
                        >
                        for await (let chunk of yieldNewArrayItems({
                            stream: res.partialObjectStream,
                            arrayField: 'elements',
                        })) {
                            if (chunk.fullItem === undefined) {
                                continue
                            }
                            console.log('chunk', chunk)

                            const response: ChromeMessageType =
                                await chrome.tabs.sendMessage(activeTab.id, {
                                    action: 'highlightInputFound',
                                    data: chunk.fullItem,
                                } satisfies ChromeMessageType)
                            if (
                                response.action === 'enrichedElement' &&
                                response.data
                            ) {
                                console.log(
                                    'enriching element',
                                    chunk.fullItem?.description,

                                    JSON.stringify(response.data, null, 2),
                                )
                                Object.assign(chunk.fullItem, response.data)
                            }
                            foundHints.push(chunk.fullItem)
                            // don't await here, so popup can be closed
                            chrome.runtime.sendMessage({
                                action: 'formInputFound',
                                data: chunk.fullItem,
                            } satisfies ChromeMessageType)
                        }
                        console.log(
                            'finished all the labels extracted from screenshot',
                        )
                        console.log('asking for values to fill the inputs')
                        // console.log('initialMessages', initialMessages)
                        const messages: CoreMessage[] = [
                            ...initialMessages,
                            {
                                role: 'assistant',
                                content: JSON.stringify(
                                    {
                                        elements: foundHints,
                                    } satisfies z.infer<typeof schema>,
                                    null,
                                    2,
                                ),
                            },
                            {
                                role: 'user',
                                content: fillValuePrompt,
                            },
                        ]
                        if (files.length) {
                            messages.push({
                                role: 'user',
                                content: files.filter(Boolean).map((file) => ({
                                    image: file.dataUrl,
                                    type: 'image',
                                })),
                            })
                        }
                        const stream2 = await streamObject({
                            model,
                            onFinish({ object, rawResponse }) {
                                console.log(
                                    'fill value llm response',
                                    JSON.stringify(object, null, 2),
                                )
                            },
                            schema: z.object({
                                elements: z.array(filledFormInputSchema),
                            }),
                            messages,
                        })
                        filledFormInputs = []

                        for await (let chunk of yieldNewArrayItems({
                            stream: stream2.partialObjectStream,
                            arrayField: 'elements',
                        })) {
                            if (chunk.fullItem === undefined) {
                                continue
                            }
                            console.log('chunk', chunk)
                            const originalHint = foundHints.find(
                                (x) => x.label === chunk.fullItem?.label,
                            )
                            const options = originalHint?.possibleOptions || []
                            if (
                                originalHint &&
                                options.length &&
                                !options.find(
                                    (x) => x.value === chunk?.fullItem?.value,
                                )
                            ) {
                                const option =
                                    originalHint.possibleOptions?.find((x) => {
                                        return (
                                            x.title.trim() ===
                                            chunk?.fullItem?.value.trim()
                                        )
                                    })
                                if (option) {
                                    chunk.fullItem.value = option.value
                                }
                            }
                            await chrome.tabs.sendMessage(activeTab.id, {
                                action: 'setHintValue',
                                data: chunk.fullItem,
                            } satisfies ChromeMessageType)
                            filledFormInputs.push(chunk.fullItem)
                        }
                        console.log('completed the llm call to fill the inputs')
                        await chrome.tabs.sendMessage(activeTab.id, {
                            action: 'dehighlightAll',
                        } satisfies ChromeMessageType)

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
