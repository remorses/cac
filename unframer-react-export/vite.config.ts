import { defineConfig } from 'vite'
import EnvironmentPlugin from 'vite-plugin-environment'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import framer from 'vite-plugin-framer'
import { CopyOnEnd } from '../template-rewrite-framer/vite.config'

const building = process.env.NODE_ENV === 'production'

const basePath = process.env.BASE_PATH || '/framer-plugin/react-export'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        mkcert(),
        framer(),
        CopyOnEnd({
            basePath,
            out: '../website/public',
        }),
        EnvironmentPlugin('all', { prefix: 'PUBLIC' }),
        tsconfigPaths(),
    ],
    
})
