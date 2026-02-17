import type { Meta, StoryObj } from '@storybook/html';
import { type StateProvider, state } from '$lib/stateManagement';

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
            get: (code: string) =>
                Promise.resolve({
                    code,
                    name: `Course ${code}`,
                    median: 80,
                    current: true,
                }),
            set: () => Promise.resolve(undefined),
            query: () => Promise.resolve({ courses: [], total: 0 }),
            page: () => Promise.resolve([]),
            count: () => Promise.resolve(0),
            faculties: () => Promise.resolve([]),
            getLastSync: () => Promise.resolve(undefined),
        },
        catalogs: {
            get: () =>
                Promise.resolve({
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
            sync: () => Promise.resolve({ status: 'updated' }),
        },
        userDegree: {
            get: () =>
                Promise.resolve({
                    catalogId: '2025_200',
                    facultyId: 'computer-science',
                    programId: '0324',
                    path: 'software-path',
                }),
            set: () => Promise.resolve(undefined),
        },
        userPlan: {
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(undefined),
        },
    };
}
