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

function renderCards(): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-3 gap-3';
    grid.append(
        CourseCard(sampleCourse, { statusClass: 'bg-success' }),
        CourseCard()
    );
    return grid;
}

export const Default: Story = {
    render: () => renderCards(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => renderCards(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
