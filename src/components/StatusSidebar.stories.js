import { StatusSidebar } from './StatusSidebar';

/** @type {import('@storybook/html').Meta} */
const meta = {
    title: 'Components/StatusSidebar',
};

export default meta;

/** @typedef {import('@storybook/html').StoryObj} Story */

/** @type {Story} */
export const Default = {
    render: () => StatusSidebar(),
    globals: {
        theme: 'light',
    },
};

/** @type {Story} */
export const Dark = {
    render: () => StatusSidebar(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
