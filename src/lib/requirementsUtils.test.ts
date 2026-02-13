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
                { name: 'PATH_A', en: 'Data Science Path' },
                { name: 'REQ_1', en: 'Mandatory' },
            ],
        };

        const options = buildPathOptions(root);

        expect(options).toHaveLength(1);
        expect(options[0]?.id).toBe('PATH_A');
        expect(options[0]?.label).toBe('Data Science Path');
    });

    it('filters requirements by selected path contents', () => {
        const root: RequirementNode = {
            name: 'root',
            nested: [
                {
                    name: 'PATH_A',
                    en: 'Systems Path',
                    nested: [
                        {
                            name: 'REQ_IN_PATH',
                            en: 'Mandatory',
                            courses: ['001'],
                        },
                    ],
                },
                { name: 'REQ_1', en: 'Mandatory', courses: ['002'] },
                {
                    name: 'EL_1',
                    en: 'All-Technion Electives',
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
                { name: 'PATH_A', en: 'Systems Path', nested: [] },
                { name: 'REQ_1', en: 'Mandatory', courses: ['002'] },
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
