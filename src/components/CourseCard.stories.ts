import type { Meta, StoryObj } from '@storybook/html';

import { CourseCard } from './CourseCard';

const meta: Meta = {
    title: 'Components/CourseCard',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () =>
        CourseCard({
            title: 'חשבון דיפרנציאלי ואינטגרלי 1מ',
            code: '01040012',
            points: '5.5',
            median: '73.3',
            statusClass: 'bg-success',
        }),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () =>
        CourseCard({
            title: 'חשבון דיפרנציאלי ואינטגרלי 1מ',
            code: '01040012',
            points: '5.5',
            median: '73.3',
            statusClass: 'bg-success',
        }),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
