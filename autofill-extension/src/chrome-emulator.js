if (
    (typeof window !== 'undefined' && typeof chrome === 'undefined') ||
    !chrome?.runtime
) {
    window.chrome = {
        storage: {
            local: {
                get() {
                    return Promise.resolve({})
                },
                set() {
                    return Promise.resolve()
                },
            },
        },
        runtime: {
            connect() {},
            sendMessage() {
                console.log('chrome.runtime.sendMessage not available')
            },
            onMessage: {
                addListener() {},
                removeListener() {},
            },
        },
    }
}
