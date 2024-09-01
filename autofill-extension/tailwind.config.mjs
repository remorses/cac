import websiteConfig from 'website/tailwind.config'

/** @type {import('tailwindcss').Config} */
export default {
    ...websiteConfig,
    content: [
        './src/**/*.{js,ts,jsx,tsx}', //
        // '../website/src/**/*.{js,ts,jsx,tsx}', //
        // '../website/node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
        // '../beskar/src/**/*.{js,ts,jsx,tsx}', //
    ],
    theme: {
        extend: {
            // ...websiteConfig.theme.extend,
            backgroundColor: {
                framer: {
                    primary: 'var(--framer-color-bg)',
                    secondary: 'var(--framer-color-bg-secondary)',
                    tertiary: 'var(--framer-color-bg-tertiary)',
                    divider: 'var(--framer-color-divider)',
                    tintDimmed: 'var(--framer-color-tint-dimmed)',
                    tintDark: 'var(--framer-color-tint-dark)',
                    blackDimmed: 'rgba(0, 0, 0, 0.5)',
                    tint: 'var(--framer-color-tint)',
                },
            },
            colors: {
                framer: {
                    primary: 'var(--framer-color-text)',
                    secondary: 'var(--framer-color-text-secondary)',
                    tertiary: 'var(--framer-color-text-tertiary)',
                    inverted: 'var(--framer-color-text-inverted)',
                    tint: 'var(--framer-color-tint)',
                },
            },
            borderColor: {
                framer: {
                    divider: 'var(--framer-color-divider)',
                },
            },
            fontSize: {
                '2xs': '10px',
            },

            gap: {
                3: '10px',
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
}
