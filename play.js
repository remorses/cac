function wrapWithName(fn, name) {
    console.log('wrapWithName', JSON.stringify(fn.name))
    if (typeof fn !== 'function') {
        throw new Error('wrapWithName expects a function as the first argument')
    }

    Object.defineProperty(fn, 'name', { value: name, configurable: true })
    return fn
}

const myFunction = wrapWithName(function () {
    console.log('This is a wrapped function')
    throw new Error('Something went wrong')
}, '/myFunction-xx/something')

try {
    myFunction()
} catch (error) {
    console.log(error.stack)
}
