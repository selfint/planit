import type { Meta, StoryObj } from '@storybook/html';

import { CoursePage } from './course_page';

const meta: Meta = {
    title: 'Pages/Course',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => CoursePage(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => CoursePage(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
