import type { Meta, StoryObj } from '@storybook/html';
import { type StateProvider, state } from '$lib/stateManagement';
import { createStoryStateProvider } from '$lib/test-utils/storyStateProvider';

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
        state.provider.set(storyProvider);
        window.history.replaceState(null, '', buildSemesterUrl(args.number));
        return SemesterPage();
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: (args) => {
        state.provider.set(storyProvider);
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
    return createStoryStateProvider({
        courses: {
            get: (code) => {
                const byCode: Record<
                    string,
                    {
                        code: string;
                        name: string;
                        faculty: string;
                        median: number;
                    }
                > = {
                    A100: {
                        code: 'A100',
                        name: 'A100',
                        faculty: 'מדעי המחשב',
                        median: 90,
                    },
                    B200: {
                        code: 'B200',
                        name: 'B200',
                        faculty: 'מדעי המחשב',
                        median: 80,
                    },
                };

                return Promise.resolve(byCode[code]);
            },
            query: ({ faculty }) => {
                if (faculty === 'מדעי המחשב') {
                    return Promise.resolve({
                        total: 2,
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
                        ],
                    });
                }
                if (faculty === 'מתמטיקה') {
                    return Promise.resolve({
                        total: 1,
                        courses: [
                            {
                                code: 'C300',
                                name: 'C300',
                                faculty: 'מתמטיקה',
                                median: 70,
                            },
                        ],
                    });
                }
                if (faculty === 'פיזיקה') {
                    return Promise.resolve({
                        total: 1,
                        courses: [
                            {
                                code: 'D400',
                                name: 'D400',
                                faculty: 'פיזיקה',
                                median: 85,
                            },
                        ],
                    });
                }

                return Promise.resolve({ total: 0, courses: [] });
            },
            page: () => Promise.resolve([]),
            count: () => Promise.resolve(4),
            faculties: () =>
                Promise.resolve(['מדעי המחשב', 'מתמטיקה', 'פיזיקה']),
        },
        catalogs: {
            get: () => Promise.resolve({}),
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
        },
    });
}
