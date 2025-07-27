import config from 'plugin-mcp/tailwind.config'
import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
    ...config,
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                gray: colors.zinc,
            },
        },
    },
    content: [
        './src/**/*.{js,ts,jsx,tsx}', //
        '../plugin-migrate/src/**/*.{js,ts,jsx,tsx}',
        '../plugin-mcp/src/**/*.{js,ts,jsx,tsx}', //
        // '../website/node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
        // '../beskar/src/**/*.{js,ts,jsx,tsx}', //
    ],
}
