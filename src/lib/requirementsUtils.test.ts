import { describe, expect, it } from 'vitest';

import {
    type RequirementNode,
    buildPathOptions,
    countUniqueCourses,
    filterRequirementsByPath,
} from '$lib/requirementsUtils';

describe('requirements utils', () => {
    it('detects path options from top-level nested entries', () => {
        const root: RequirementNode = {
            name: 'root',
            nested: [
                { name: 'PATH_A', he: 'מסלול מדעי הנתונים' },
                { name: 'REQ_1', he: 'חובה' },
            ],
        };

        const options = buildPathOptions(root);

        expect(options).toHaveLength(1);
        expect(options[0]?.id).toBe('PATH_A');
        expect(options[0]?.label).toBe('מסלול מדעי הנתונים');
    });

    it('detects path options for he labels that use נתיב or Path', () => {
        const root: RequirementNode = {
            name: 'root',
            nested: [
                { name: 'PATH_A', he: 'נתיב: מדעי המחשב תלת שנתי' },
                { name: 'PATH_B', he: 'Path: Computer Science and Bioinformatic' },
                { name: 'REQ_1', he: 'חובה' },
            ],
        };

        const options = buildPathOptions(root);

        expect(options.map((option) => option.id)).toEqual(['PATH_A', 'PATH_B']);
    });

    it('filters requirements by selected path contents', () => {
        const root: RequirementNode = {
            name: 'root',
            nested: [
                {
                    name: 'PATH_A',
                    he: 'מסלול מערכות',
                    nested: [
                        {
                            name: 'REQ_IN_PATH',
                            he: 'חובה',
                            courses: ['001'],
                        },
                    ],
                },
                { name: 'REQ_1', he: 'חובה', courses: ['002'] },
                {
                    name: 'EL_1',
                    he: 'בחירה כלל טכניונית',
                    courses: ['003'],
                },
            ],
        };

        const filtered = filterRequirementsByPath(root, 'PATH_A');

        expect(filtered.nested?.map((node) => node.name)).toEqual([
            'REQ_IN_PATH',
            'EL_1',
        ]);
    });

    it('returns empty nested when selected path has no requirements', () => {
        const root: RequirementNode = {
            name: 'root',
            nested: [
                { name: 'PATH_A', he: 'מסלול מערכות', nested: [] },
                { name: 'REQ_1', he: 'חובה', courses: ['002'] },
            ],
        };

        const filtered = filterRequirementsByPath(root, 'PATH_A');

        expect(filtered.nested).toEqual([]);
    });

    it('counts unique courses recursively', () => {
        const node: RequirementNode = {
            name: 'root',
            courses: ['001', '002'],
            nested: [
                { name: 'child-1', courses: ['002', '003'] },
                {
                    name: 'child-2',
                    nested: [{ name: 'child-3', courses: ['003', '004'] }],
                },
            ],
        };

        const count = countUniqueCourses(node);

        expect(count).toBe(4);
    });
});
