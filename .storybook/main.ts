import type { StorybookConfig } from '@storybook/html-vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/addon-a11y',
    ],
    framework: {
        name: '@storybook/html-vite',
        options: {},
    },
    async viteFinal(config) {
        return {
            ...config,
            plugins: [...(config.plugins ?? []), tailwindcss()],
            resolve: {
                alias: {
                    // Keep aliases in sync with vite.config.ts (manual).
                    $lib: resolve('src/lib'),
                    $components: resolve('src/components'),
                    $assets: resolve('src/assets'),
                },
            },
        };
    },
};

export default config;
