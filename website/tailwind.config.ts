import { heroui } from "@heroui/react"
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
export default {
    mode: 'jit',
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
        // '../beskar/src/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {},
            typography: {
                quoteless: {
                    css: {
                        'blockquote p:first-of-type::before': {
                            content: 'none',
                        },
                        'blockquote p:first-of-type::after': {
                            content: 'none',
                        },
                    },
                },
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [
        typography, //
        forms,
        heroui({
            // themes: {
            //     dark: {
            //         colors: {
            //             primary: {
            //                 // DEFAULT: colors?.blue[300],
            //                 // foreground: '#000000',
            //             },
            //         },
            //     },
            // },
        }),
    ],
}
