import { CourseTable } from './CourseTable';

/** @type {import('@storybook/html').Meta} */
const meta = {
    title: 'Components/CourseTable',
};

export default meta;

/** @typedef {import('@storybook/html').StoryObj} Story */

/** @type {Story} */
export const Default = {
    render: () => CourseTable(),
    globals: {
        theme: 'light',
    },
};

/** @type {Story} */
export const Dark = {
    render: () => CourseTable(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
