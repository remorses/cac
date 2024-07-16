import { nextui } from '@nextui-org/react'
import typography from '@tailwindcss/typography'

import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
export default {
    mode: 'jit',
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
        // '../beskar/src/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {},
        },
    },
    variants: {
        extend: {},
    },
    plugins: [
        typography, //
        nextui({
            themes: {
                dark: {
                    colors: {
                        primary: {
                            DEFAULT: colors?.blue[300],
                            // foreground: '#000000',
                        },
                    },
                },
            },
        }),
    ],
}
