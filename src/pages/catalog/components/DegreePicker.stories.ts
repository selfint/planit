import type { Meta, StoryObj } from '@storybook/html';
import type { StateManagement } from '$lib/stateManagement';

import { DegreePicker } from './DegreePicker';

const storyStateManagement = createDegreePickerStoryStateManagement();

const meta: Meta = {
    title: 'Components/DegreePicker',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => DegreePicker(storyStateManagement),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => DegreePicker(storyStateManagement),
    globals: { theme: 'dark' },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};

function createDegreePickerStoryStateManagement(): StateManagement {
    return {
        courses: {
            getCourse: async () => undefined,
            queryCourses: async () => ({ courses: [], total: 0 }),
            getCoursesPage: async () => [],
            getCoursesCount: async () => 0,
            getCourseFaculties: async () => [],
        },
        catalogs: {
            getCatalogs: async () => ({
                '2025_200': {
                    he: 'קטלוג 2025',
                    'computer-science': {
                        he: 'מדעי המחשב',
                        '0324': {
                            he: 'מדעי המחשב - ארבע שנתי',
                        },
                    },
                },
            }),
        },
        requirements: {
            getRequirement: async () => ({
                programId: '0324',
                catalogId: '2025_200',
                facultyId: 'computer-science',
                data: {
                    name: 'root',
                    nested: [
                        {
                            name: 'software-path',
                            en: 'Software Path',
                            nested: [
                                {
                                    name: 'core',
                                    he: 'חובה',
                                    courses: ['234114', '236501'],
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
                path: undefined,
            }),
            setActiveSelection: async () => undefined,
            sync: async () => ({ status: 'updated' }),
        },
        plan: {
            getPlanState: async () => undefined,
            setPlanState: async () => undefined,
        },
        meta: {
            get: async () => undefined,
            set: async () => undefined,
        },
    };
}
