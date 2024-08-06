

// export type PoweredBy = 'gitbook' | 'super.so' | 'popsy' | 'unknown'
export async function getPoweredBy(url: string, timeout = 1000 * 10) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(url, {
            headers: { accept: 'text/html' },
            redirect: 'follow',
            signal: controller.signal,
        })
        const powered = (res.headers.get('x-powered-by') || '')
            ?.toString()
            .toLowerCase()

        if (powered === 'gitbook') {
            return 'gitbook' as const
        }

        if (res.headers.get('content-type')?.startsWith('text/html')) {
            const text = await res.text()
            // console.log(text)
            if (text.includes('framerusercontent.com')) {
                return 'framer' as const
            }
            if (
                text.includes('cdn.prod.website-files.com') &&
                text.includes('webflow')
            ) {
                return 'webflow' as const
            }
            if (text.includes('/cluster/style.css')) {
                return 'super.so-cluster' as const
            }
            if (text.includes('/aether/style.css')) {
                return 'super.so-aether' as const
            }
            if (
                text.includes('https://super-static-assets.s3.amazonaws.com/')
            ) {
                return 'super.so' as const
            }
            if (text.includes('https://api.popsy.co')) {
                return 'popsy' as const
            }
        }
        return 'unknown' as const
        // console.log(res)
    } catch (e) {
        clearTimeout(id)
        console.log(`${url} getPoweredBy:`, e.message)
        return 'unknown' as const
    }
}
