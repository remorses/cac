export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url)
        const rewriteTo = {
            '/plugins/migrate':
                'https://framer-template-rewrite.pages.dev',
        }
        for (let [from, to] of Object.entries(rewriteTo)) {
            if (url.pathname.startsWith(from)) {
                // url.pathname = to
                let target = new URL(to)
                target.pathname = url.pathname
                target.search = url.search
                console.log('rewriting to', target.toString())
                return await fetch(target.toString(), request)
            }
        }

        return new Response('Not found', {
            status: 404,
        })
        // return fetch(url.toString(), request)
    },
}
