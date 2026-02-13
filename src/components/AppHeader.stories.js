import { AppHeader } from './AppHeader';

/** @type {import('@storybook/html').Meta} */
const meta = {
    title: 'Components/AppHeader',
};

export default meta;

/** @typedef {import('@storybook/html').StoryObj} Story */

/** @type {Story} */
export const Default = {
    render: () => AppHeader(),
    globals: {
        theme: 'light',
    },
};

/** @type {Story} */
export const Dark = {
    render: () => AppHeader(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
