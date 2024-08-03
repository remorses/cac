import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'

import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import framer from 'vite-plugin-framer'

const building = process.env.NODE_ENV === 'production'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // mkcert(),
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        EnvironmentPlugin('all'),
        tsconfigPaths(),
        crx({ manifest }),
    ],
})
