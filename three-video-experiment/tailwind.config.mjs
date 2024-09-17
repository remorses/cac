import config from 'template-rewrite-framer/tailwind.config'
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
        '../template-rewrite-framer/src/**/*.{js,ts,jsx,tsx}', //
        // '../website/node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
        // '../beskar/src/**/*.{js,ts,jsx,tsx}', //
    ],
}
