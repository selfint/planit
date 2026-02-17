import type { Meta, StoryObj } from '@storybook/html';
import { state, type StateProvider } from '$lib/stateManagement';

import { DegreePicker } from './DegreePicker';

const storyProvider = createDegreePickerStoryProvider();

const meta: Meta = {
    title: 'Components/DegreePicker',
};

export default meta;

export type Story = StoryObj;

export const Default: Story = {
    render: () => {
        void state.provider.set(storyProvider);
        return DegreePicker();
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => {
        void state.provider.set(storyProvider);
        return DegreePicker();
    },
    globals: { theme: 'dark' },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};

function createDegreePickerStoryProvider(): StateProvider {
    return {
        courses: {
            get: async () => undefined,
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
                                    courses: ['234114', '236501'],
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
