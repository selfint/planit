import './preview.css';

import type { Decorator, Preview } from '@storybook/html';

type ThemeMode = 'light' | 'dark';

const themeDecorator: Decorator = (Story, context) => {
    const wrapper = document.createElement('div');
    const theme = (context.globals.theme as ThemeMode) ?? 'light';
    const isFullscreen = context.parameters.layout === 'fullscreen';

    wrapper.dataset.theme = theme;
    wrapper.className = isFullscreen
        ? 'min-h-screen text-text'
        : 'min-h-screen text-text md:p-6';
    wrapper.dir = 'rtl';

    const story = Story();
    if (typeof story === 'string') {
        wrapper.innerHTML = story;
    } else {
        wrapper.appendChild(story);
    }

    return wrapper;
};

const preview: Preview = {
    decorators: [themeDecorator],
    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Global theme for components',
            defaultValue: 'light',
            toolbar: {
                icon: 'circlehollow',
                items: [
                    { value: 'light', title: 'Light' },
                    { value: 'dark', title: 'Dark' },
                ],
                showName: true,
            },
        },
    },
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
