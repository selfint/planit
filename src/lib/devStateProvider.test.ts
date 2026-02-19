import { describe, expect, it } from 'vitest';

import {
    type DevStatePayload,
    createDevStateProvider,
    parseDevStatePayload,
} from './devStateProvider';

describe('devStateProvider', () => {
    it('creates provider and supports course lookup/query/pagination', async () => {
        const provider = createDevStateProvider(createPayload());

        await expect(provider.courses.get('104031')).resolves.toMatchObject({
            code: '104031',
        });
        await expect(
            provider.courses.query({
                query: 'ליניארית',
                page: 1,
                pageSize: 10,
            })
        ).resolves.toMatchObject({ total: 1 });
        await expect(provider.courses.page(1, 0)).resolves.toHaveLength(1);
        await expect(provider.courses.count()).resolves.toBe(2);
        await expect(provider.courses.faculties()).resolves.toEqual([
            'מתמטיקה',
            'פיזיקה',
        ]);
    });

    it('keeps user degree and requirements in sync in memory', async () => {
        const provider = createDevStateProvider(createPayload());

        await provider.userDegree.set({
            catalogId: '2023_201',
            facultyId: '00002120',
            programId: 'program-next',
            path: 'path-next',
        });

        await expect(provider.userDegree.get()).resolves.toEqual({
            catalogId: '2023_201',
            facultyId: '00002120',
            programId: 'program-next',
            path: 'path-next',
        });

        await expect(
            provider.requirements.get('program-next')
        ).resolves.toMatchObject({
            programId: 'program-next',
            path: 'path-next',
        });
    });

    it('parses valid payload and rejects malformed payload', () => {
        const validRaw = JSON.stringify(createPayload());
        const invalidRaw = JSON.stringify({ courses: {} });

        expect(parseDevStatePayload(validRaw)).toBeDefined();
        expect(parseDevStatePayload(invalidRaw)).toBeUndefined();
        expect(parseDevStatePayload('{bad-json')).toBeUndefined();
    });
});

function createPayload(): DevStatePayload {
    return {
        courses: {
            '104031': {
                code: '104031',
                name: 'אלגברה ליניארית',
                faculty: 'מתמטיקה',
                current: true,
            },
            '114071': {
                code: '114071',
                name: 'פיזיקה 1',
                faculty: 'פיזיקה',
                current: false,
            },
        },
        catalogs: {
            '2023_201': {
                he: 'קטלוג 2023',
            },
        },
        userDegree: {
            catalogId: '2023_201',
            facultyId: '00002120',
            programId: 'SC00001314_CG00006245',
            path: 'CG00006246',
        },
        requirements: {
            name: 'root',
            nested: [],
        },
    };
}
