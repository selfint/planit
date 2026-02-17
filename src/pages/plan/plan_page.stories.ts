import type { Meta, StoryObj } from '@storybook/html';
import { state, type StateProvider } from '$lib/stateManagement';

import { PlanPage } from './plan_page';

const storyProvider = createPlanStoryProvider();

const meta: Meta = {
    title: 'Pages/Plan',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => {
        void state.provider.set(storyProvider);
        return PlanPage();
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => {
        void state.provider.set(storyProvider);
        return PlanPage();
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

function createPlanStoryProvider(): StateProvider {
    return {
        courses: {
            get: async () => undefined,
            set: async () => undefined,
            query: async () => ({ courses: [], total: 0 }),
            page: async () => [
                { code: '104031', name: 'חדו"א 1', points: 5, median: 78 },
                {
                    code: '234114',
                    name: 'מבוא למדעי המחשב',
                    points: 4,
                    median: 82,
                },
            ],
            count: async () => 2,
            faculties: async () => [],
            getLastSync: async () => undefined,
        },
        catalogs: {
            get: async () => ({}),
            set: async () => undefined,
        },
        requirements: {
            get: async () => undefined,
            set: async () => undefined,
            sync: async () => ({ status: 'updated' }),
        },
        userDegree: {
            get: async () => undefined,
            set: async () => undefined,
        },
        userPlan: {
            get: async () => undefined,
            set: async () => undefined,
        },
    };
}
