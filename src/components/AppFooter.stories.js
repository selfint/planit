import { AppFooter } from './AppFooter';

/** @type {import('@storybook/html').Meta} */
const meta = {
    title: 'Components/AppFooter',
};

export default meta;

/** @typedef {import('@storybook/html').StoryObj} Story */

/** @type {Story} */
export const Default = {
    render: () => AppFooter(),
    globals: {
        theme: 'light',
    },
};

/** @type {Story} */
export const Dark = {
    render: () => AppFooter(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
