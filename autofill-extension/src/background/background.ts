import dedent from 'dedent'
import {
    ChromeMessageType,
    DATA_LLM_ID,
    PRESET_ID_LEN,
    EnrichedElementPart,
    ExtractedFormInput,
    FileObject,
    sleep,
    isTruthy,
} from '@/lib/utils'

import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

import { CoreMessage, streamObject, DeepPartial, streamText } from 'ai'
import { yieldNewArrayItems } from 'website/src/lib/ndjson'
import { formatHtmlForPrompt } from 'website/src/lib/htmlrewrite.server'

import init from 'htmlrewriter/dist/html_rewriter.js'

import { HTMLRewriterWrapper } from 'htmlrewriter/dist/html_rewriter_wrapper.js'

// @ts-ignore
import wasm from 'htmlrewriter/dist/html_rewriter_bg.wasm'
import { openai } from '@ai-sdk/openai'

export const HTMLRewriter = HTMLRewriterWrapper(init(wasm))

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

let filledFormInputs = [] as ExtractedFormInput[]

export const extractedFormInputSchema = z.object({
    label: z.string().describe('the Vimium label of the input'),
    description: z.string().describe(
        dedent`the description of the input, this description field should always come before the others.

            should always answer the questions:
            - what information should go in this form field? what is the data from the files or user information to fill?
            - what format should the data be in based on other surrounding context information?


            `,
    ),
    options: z
        .array(z.object({ title: z.string(), value: z.string() }))

        .describe(
            'possible options for the input, only add this field for <select> inputs',
        )
        .nullable(),
    value: z
        .string()
        .describe(
            'the value to fill in the input, based on user <description> and files, format the value according to the form requirements, change casing and punctuation if necessary.' +
                `You can think of a new value for an input field if the user did not pass all the required information in the <description>, you can guess one based on the context.`,
        )
        .nullable(),
})

// export const filledFormInputSchema = z.object({
//     label: z.string(),
//     description: z.string(),
//     value: z.string(),
// })

let model = anthropic('claude-3-5-sonnet-latest', {
    // cacheControl: true,
})

// model = openai('gpt-4o-2024-08-06', {
//     structuredOutputs: true,
//     // cacheControl: true,
// })

const hintLabelToFrameId = new Map<string, number>()

chrome.runtime.onMessage.addListener(
    (request: ChromeMessageType, sender, sendResponse) => {
        console.log('background request', request)
        Promise.resolve()
            .then(async () => {
                switch (request.action) {
                    case 'captureVisibleTab': {
                        // fix for MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND
                        await sleep(500)
                        const dataUrl = await new Promise<string>((res, rej) =>
                            chrome.tabs.captureVisibleTab(
                                { format: 'jpeg' },
                                (result) => {
                                    if (chrome.runtime.lastError) {
                                        console.log(chrome.runtime.lastError)
                                        rej(chrome.runtime.lastError)
                                    } else {
                                        res(result)
                                    }
                                },
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
                            type: 'image/png',
                        })
                        const msg: ChromeMessageType = {
                            action: 'captureVisibleTab',
                            index: request.index,
                            dataUrl,
                        }
                        return msg
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
                        if (files.length) {
                            console.log(
                                `using ${files.length} files: ${files.map((x) => x.name + ' with url ' + x.dataUrl.slice(0, 30)).join(', ')}`,
                            )
                        }
                        const description = request.description || ''
                        const tabs = await chrome.tabs.query({
                            active: true,
                            currentWindow: true,
                        })
                        const activeTab = tabs[0]
                        if (!activeTab.id) {
                            console.error('No active tab')
                            return { status: 'error', error: 'No active tab' }
                        }
                        console.log(
                            'sending message to get hints and html from all frames',
                        )
                        const frames =
                            (await chrome.webNavigation.getAllFrames({
                                tabId: activeTab.id,
                            })) || []

                        if (!frames?.length) {
                            console.log('no frames found, aborting')
                            return { status: 'error', error: 'No frames found' }
                        }
                        let pastHintCount = 0
                        let documentHtmls = [] as string[]
                        for (const frame of frames) {
                            try {
                                const message: ChromeMessageType =
                                    await chrome.tabs.sendMessage(
                                        activeTab!.id as number,
                                        {
                                            action: 'showHints',
                                            pastHintCount,
                                        } satisfies ChromeMessageType,
                                        { frameId: frame.frameId },
                                    )

                                if (
                                    message.action === 'showHints' &&
                                    message.documentHtml
                                ) {
                                    if (message.hints) {
                                        pastHintCount += message.hints.length
                                        for (let hint of message.hints) {
                                            hintLabelToFrameId.set(
                                                hint.label,
                                                frame.frameId,
                                            )
                                        }
                                    }

                                    const formattedHtml =
                                        await formatHtmlForPrompt(
                                            new Response(message.documentHtml),
                                            HTMLRewriter,
                                        )
                                    if (formattedHtml) {
                                        documentHtmls.push(formattedHtml)
                                    }
                                }
                            } catch (e) {
                                console.log(
                                    `Error getting HTML from frame ${frame.frameId} (${frame.url.slice(0, 200)}):`,
                                    e,
                                )
                            }
                        }

                        if (!documentHtmls.length) {
                            console.log('no documentHtml found in any frames')
                        }
                        console.log(
                            'extracted HTML from',
                            documentHtmls.length,
                            'frames',
                        )
                        // console.log('documentHtml', documentHtml)

                        if (!screenshots.length) {
                            console.log('no screenshots found')
                        }
                        console.log('screenshots', screenshots)
                        const messages: CoreMessage[] = []
                        const images = files.filter(
                            (x) => x && x.type.startsWith('image/'),
                        )
                        const pdfs = files.filter((x) =>
                            x.type.startsWith('application/pdf'),
                        )
                        console.log(model.provider)
                        if (pdfs.length) {
                            console.log('adding pdfs into LLM', pdfs.length)
                        }

                        const allFiles = [
                            ...screenshots
                                .filter(Boolean)
                                .filter((x) => x.dataUrl)
                                .map((screenshot) => ({
                                    image: screenshot.dataUrl,
                                    type: 'image' as const,
                                })),
                            ...images.map((file) => ({
                                image: file.dataUrl,
                                type: 'image' as const,
                            })),
                            ...pdfs.map((file) => ({
                                data: file.dataUrl,
                                mimeType: 'application/pdf',
                                type: 'file' as const,
                            })),
                        ]

                        if (allFiles.length) {
                            messages.push({
                                role: 'user',
                                content: allFiles,
                            })
                        }
                        const textFiles = files.filter(
                            (x) =>
                                x.type.startsWith('text/') ||
                                x.type.startsWith('application/json'),
                        )
                        if (textFiles.length) {
                            messages.push({
                                role: 'user',
                                content: generateTextFilesPrompt({
                                    files: textFiles,
                                }),
                            })
                        }

                        messages.push({
                            role: 'user',
                            content: promptExtractFromHtml({
                                description,
                                documentHtml: documentHtmls.join('\n\n'),
                            }),
                            experimental_providerMetadata: {
                                // anthropic: {
                                //     cacheControl: { type: 'ephemeral' },
                                // },
                            },
                        })

                        // TODO turn text/* files to text, add them to the prompt. If a file is of type application/pdf, turn it into an image

                        screenshots = []

                        console.log(
                            'starting llm extraction of the labels and filling',
                        )
                        const schema = z.object({
                            thinkStepByStep: z
                                .string()
                                .describe(
                                    `Describe what this form is about, decide a plan to start filling the form with the user <description>`,
                                )
                                .nullable(),
                            elements: z.array(extractedFormInputSchema),
                        })
                        const res = await streamObject({
                            model,
                            onFinish({ object }) {
                                console.log(
                                    'extract inputs llm response',
                                    JSON.stringify(object, null, 2),
                                )
                            },
                            schema,
                            messages: [...messages],
                            headers: {
                                'anthropic-dangerous-direct-browser-access':
                                    'true',
                            },
                        })

                        const foundHints = [] as Array<ExtractedFormInput>
                        for await (let chunk of yieldNewArrayItems({
                            stream: res.partialObjectStream,
                            arrayField: 'elements',
                        })) {
                            if (chunk.fullItem === undefined) {
                                continue
                            }
                            console.log(
                                'chunk',
                                JSON.stringify(chunk.fullItem, null, 2),
                            )

                            // const originalHint = foundHints.find(
                            //     (x) => x.label === chunk.fullItem?.label,
                            // )
                            // const options = originalHint?.possibleOptions || []
                            // if (
                            //     originalHint &&
                            //     options.length &&
                            //     !options.find(
                            //         (x) => x.value === chunk?.fullItem?.value,
                            //     )
                            // ) {
                            //     const option =
                            //         originalHint.possibleOptions?.find((x) => {
                            //             return (
                            //                 x.title.trim() ===
                            //                 chunk?.fullItem?.value.trim()
                            //             )
                            //         })
                            //     if (option) {
                            //         chunk.fullItem.value = option.value || ''
                            //     }
                            // }
                            const frameId = hintLabelToFrameId.get(
                                chunk.fullItem.label,
                            )
                            const response: ChromeMessageType =
                                await chrome.tabs.sendMessage(
                                    activeTab.id,
                                    {
                                        action: 'highlightInputFound',
                                        data: chunk.fullItem,
                                    } satisfies ChromeMessageType,
                                    { frameId },
                                )
                            // if (
                            //     response.action === 'enrichedElement' &&
                            //     response.data
                            // ) {
                            //     console.log(
                            //         'enriching element',
                            //         chunk.fullItem?.description,

                            //         JSON.stringify(response.data, null, 2),
                            //     )
                            //     Object.assign(chunk.fullItem, response.data)
                            // }

                            foundHints.push(chunk.fullItem)
                            chrome.runtime
                                .sendMessage({
                                    action: 'setHintValue',
                                    data: chunk.fullItem,
                                } satisfies ChromeMessageType)
                                .catch((e) => null) // the popup can be closed
                            // don't await here, so popup can be closed

                            const res = await chrome.tabs.sendMessage(
                                activeTab.id,
                                {
                                    action: 'setHintValue',
                                    data: chunk.fullItem,
                                } satisfies ChromeMessageType,
                                { frameId },
                            )

                            console.log('setHintValue response', res)
                        }
                        console.log(
                            'finished all the labels extracted from screenshot',
                        )
                        // console.log('asking for values to fill the inputs')
                        // // console.log('initialMessages', initialMessages)
                        // const messages: CoreMessage[] = [
                        //     ...initialMessages,
                        //     {
                        //         role: 'assistant',
                        //         content: JSON.stringify(
                        //             {
                        //                 elements: foundHints,
                        //             } satisfies z.infer<typeof schema>,
                        //             null,
                        //             2,
                        //         ),
                        //     },
                        // ]
                        // if (files.length) {
                        //     messages.push({
                        //         role: 'user',
                        //         content: files.filter(Boolean).map((file) => ({
                        //             image: file.dataUrl,
                        //             type: 'image',
                        //         })),
                        //     })
                        // }
                        // messages.push({
                        //     role: 'user',
                        //     content: fillValuePrompt({ description }),
                        // })
                        // const stream2 = await streamObject({
                        //     model,
                        //     onFinish({ object, rawResponse }) {
                        //         console.log(
                        //             'fill value llm response',
                        //             JSON.stringify(object, null, 2),
                        //         )
                        //     },
                        //     schema: z.object({
                        //         elements: z.array(filledFormInputSchema),
                        //     }),
                        //     messages,
                        // })
                        // filledFormInputs = []

                        // for await (let chunk of yieldNewArrayItems({
                        //     stream: stream2.partialObjectStream,
                        //     arrayField: 'elements',
                        // })) {
                        //     if (chunk.fullItem === undefined) {
                        //         continue
                        //     }
                        //     console.log('chunk', chunk.fullItem)
                        //     filledFormInputs.push(chunk.fullItem)
                        //     // if (chunk.partialItem?.label?.length !== 2) {
                        //     //     continue
                        //     // }

                        //     const originalHint = foundHints.find(
                        //         (x) => x.label === chunk.fullItem?.label,
                        //     )
                        //     const options = originalHint?.possibleOptions || []
                        //     if (
                        //         originalHint &&
                        //         options.length &&
                        //         !options.find(
                        //             (x) => x.value === chunk?.fullItem?.value,
                        //         )
                        //     ) {
                        //         const option =
                        //             originalHint.possibleOptions?.find((x) => {
                        //                 return (
                        //                     x.title.trim() ===
                        //                     chunk?.fullItem?.value.trim()
                        //                 )
                        //             })
                        //         if (option) {
                        //             chunk.fullItem.value = option.value || ''
                        //         }
                        //     }
                        //     await chrome.tabs.sendMessage(activeTab.id, {
                        //         action: 'setHintValue',
                        //         data: {
                        //             // value: '',
                        //             // description: '',
                        //             // label: '',
                        //             ...chunk.fullItem,
                        //         },
                        //     } satisfies ChromeMessageType)
                        // }
                        // console.log('completed the llm call to fill the inputs')
                        await chrome.tabs.sendMessage(activeTab.id, {
                            action: 'dehighlightAll',
                        } satisfies ChromeMessageType)
                        await chrome.tabs.sendMessage(activeTab.id, {
                            action: 'hideHints',
                        } satisfies ChromeMessageType)

                        return { status: 'completed' }
                    }
                }
            })
            .then((response) => sendResponse(response))
            .catch((error) => {
                console.error('Error processing message', error)
                console.error(error.stack)
                sendResponse({ status: 'error', error: error.message })
            })

        return true
    },
)

const fillValuePrompt = ({ description }) => `
Now that you extracted the possible form input elements and their Vimium labels you will have to fill the inputs with the content from a description and another image containing relevant data for the form.


Here is the description passed by the user:

<description>
${description}
</description>

The image contains textual data that needs to be transcribed into the web form

### Input:
1. Image containing textual data.
2. Vimium labels of the web form fields.

### Output:
Return JSON objects with the following fields:
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

Try to use the correct format for each input field even if the user gave non formatted data, for example if an input is of type url and the user only provided the domain name, add the https:// prefix to the value.

If an input is of type checkbox, return value "true" or "false".

If input is of type radio, return only the value of the selected radio button.

Skip inputs that are already filled.

### Example Output:

{"label": "FN", "description": "Full Name", "value": "John Doe"}
{"label": "AS", "description": "Street Address", "value": "123 Main St"}
{"label": "DF", "description": "Apartment, suite, unit, building, floor, etc.", "value": "Apt 4B"}
{"label": "GH", "description": "City", "value": "Springfield"}
{"label": "JK", "description": "State", "value": "IL"}
{"label": "LZ", "description": "ZIP Code", "value": "62704"}
{"label": "XC", "description": "Phone Number", "value": "555-1234"}
{"label": "VB", "description": "Email Address", "value": "john.doe@example.com"}
  `

const promptExtractFromScreenshots = ({ description, documentHtml }) => `
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
const promptExtractFromHtml = ({ description, documentHtml }) => `
Given an HTML document with form elements, extract the form descriptions for each form input. Some input elements will have a ${DATA_LLM_ID} attribute.
Ensure the output follows the logical order of filling, top to bottom, the same order an user would fill the form.

### Input:
1. HTML document with form elements.

### Output:
Return a JSON object with the following fields:
- unique label: The ${DATA_LLM_ID} attribute of the form input. this field should always come first.
- description: The form input description, guessed from surrounding html tags and elements. This field should always come second.
- options: possible options for the input, only add this field for <select> inputs
- value: the value to fill in the input, based on user <description>, format the value according to the form requirements, change casing and punctuation if necessary. You can think of a new value for an input field if the user did not pass all the required information in the <description>, you can guess one based on the context.

### Requirements:
1. Extract and return labels and descriptions in the order a human would fill the form, top to bottom.
2. Use the same order the user would use to fill the form, from top to bottom or in the case of a table row, from left to right.

Skip fields that are already filled

use the ${DATA_LLM_ID} attribute for the labels;

each input description should completely describe what should be filled in the input, include the type of input (text, number, email, etc.), and any other relevant information like pattern or placeholder.

You should only extract inputs that are user input, the user is searching for inputs that should be filled in the document.
Ignore inputs like search bars and buttons, which are not data collection elements.

Skip inputs that are already filled.

Here is the HTML document:

${documentHtml}

Here is the user description of what should go inside the form inputs. You don't have to input this information as is, you can format it based on the form requirements, change casing and punctuation if necessary.

<description>
${description}
</description>



`

function dataUrlToText(dataUrl: string): string {
    const base64 = dataUrl.split(',')[1]
    const binaryString = atob(base64)
    const utf8Array = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        utf8Array[i] = binaryString.charCodeAt(i)
    }
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(utf8Array)
}

function generateTextFilesPrompt({ files }: { files: FileObject[] }) {
    return `
The user attached the following files to add some more useful information to fill the form:

<files>
    ${files
        .map(
            (file) => `
    <file>
        <name>${file.name}</name>
        <type>${file.type}</type>
        <content>${dataUrlToText(file.dataUrl)}</content>
    </file>
    `,
        )
        .join('')}
</files>
    `
}
