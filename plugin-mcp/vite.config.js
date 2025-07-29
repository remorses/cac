/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import framer from 'vite-plugin-framer'


// https://vitejs.dev/config/
export default defineConfig({
    test: {
        pool: 'threads',
        exclude: ['**/dist/**', '**/esm/**', '**/node_modules/**', '**/e2e/**'],
        poolOptions: {
            threads: {
                isolate: false,
            },
        },
    },

    plugins: [
        // cloudflare({}),
        react(),
        mkcert(),
        framer(),
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        EnvironmentPlugin('all', { prefix: 'NEXT_PUBLIC' }),
        tsconfigPaths(),

    ],
    build: {
        assetsInlineLimit: 30720,
    },
    server: {
        proxy: {},
        cors: true,
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(
            process.env.NODE_ENV || 'production',
        ),
    },
})
