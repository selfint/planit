import type { Meta, StoryObj } from '@storybook/html';
import { state, type StateProvider } from '$lib/stateManagement';

import { CatalogPage } from './catalog_page';

const storyProvider = createCatalogStoryProvider();

const meta: Meta = {
    title: 'Pages/Catalog',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => {
        void state.provider.set(storyProvider);
        return CatalogPage();
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => {
        void state.provider.set(storyProvider);
        return CatalogPage();
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

function createCatalogStoryProvider(): StateProvider {
    return {
        courses: {
            get: async (code: string) => ({
                code,
                name: `Course ${code}`,
                median: 80,
                current: true,
            }),
            set: async () => undefined,
            query: async () => ({ courses: [], total: 0 }),
            page: async () => [],
            count: async () => 0,
            faculties: async () => [],
            getLastSync: async () => undefined,
        },
        catalogs: {
            get: async () => ({
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
            set: async () => undefined,
        },
        requirements: {
            get: async () => ({
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
                                    courses: ['234114', '236501', '236363'],
                                },
                            ],
                        },
                    ],
                },
            }),
            set: async () => undefined,
            sync: async () => ({ status: 'updated' }),
        },
        userDegree: {
            get: async () => ({
                catalogId: '2025_200',
                facultyId: 'computer-science',
                programId: '0324',
                path: 'software-path',
            }),
            set: async () => undefined,
        },
        userPlan: {
            get: async () => undefined,
            set: async () => undefined,
        },
    };
}
