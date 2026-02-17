import type { Meta, StoryObj } from '@storybook/html';
import type { StateManagement } from '$lib/stateManagement';

import { SemesterPage } from './semester_page';

type SemesterPageStoryArgs = {
    number: number;
};

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
        window.history.replaceState(null, '', buildSemesterUrl(args.number));
        return SemesterPage(createSemesterStoryStateManagement());
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: (args) => {
        window.history.replaceState(null, '', buildSemesterUrl(args.number));
        return SemesterPage(createSemesterStoryStateManagement());
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

function createSemesterStoryStateManagement(): StateManagement {
    return {
        courses: {
            getCourse: async () => undefined,
            queryCourses: async () => ({
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
            getCoursesPage: async () => [],
            getCoursesCount: async () => 4,
            getCourseFaculties: async () => [],
        },
        catalogs: {
            getCatalogs: async () => ({}),
        },
        requirements: {
            getRequirement: async () => ({
                programId: '0324',
                catalogId: '2025_200',
                facultyId: 'computer-science',
                path: 'software',
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
            getActiveSelection: async () => ({
                catalogId: '2025_200',
                facultyId: 'computer-science',
                programId: '0324',
                path: 'software',
            }),
            setActiveSelection: async () => undefined,
            sync: async () => ({ status: 'updated' }),
        },
        plan: {
            getPlanState: async () => ({
                key: 'planPageState',
                value: {
                    semesters: [
                        { id: 'אביב-2026-0', courseCodes: [] },
                        { id: 'קיץ-2026-1', courseCodes: ['A100'] },
                    ],
                },
            }),
            setPlanState: async () => undefined,
        },
        meta: {
            get: async () => undefined,
            set: async () => undefined,
        },
    };
}
