import type { Meta, StoryObj } from '@storybook/html';
import { state, type StateProvider } from '$lib/stateManagement';

import { SearchPage } from './search_page';

const storyStateManagement = createSearchStoryStateManagement();

const meta: Meta = {
    title: 'Pages/Search',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => {
        void state.provider.set(storyStateManagement);
        return SearchPage();
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => {
        void state.provider.set(storyStateManagement);
        return SearchPage();
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

function createSearchStoryStateManagement(): StateProvider {
    return {
        courses: {
            get: async () => undefined,
            set: async () => undefined,
            query: async () => ({
                total: 3,
                courses: [
                    { code: '234114', name: 'מבוא למדעי המחשב', current: true },
                    {
                        code: '236501',
                        name: 'מבוא לבינה מלאכותית',
                        current: true,
                    },
                    { code: '236363', name: 'מערכות הפעלה', current: false },
                ],
            }),
            page: async () => [],
            count: async () => 3,
            faculties: async () => ['מדעי המחשב', 'מתמטיקה'],
            getLastSync: async () => new Date().toISOString(),
        },
        catalogs: {
            get: async () => ({}),
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
                            he: 'חובה',
                            courses: ['234114', '236501'],
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
                path: undefined,
            }),
            set: async () => undefined,
        },
        userPlan: {
            get: async () => undefined,
            set: async () => undefined,
        },
    };
}
