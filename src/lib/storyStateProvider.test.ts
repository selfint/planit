import { describe, expect, it, vi } from 'vitest';

import { createStoryStateProvider } from './storyStateProvider';

describe('storyStateProvider', () => {
    it('returns undefined defaults for missing overrides', async () => {
        const provider = createStoryStateProvider();

        await expect(provider.courses.get('1')).resolves.toBeUndefined();
        await expect(
            provider.courses.query({ page: 1, pageSize: 'all' })
        ).resolves.toBeUndefined();
        await expect(
            provider.requirements.get('0324')
        ).resolves.toBeUndefined();
        await expect(
            provider.requirements.sync({
                catalogId: '2025_200',
                facultyId: 'computer-science',
                programId: '0324',
            })
        ).resolves.toBeUndefined();
        await expect(provider.userPlan.get()).resolves.toBeUndefined();
    });

    it('uses provided overrides and keeps other defaults', async () => {
        const pageMock = vi.fn().mockResolvedValue([{ code: '234114' }]);
        const provider = createStoryStateProvider({
            courses: {
                page: pageMock,
            },
        });

        await expect(provider.courses.page(1, 0)).resolves.toEqual([
            { code: '234114' },
        ]);
        expect(pageMock).toHaveBeenCalledWith(1, 0);
        await expect(provider.catalogs.get()).resolves.toBeUndefined();
    });
});
