import type { Meta, StoryObj } from '@storybook/html';
import { type StateProvider, state } from '$lib/stateManagement';

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
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(undefined),
            query: () =>
                Promise.resolve({
                    total: 3,
                    courses: [
                        {
                            code: '234114',
                            name: 'מבוא למדעי המחשב',
                            current: true,
                        },
                        {
                            code: '236501',
                            name: 'מבוא לבינה מלאכותית',
                            current: true,
                        },
                        {
                            code: '236363',
                            name: 'מערכות הפעלה',
                            current: false,
                        },
                    ],
                }),
            page: () => Promise.resolve([]),
            count: () => Promise.resolve(3),
            faculties: () => Promise.resolve(['מדעי המחשב', 'מתמטיקה']),
            getLastSync: () => Promise.resolve(new Date().toISOString()),
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
                                he: 'חובה',
                                courses: ['234114', '236501'],
                            },
                        ],
                    },
                }),
            set: () => Promise.resolve(undefined),
            sync: () => Promise.resolve({ status: 'updated' }),
        },
        userDegree: {
            get: () =>
                Promise.resolve({
                    catalogId: '2025_200',
                    facultyId: 'computer-science',
                    programId: '0324',
                    path: undefined,
                }),
            set: () => Promise.resolve(undefined),
        },
        userPlan: {
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(undefined),
        },
    };
}
