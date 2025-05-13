import config from 'plugin-migrate/tailwind.config'

/** @type {import('tailwindcss').Config} */
export default {
    ...config,
    content: [
        './src/**/*.{js,ts,jsx,tsx}', //
        '../plugin-migrate/src/**/*.{js,ts,jsx,tsx}', //
        // '../website/node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
        // '../beskar/src/**/*.{js,ts,jsx,tsx}', //
    ],
}
