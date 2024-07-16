import { vitePlugin as remix } from '@remix-run/dev'
import mkcert from 'vite-plugin-mkcert'

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [
        remix({
            appDirectory: 'src',
            ssr: false,

            future: {
                v3_fetcherPersist: true,
                v3_relativeSplatPath: true,
                v3_throwAbortReason: true,
            },
        }),
        tsconfigPaths(),
        mkcert(),
        {
            name: 'framer-plugin',
            load(id, options) {
                // console.log('id', id)
                if (!options?.ssr) {
                    return
                }
                if (id.includes('/framer-plugin@')) {
                    return { code: `export {}` }
                }
                return
            },
        },
    ],
    ssr: {
        noExternal: ['framer-plugin'],
    },
})
