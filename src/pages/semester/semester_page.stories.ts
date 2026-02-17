import type { Meta, StoryObj } from '@storybook/html';
import { type StateProvider, state } from '$lib/stateManagement';

import { SemesterPage } from './semester_page';

type SemesterPageStoryArgs = {
    number: number;
};

const storyProvider = createSemesterStoryProvider();

const meta: Meta<SemesterPageStoryArgs> = {
    title: 'Pages/Semester',
    parameters: {
        layout: 'fullscreen',
    },
    argTypes: {
        number: {
            control: { type: 'number', min: 1, step: 1 },
            description: 'Semester number for /semester?number=<n>',
        },
    },
    args: {
        number: 3,
    },
};

export default meta;

type Story = StoryObj<SemesterPageStoryArgs>;

export const Default: Story = {
    render: (args) => {
        void state.provider.set(storyProvider);
        window.history.replaceState(null, '', buildSemesterUrl(args.number));
        return SemesterPage();
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: (args) => {
        void state.provider.set(storyProvider);
        window.history.replaceState(null, '', buildSemesterUrl(args.number));
        return SemesterPage();
    },
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};

function buildSemesterUrl(semesterNumber: number): string {
    if (!Number.isInteger(semesterNumber) || semesterNumber < 1) {
        return '/semester';
    }

    return `/semester?number=${String(semesterNumber)}`;
}

function createSemesterStoryProvider(): StateProvider {
    return {
        courses: {
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(undefined),
            query: () =>
                Promise.resolve({
                    total: 4,
                    courses: [
                        {
                            code: 'A100',
                            name: 'A100',
                            faculty: 'מדעי המחשב',
                            median: 90,
                        },
                        {
                            code: 'B200',
                            name: 'B200',
                            faculty: 'מדעי המחשב',
                            median: 80,
                        },
                        {
                            code: 'C300',
                            name: 'C300',
                            faculty: 'מתמטיקה',
                            median: 70,
                        },
                        {
                            code: 'D400',
                            name: 'D400',
                            faculty: 'פיזיקה',
                            median: 85,
                        },
                    ],
                }),
            page: () => Promise.resolve([]),
            count: () => Promise.resolve(4),
            faculties: () => Promise.resolve([]),
            getLastSync: () => Promise.resolve(undefined),
        },
        catalogs: {
            get: () => Promise.resolve({}),
            set: () => Promise.resolve(undefined),
        },
        requirements: {
            get: () =>
                Promise.resolve({
                    programId: '0324',
                    catalogId: '2025_200',
                    facultyId: 'computer-science',
                    data: {
                        name: 'root',
                        nested: [
                            {
                                name: 'software',
                                en: 'Software Path',
                                nested: [
                                    {
                                        name: 'core',
                                        courses: ['A100', 'B200'],
                                    },
                                ],
                            },
                        ],
                    },
                }),
            sync: () => Promise.resolve({ status: 'updated' }),
        },
        userDegree: {
            get: () =>
                Promise.resolve({
                    catalogId: '2025_200',
                    facultyId: 'computer-science',
                    programId: '0324',
                    path: 'software',
                }),
            set: () => Promise.resolve(undefined),
        },
        userPlan: {
            get: () =>
                Promise.resolve({
                    key: 'planPageState',
                    value: {
                        semesters: [
                            { id: 'אביב-2026-0', courseCodes: [] },
                            { id: 'קיץ-2026-1', courseCodes: ['A100'] },
                        ],
                    },
                }),
            set: () => Promise.resolve(undefined),
        },
    };
}
