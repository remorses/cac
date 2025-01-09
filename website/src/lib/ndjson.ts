import { ObjectStreamPart, StreamTextResult } from 'ai'
import stripJsonComments from 'strip-json-comments'
import { sleep } from './utils'
import { RequiredDeep } from 'type-fest/source/required-deep'

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

export async function* yieldObjectStream<T>({
    onToken,
    onError,
    stream,
    ms = 200,
}: {
    onToken?: Function
    onError?: Function
    stream: AsyncIterable<ObjectStreamPart<T>>
    ms?: number
}): AsyncIterable<T> {
    let start = Date.now()
    let lastObj: T | undefined

    for await (let obj of stream) {
        let now = Date.now()
        if (obj.type === 'object') {
            if (now - start > ms) {
                yield obj.object as T
                start = now
                lastObj = undefined
            } else {
                lastObj = obj.object as T
            }
        } else if (obj.type === 'error') {
            if (onError) {
                onError(new Error((obj.error as any) || ''))
            }
        } else if (obj.type === 'text-delta') {
            if (onToken) {
                onToken(obj.textDelta)
            }
        }
    }

    if (lastObj !== undefined) {
        yield lastObj
    }
}

type UnwrapArray<T> = T extends Array<infer U> ? U : T

type ArrayItemYield<T> =
    | {
          fullItem: RequiredDeep<T>
          type: 'fullItem'
          partialObject: undefined
      }
    | {
          fullItem: undefined
          type: 'partialItem'
          partialObject: Partial<T>
      }

// this function let you yield new array items by calling each time with an updated array
export function createArrayItemsYielder<T>() {
    let previousLength = 0
    let lastItem: T | null = null

    function* yieldNewItems(currentArray: T[]): Generator<ArrayItemYield<T>> {
        if (!Array.isArray(currentArray)) {
            console.error('Input is not an array:', currentArray)
            return
        }

        const currentLengthWithoutLast = currentArray.length - 1
        lastItem = currentArray[currentArray.length - 1] || null

        if (currentLengthWithoutLast > previousLength) {
            for (let i = previousLength; i < currentLengthWithoutLast; i++) {
                const item = currentArray[i] as RequiredDeep<T>
                yield {
                    partialObject: currentArray[i],
                    type: 'partialItem' as const,
                    fullItem: undefined,
                }
                yield {
                    fullItem: item,
                    type: 'fullItem' as const,
                    partialObject: undefined,
                }
            }

            previousLength = currentLengthWithoutLast
        }
        if (lastItem) {
            yield {
                partialObject: lastItem,
                type: 'partialItem' as const,
                fullItem: undefined,
            }
        }
    }

    function* yieldRemaining(): Generator<ArrayItemYield<T>> {
        if (lastItem) {
            yield {
                partialObject: lastItem,
                type: 'partialItem' as const,
                fullItem: undefined,
            }
            yield {
                fullItem: lastItem as RequiredDeep<T>,
                type: 'fullItem' as const,
                partialObject: undefined,
            }
        }
    }

    return {
        yieldNewItems,
        yieldRemaining,
    }
}

export async function* yieldNewArrayItems<T, Field extends keyof T & string>({
    arrayField,
    stream,
}: {
    arrayField: Field
    stream: AsyncIterable<T>
}): AsyncIterable<ArrayItemYield<UnwrapArray<T[Field]>>> {
    const yielder = createArrayItemsYielder<UnwrapArray<T[Field]>>()

    for await (const partialObject of stream) {
        const currentArray = partialObject[arrayField] || []
        if (!Array.isArray(currentArray)) {
            console.error(
                `objectStream[${arrayField}] is not an array:`,
                currentArray,
            )
            continue
        }

        yield* yielder.yieldNewItems(currentArray)
    }

    yield* yielder.yieldRemaining()
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
    stream: StreamTextResult<any, any>
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
