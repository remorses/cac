// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
    esbuild: {
        jsx: 'transform',
    },

    test: {
        pool: 'threads',
        exclude: ['**/dist/**', '**/esm/**', '**/node_modules/**', '**/e2e/**'],
        disableConsoleIntercept: true,

        poolOptions: {
            threads: {
                isolate: false,
                useAtomics: true,
            },
        },
    },
})
