import './preview.css';

import type { Decorator, Preview } from '@storybook/html';

type ThemeMode = 'light' | 'dark';

const viewportOptions = {
    mobileSmall: {
        name: 'Mobile Small (360x640)',
        styles: {
            width: '360px',
            height: '640px',
        },
        type: 'mobile',
    },
    mobileLarge: {
        name: 'Mobile Large (430x932)',
        styles: {
            width: '430px',
            height: '932px',
        },
        type: 'mobile',
    },
    tablet: {
        name: 'Tablet (834x1112)',
        styles: {
            width: '834px',
            height: '1112px',
        },
        type: 'tablet',
    },
    desktop: {
        name: 'Desktop (1280x800)',
        styles: {
            width: '1280px',
            height: '800px',
        },
        type: 'desktop',
    },
} as const;

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
    initialGlobals: {
        viewport: {
            value: 'mobileLarge',
            isRotated: false,
        },
    },
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
        viewport: {
            options: viewportOptions,
        },
        layout: 'padded',
    },
};

export default preview;
