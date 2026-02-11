import './preview.css';

import type { Preview } from '@storybook/html';

const preview: Preview = {
    parameters: {
        backgrounds: {
            default: 'light',
            values: [
                { name: 'light', value: '#f5f8f9' },
                { name: 'dark', value: '#0b1116' },
            ],
        },
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        layout: 'padded',
    },
};

export default preview;
