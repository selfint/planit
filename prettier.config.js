/** @type {import("prettier").Config} */
const config = {
    plugins: ['prettier-plugin-tailwindcss'],
    trailingComma: 'es5',
    singleAttributePerLine: false,
    tabWidth: 4,
    useTabs: false,
    singleQuote: true,
    bracketSpacing: true,
    overrides: [
        {
            files: ['*.yml', '*.yaml'],
            options: { tabWidth: 2 },
        },
    ],
};

export default config;
