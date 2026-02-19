import type { Meta, StoryObj } from '@storybook/html';
import { type StateProvider, state } from '$lib/stateManagement';
import type { CourseRecord } from '$lib/indexeddb';
import { createStoryStateProvider } from '$lib/test-utils/storyStateProvider';

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
        state.provider.set(storyProvider);
        return PlanPage();
    },
    globals: {
        theme: 'light',
    },
};

export const Dark: Story = {
    render: () => {
        state.provider.set(storyProvider);
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
    const courses = createStoryCourses(40);
    const courseByCode = new Map(
        courses.map((course) => [course.code, course])
    );

    return createStoryStateProvider({
        courses: {
            get: (code: string) => Promise.resolve(courseByCode.get(code)),
            query: () => Promise.resolve({ courses: [], total: 0 }),
            page: (limit: number, offset: number) =>
                Promise.resolve(courses.slice(offset, offset + limit)),
            count: () => Promise.resolve(courses.length),
            faculties: () => Promise.resolve([]),
        },
        userPlan: {
            get: () =>
                Promise.resolve({
                    key: 'planPageState',
                    value: createStoryPlanState(courses),
                }),
        },
        requirements: {
            sync: () => Promise.resolve({ status: 'updated' }),
        },
    });
}

function createStoryCourses(total: number): CourseRecord[] {
    const courses: CourseRecord[] = [];
    for (let index = 0; index < total; index += 1) {
        const code = `S${String(index + 1).padStart(5, '0')}`;
        courses.push({
            code,
            name: `קורס הדגמה ${String(index + 1)}`,
            points: 2 + (index % 4),
            median: 70 + (index % 25),
            seasons: ['אביב', 'קיץ', 'חורף'],
        });
    }
    return courses;
}

function createStoryPlanState(courses: CourseRecord[]): {
    version: number;
    semesterCount: number;
    semesters: { id: string; courseCodes: string[] }[];
    wishlistCourseCodes: string[];
    exemptionsCourseCodes: string[];
} {
    const semesterIds = [
        'אביב-2026-0',
        'קיץ-2026-1',
        'חורף-2026-2',
        'אביב-2027-3',
        'קיץ-2027-4',
        'חורף-2027-5',
        'אביב-2028-6',
        'קיץ-2028-7',
    ];
    const semesterLoads = [0, 1, 2, 3, 4, 5, 7, 10];

    let cursor = 0;
    const semesters = semesterIds.map((id, index) => {
        const load = semesterLoads[index] ?? 0;
        const courseCodes = courses
            .slice(cursor, cursor + load)
            .map((course) => course.code);
        cursor += load;
        return { id, courseCodes };
    });

    const wishlistCourseCodes = courses
        .slice(cursor, cursor + 3)
        .map((course) => course.code);
    const exemptionsCourseCodes = courses
        .slice(cursor + 3, cursor + 5)
        .map((course) => course.code);

    return {
        version: 2,
        semesterCount: semesterIds.length,
        semesters,
        wishlistCourseCodes,
        exemptionsCourseCodes,
    };
}
