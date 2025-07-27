import config from 'plugin-mcp/tailwind.config'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
    ...config,
    darkMode: ['selector', '[data-framer-theme="dark"]'],
    content: [
        './src/**/*.{js,ts,jsx,tsx}', //
        '../plugin-migrate/src/**/*.{js,ts,jsx,tsx}',
        '../plugin-mcp/src/**/*.{js,ts,jsx,tsx}', //
        // '../website/node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
        // '../beskar/src/**/*.{js,ts,jsx,tsx}', //
    ],
    plugins: [typography({})],
}
