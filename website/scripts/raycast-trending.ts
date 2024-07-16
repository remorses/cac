async function main() {
    const extension = `xmorse/remove-background-powered-by-mac`
    console.log(`incrementing https://www.raycast.com/${extension}`)
    const res = await fetch(
        `https://backend.raycast.com/api/v1/extensions/${extension}/increment_install_count`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Accept-Language': 'en-GB,en;q=0.9',
                'User-Agent':
                    'Raycast/1.77.0 (macOS Version 14.5 (Build 23F79))',
            },
            body: '{}',
        },
    )
    if (!res.ok) {
        throw new Error('Failed to increment install count')
    }
    console.log('Successfully incremented install count')
}

main()
