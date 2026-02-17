import type { Meta, StoryObj } from '@storybook/html';
import type { StateManagement } from '$lib/stateManagement';

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
    render: () => SearchPage(storyStateManagement),
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => SearchPage(storyStateManagement),
    globals: {
        theme: 'dark',
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        },
    },
};

function createSearchStoryStateManagement(): StateManagement {
    return {
        courses: {
            getCourse: async () => undefined,
            queryCourses: async () => ({
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
            getCoursesPage: async () => [],
            getCoursesCount: async () => 3,
            getCourseFaculties: async () => ['מדעי המחשב', 'מתמטיקה'],
        },
        catalogs: {
            getCatalogs: async () => ({}),
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
                            he: 'חובה',
                            courses: ['234114', '236501'],
                        },
                    ],
                },
            }),
            getActiveSelection: async () => undefined,
            setActiveSelection: async () => undefined,
            sync: async () => ({ status: 'updated' }),
        },
        plan: {
            getPlanState: async () => undefined,
            setPlanState: async () => undefined,
        },
        meta: {
            get: async (key: string) => {
                if (key === 'requirementsActiveProgramId') {
                    return { key, value: '0324' };
                }
                if (key === 'courseDataLastSync') {
                    return { key, value: new Date().toISOString() };
                }
                return undefined;
            },
            set: async () => undefined,
        },
    };
}
