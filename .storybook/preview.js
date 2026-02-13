import './preview.css';

/**
 * @typedef {'light' | 'dark'} ThemeMode
 */

/** @type {import('@storybook/html').Decorator} */
const themeDecorator = (Story, context) => {
    const wrapper = document.createElement('div');
    const theme = /** @type {ThemeMode} */ (context.globals.theme ?? 'light');

    wrapper.dataset.theme = theme;
    wrapper.className = 'min-h-screen text-text md:p-6';
    wrapper.dir = 'rtl';

    const story = Story();
    if (typeof story === 'string') {
        wrapper.innerHTML = story;
    } else {
        wrapper.appendChild(story);
    }

    return wrapper;
};

/** @type {import('@storybook/html').Preview} */
const preview = {
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
