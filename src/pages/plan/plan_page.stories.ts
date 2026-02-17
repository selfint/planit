import type { Meta, StoryObj } from '@storybook/html';
import type { StateManagement } from '$lib/stateManagement';

import { PlanPage } from './plan_page';

const storyStateManagement = createPlanStoryStateManagement();

const meta: Meta = {
    title: 'Pages/Plan',
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => PlanPage(storyStateManagement),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => PlanPage(storyStateManagement),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};

function createPlanStoryStateManagement(): StateManagement {
    return {
        courses: {
            getCourse: async () => undefined,
            queryCourses: async () => ({ courses: [], total: 0 }),
            getCoursesPage: async () => [
                {
                    code: '104031',
                    name: 'חדו"א 1',
                    points: 5,
                    median: 78,
                    seasons: ['חורף', 'אביב'],
                    tests: [null],
                },
                {
                    code: '234114',
                    name: 'מבוא למדעי המחשב',
                    points: 4,
                    median: 82,
                    seasons: ['אביב'],
                    tests: [null],
                },
            ],
            getCoursesCount: async () => 2,
            getCourseFaculties: async () => [],
        },
        catalogs: {
            getCatalogs: async () => ({}),
        },
        requirements: {
            getRequirement: async () => undefined,
            getActiveSelection: async () => undefined,
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
