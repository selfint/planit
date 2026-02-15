import type { Meta, StoryObj } from '@storybook/html';

import { CourseCard } from './CourseCard';
import type { CourseRecord } from '$lib/indexeddb';

const meta: Meta = {
    title: 'Components/CourseCard',
};

export default meta;

export type Story = StoryObj;

const sampleCourses: CourseRecord[] = [
    {
        code: '01040012',
        name: 'חשבון דיפרנציאלי ואינטגרלי 1מ',
        points: 5.5,
        median: 73.3,
        tests: [{ year: 2025, monthIndex: 1, day: 14 }],
    },
    {
        code: '234114',
        name: 'מבוא למדעי המחשב',
        points: 4,
        median: 84,
        tests: [null],
    },
    {
        code: '234124',
        name: 'מבני נתונים',
        points: 4,
        median: 79,
        tests: [{ year: 2025, monthIndex: 7, day: 2 }],
    },
    {
        code: '236350',
        name: 'בסיסי נתונים',
        points: 3,
        median: 82,
        tests: [{ year: 2024, monthIndex: 5, day: 11 }],
    },
    {
        code: '236501',
        name: 'מבוא לבינה מלאכותית',
        points: 3,
        median: 87,
        tests: [null],
    },
    {
        code: '044252',
        name: 'מערכות ספרתיות',
        points: 3,
        median: 75,
        tests: [{ year: 2025, monthIndex: 11, day: 19 }],
    },
];

function createStoryHost(classes: string): HTMLDivElement {
    const host = document.createElement('div');
    host.className = classes;
    return host;
}

function createCardRow(course: CourseRecord): HTMLElement {
    return CourseCard(course);
}

function createRailItem(card: HTMLElement): HTMLDivElement {
    const item = document.createElement('div');
    item.className = 'min-w-[6.4rem] shrink-0 basis-[calc((100%-1.5rem)/3)]';
    item.append(card);
    return item;
}

function renderDefaultCards(): HTMLElement {
    const grid = createStoryHost('grid grid-cols-3 gap-3');
    grid.append(createCardRow(sampleCourses[0]), CourseCard());
    return grid;
}

function renderManyHorizontalCards(): HTMLElement {
    const rail = createStoryHost(
        'mx-auto flex w-full max-w-4xl gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]'
    );
    for (const course of sampleCourses) {
        rail.append(createRailItem(createCardRow(course)));
    }
    rail.append(createRailItem(CourseCard()));
    return rail;
}

function renderDenseGrid(): HTMLElement {
    const grid = createStoryHost(
        'grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5'
    );
    for (const course of sampleCourses) {
        grid.append(createCardRow(course));
    }
    grid.append(CourseCard());
    grid.append(
        CourseCard(
            {
                code: '999999',
                name: 'קורס עם שם ארוך במיוחד כדי לבדוק חיתוך טקסט בכרטיס',
                points: 2,
                median: 68,
                tests: [null],
            },
            { statusClass: 'bg-warning' }
        )
    );
    return grid;
}

function renderWrappedCards(): HTMLElement {
    const wrap = createStoryHost('flex flex-wrap gap-3');
    for (const course of sampleCourses) {
        wrap.append(createCardRow(course));
    }
    wrap.append(CourseCard());
    return wrap;
}

function renderStatusPalette(): HTMLElement {
    const classes = [
        'bg-success',
        'bg-warning',
        'bg-info',
        'bg-danger',
        'bg-accent',
    ];
    const container = createStoryHost('grid grid-cols-3 gap-3 sm:grid-cols-5');

    classes.forEach((statusClass, index) => {
        const course = sampleCourses[index % sampleCourses.length];
        container.append(
            CourseCard(course, {
                statusClass,
            })
        );
    });

    return container;
}

export const Default: Story = {
    render: () => renderDefaultCards(),
    globals: {
        theme: 'light',
    },
};

export const HorizontalRail: Story = {
    render: () => renderManyHorizontalCards(),
    globals: {
        theme: 'light',
    },
};

export const DenseGrid: Story = {
    render: () => renderDenseGrid(),
    globals: {
        theme: 'light',
    },
};

export const WrappedFlow: Story = {
    render: () => renderWrappedCards(),
    globals: {
        theme: 'light',
    },
};

export const StatusPalette: Story = {
    render: () => renderStatusPalette(),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => renderDenseGrid(),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};
