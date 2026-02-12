import type { Meta, StoryObj } from '@storybook/html';

import { CourseTable } from './CourseTable';

const meta: Meta = {
    title: 'Components/CourseTable',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => CourseTable(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
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
