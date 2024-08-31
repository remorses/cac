if (
    (typeof window !== 'undefined' && typeof chrome === 'undefined') ||
    !chrome?.runtime
) {
    window.chrome = {
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
