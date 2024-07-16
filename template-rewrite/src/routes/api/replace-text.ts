import OpenAI from 'openai'

import { EvenStream, openai } from '@/lib/ssr'
import { ReplaceTextInput } from '@/lib/types'
import { LoaderFunctionArgs } from '@remix-run/node'

export const runtime = 'edge'

export async function loader({ request: req }: LoaderFunctionArgs) {
    // allow cors from anywhere
    if (req.method === 'OPTIONS') {
        return new Response('ok', { status: 200 })
    }

    if (req.method !== 'POST') {
        return new Response('only POST method is allowed', { status: 405 })
    }
    const { description, oldText } = await req.json()
    const gen = await replaceText({ description, oldText, signal: req.signal })
    return EvenStream(gen, req)
}

export async function replaceText({
    description,
    oldText,
    signal,
}: ReplaceTextInput & { signal?: AbortSignal }) {
    console.log(oldText)
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: getPrompt({
                    description,
                    oldText: oldText,
                }),
            },
        ],
        model: 'gpt-3.5-turbo',
        stream: true,
    })
    signal?.addEventListener('abort', () => {
        console.log('aborted')
        completion.controller.abort()
    })
    let buffer = ''
    return async function* () {
        for await (const message of completion) {
            let part = message.choices[0].delta.content || ''
            const parts = part.split('\n')
            for (let p of parts) {
                buffer += p
                try {
                    let obj = JSON.parse(buffer)
                    console.log('obj', obj)
                    yield obj
                    buffer = ''
                } catch {
                    // console.log('error', buffer)
                }
            }
        }
    }
}

function getPrompt({ description, oldText }) {
    return `
You are a web developer that has to replace the text from a Framer template with new text that follows the new business and branding of the customer, this is the customer description of what the new page should talk about:

\`\`\`
${description}
\`\`\`

Here are the text to replace in JSON format, keep the new text about the same length as the old text, you should return NDJSON list with the same number of items and using the same ids for each item,but rephrased to follow the new customer business idea. some text will remain the same because part of the UI, for example text like "accept cookies" or "privacy policy" will not change, but the rest of the text should be rephrased:

${JSON.stringify(oldText)}

Give me now the NDJSON (json strings delimited by new lines) list of the new text to replace the old text with. Use the same shape as the given JSON, a list of strings or objects.
`
}
