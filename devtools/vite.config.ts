import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react-swc'

const building = process.env.NODE_ENV === 'production'

const basePath = '/framer-plugin/angled-screen'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),

        // framer(),
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        tsconfigPaths(),
    ],
    base: building ? basePath : undefined,
    build: {
        target: 'ES2020',
        sourcemap: true,
        outDir: 'dist' + basePath,
    },
})
