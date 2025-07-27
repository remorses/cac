import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import framer from 'vite-plugin-framer'


const basePath = process.env.BASE_PATH

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
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
