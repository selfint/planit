import type { Meta, StoryObj } from '@storybook/html';

import { CourseCard } from './CourseCard';
import type { CourseRecord } from '$lib/indexeddb';

const meta: Meta = {
    title: 'Components/CourseCard',
};

export default meta;

export type Story = StoryObj;

const sampleCourse: CourseRecord = {
    code: '01040012',
    name: 'חשבון דיפרנציאלי ואינטגרלי 1מ',
    points: 5.5,
    median: 73.3,
};

export const Default: Story = {
    render: () => CourseCard(sampleCourse, { statusClass: 'bg-success' }),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => CourseCard(sampleCourse, { statusClass: 'bg-success' }),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
