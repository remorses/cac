import { StreamTextResult } from "ai"
import stripJsonComments from "strip-json-comments"
import { sleep } from "./utils"

export function splitStringButKeepChar(str: string, char: string) {
    const result = [] as string[]
    let start = 0
    for (let i = 0; i < str.length; i++) {
        if (str[i] === char) {
            result.push(str.slice(start, i + 1))
            start = i + 1
        }
    }
    if (start < str.length) {
        result.push(str.slice(start))
    }
    return result
}

export function removeMarkdownSnippets(text: string) {
    // remove lines starting with optional spaces followed by ```lang
    text = text.replace(/^\s*```.*/gm, '')
    // remove lines starting with optional spaces followed by ```
    // text = text.replace(/^\s*```/gm, '')
    return text
}

export async function* NDJSONStream<T = any>({
    stream,
    minTime = 0,
    onToken,
}: {
    stream: StreamTextResult<any>
    minTime?: number
    onToken?: (token: string) => void
}): AsyncGenerator<T, void, unknown> {
    let buffer = ''
    let lastYieldTime = 0

    let loggedError = false
    let itemsLen = 0
    for await (const part of stream.textStream) {
        onToken?.(part)
        const parts = splitStringButKeepChar(part, '\n')

        // console.log('parts', parts)
        for (let p of parts) {
            buffer += p
            if (!loggedError && buffer.length > 300 && !itemsLen) {
                loggedError = true
                console.error(
                    `cannot parse LLM ndjson:`,
                    JSON.stringify(buffer),
                )
            }
            try {
                let probablyJson = stripJsonComments(buffer)
                if (itemsLen === 0 && probablyJson.includes('```')) {
                    const lines = probablyJson.split('\n')

                    const lineWithSnippet = lines.findIndex((x) =>
                        x.startsWith('```'),
                    )
                    probablyJson = lines.slice(lineWithSnippet).join('\n')
                }
                probablyJson = removeMarkdownSnippets(probablyJson)
                let obj = JSON.parse(probablyJson)
                const now = Date.now()
                if (now - lastYieldTime <= minTime) {
                    await sleep(minTime - (now - lastYieldTime))
                }
                // console.log('obj', obj)
                itemsLen += 1
                yield obj

                buffer = ''
                lastYieldTime = Date.now()
            } catch {
                // if (buffer.includes('\n')) {
                //     console.log('error', buffer)
                // }
            }
        }
    }
}
