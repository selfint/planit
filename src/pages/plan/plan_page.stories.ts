import type { Meta, StoryObj } from '@storybook/html';
import { type StateProvider, state } from '$lib/stateManagement';

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
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(undefined),
            query: () => Promise.resolve({ courses: [], total: 0 }),
            page: () =>
                Promise.resolve([
                    { code: '104031', name: 'חדו"א 1', points: 5, median: 78 },
                    {
                        code: '234114',
                        name: 'מבוא למדעי המחשב',
                        points: 4,
                        median: 82,
                    },
                ]),
            count: () => Promise.resolve(2),
            faculties: () => Promise.resolve([]),
            getLastSync: () => Promise.resolve(undefined),
        },
        catalogs: {
            get: () => Promise.resolve({}),
            set: () => Promise.resolve(undefined),
        },
        requirements: {
            get: () => Promise.resolve(undefined),
            sync: () => Promise.resolve({ status: 'updated' }),
        },
        userDegree: {
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(undefined),
        },
        userPlan: {
            get: () => Promise.resolve(undefined),
            set: () => Promise.resolve(undefined),
        },
    };
}
