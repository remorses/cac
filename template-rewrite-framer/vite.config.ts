import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'

import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import framer from 'vite-plugin-framer'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        mkcert(),
        framer(),
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        tsconfigPaths(),
    ],
    base: '/plugins/migrate',
    
    build: {
        target: 'ES2022',
        outDir: 'dist/plugins/migrate',
    },
})
