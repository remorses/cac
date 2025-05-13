import config from 'plugin-github-sync/tailwind.config'

/** @type {import('tailwindcss').Config} */
export default {
    ...config,
    content: [
        './src/**/*.{js,ts,jsx,tsx}', //
        '../plugin-github-sync/src/**/*.{js,ts,jsx,tsx}', //
        // '../website/node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
        // '../beskar/src/**/*.{js,ts,jsx,tsx}', //
    ],
}
