const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 1000)

fetch('http://localhost:8040/api/test', { signal: controller.signal })
    .then((response) => response.text())
    .then((data) => {
        console.log('Response:', data)
        clearTimeout(timeoutId)
    })
