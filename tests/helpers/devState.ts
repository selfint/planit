import type { Page } from '@playwright/test';

type DevStateCourse = {
    code: string;
    name?: string;
    points?: number;
    median?: number;
    faculty?: string;
    current?: boolean;
    about?: string;
    seasons?: string[];
    connections?: {
        dependencies?: string[][];
        adjacent?: string[];
        exclusive?: string[];
    };
};

export type DevStateSnapshot = {
    courses?: DevStateCourse[];
    catalogs?: Record<string, unknown>;
    requirementsByProgramId?: Record<string, unknown>;
    userDegree?: {
        catalogId: string;
        facultyId: string;
        programId: string;
        path?: string;
    };
    userPlan?: unknown;
    courseLastSync?: string;
};

export function createDefaultDevStateSnapshot(): DevStateSnapshot {
    const courses: DevStateCourse[] = [
        {
            code: '01140075',
            name: 'מבוא לתכנות',
            points: 4,
            median: 82,
            faculty: 'מדעי המחשב',
            current: true,
            about: 'קורס פתיחה במדעי המחשב',
            seasons: ['חורף', 'אביב'],
        },
        {
            code: '104031',
            name: 'חשבון אינפיניטסימלי 1',
            points: 5,
            median: 78,
            faculty: 'מתמטיקה',
            current: true,
            seasons: ['חורף', 'אביב'],
            connections: {
                adjacent: ['104166'],
            },
        },
        {
            code: '104166',
            name: 'אלגברה לינארית 1',
            points: 5,
            median: 75,
            faculty: 'מתמטיקה',
            current: true,
            seasons: ['חורף', 'אביב'],
            connections: {
                dependencies: [['104031']],
            },
        },
        {
            code: '236501',
            name: 'מבוא לבינה מלאכותית',
            points: 3,
            median: 87,
            faculty: 'מדעי המחשב',
            current: true,
            seasons: ['אביב'],
            connections: {
                dependencies: [['01140075']],
            },
        },
        {
            code: '234114',
            name: 'מבוא למדעי המחשב',
            points: 4,
            median: 81,
            faculty: 'מדעי המחשב',
            current: true,
            seasons: ['אביב', 'קיץ'],
        },
        {
            code: '234124',
            name: 'מבני נתונים',
            points: 4,
            median: 76,
            faculty: 'מדעי המחשב',
            current: true,
            seasons: ['חורף', 'אביב'],
            connections: {
                dependencies: [['234114']],
            },
        },
        {
            code: '236350',
            name: 'בסיסי נתונים',
            points: 3,
            median: 84,
            faculty: 'מדעי המחשב',
            current: true,
            seasons: ['אביב', 'קיץ'],
        },
        {
            code: '236360',
            name: 'תורת הקומפילציה',
            points: 3,
            median: 75,
            faculty: 'מדעי המחשב',
            current: true,
            seasons: ['חורף'],
        },
        {
            code: '236363',
            name: 'מערכות הפעלה',
            points: 3,
            median: 82,
            faculty: 'מדעי המחשב',
            current: true,
            seasons: ['אביב'],
        },
    ];

    return {
        courses,
        catalogs: {
            '2023_201': {
                he: 'קטלוג תשפ"ג',
                '00002120': {
                    he: 'מדעי המחשב',
                    SC00001314_CG00006245: {
                        he: 'מדעי המחשב חד חוגי',
                    },
                },
            },
        },
        requirementsByProgramId: {
            SC00001314_CG00006245: {
                name: 'SC00001314_CG00006245',
                he: 'דרישות מדעי המחשב',
                nested: [
                    {
                        name: 'CG00006246',
                        en: 'Software Path',
                        he: 'מסלול תוכנה',
                        nested: [
                            {
                                name: 'core',
                                he: 'קורסי חובה',
                                courses: ['01140075', '104031', '104166'],
                            },
                        ],
                    },
                    {
                        name: 'elective',
                        en: 'Elective Courses',
                        he: 'קורסי בחירה',
                        courses: ['236501', '236350'],
                    },
                ],
            },
        },
        userDegree: {
            catalogId: '2023_201',
            facultyId: '00002120',
            programId: 'SC00001314_CG00006245',
            path: 'CG00006246',
        },
        courseLastSync: '2026-02-18T00:00:00.000Z',
    };
}

export async function setDevState(
    page: Page,
    snapshot: DevStateSnapshot
): Promise<void> {
    await page.addInitScript((payload) => {
        (
            window as Window & {
                __PLANIT_DEV_STATE__?: DevStateSnapshot;
            }
        ).__PLANIT_DEV_STATE__ = payload;
    }, snapshot);
}
