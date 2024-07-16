export function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

export function Uint8ArrayToBase64(buffer: Uint8Array) {
    var blob = new Blob([buffer], { type: 'image/png' })
    var url = URL.createObjectURL(blob)
    return url
}


export const noop: any = () => {}