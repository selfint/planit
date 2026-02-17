import type { Meta, StoryObj } from '@storybook/html';
import type { StateManagement } from '$lib/stateManagement';

import { CatalogPage } from './catalog_page';

const storyStateManagement = createCatalogStoryStateManagement();

const meta: Meta = {
    title: 'Pages/Catalog',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => CatalogPage(storyStateManagement),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => CatalogPage(storyStateManagement),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};

function createCatalogStoryStateManagement(): StateManagement {
    return {
        courses: {
            getCourse: async (code: string) => ({
                code,
                name: `Course ${code}`,
                median: 80,
                current: true,
            }),
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
                path: 'software-path',
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
                                    courses: ['234114', '236501', '236363'],
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
                path: 'software-path',
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
