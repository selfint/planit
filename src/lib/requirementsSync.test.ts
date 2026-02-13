import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getMeta, replaceRequirementsWithCow, setMeta } from '$lib/indexeddb';
import { syncRequirements } from '$lib/requirementsSync';

vi.mock('$lib/indexeddb', () => ({
    getMeta: vi.fn(),
    replaceRequirementsWithCow: vi.fn(),
    setMeta: vi.fn(),
}));

const mockGetMeta = vi.mocked(getMeta);
const mockReplace = vi.mocked(replaceRequirementsWithCow);
const mockSetMeta = vi.mocked(setMeta);

function stubNavigator(online: boolean): void {
    vi.stubGlobal('navigator', { onLine: online });
}

function stubFetch(impl: (input: RequestInfo) => Promise<Response>): void {
    vi.stubGlobal('fetch', vi.fn(impl));
}

function makeJsonResponse(data: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(data), init);
}

describe('requirements sync lib', () => {
    beforeEach(() => {
        mockGetMeta.mockReset();
        mockReplace.mockReset();
        mockSetMeta.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns offline when navigator is offline', async () => {
        stubNavigator(false);
        stubFetch(() => Promise.resolve(new Response('', { status: 200 })));

        const result = await syncRequirements({
            catalogId: '2025_200',
            facultyId: '00002010',
            programId: 'SC00001403_CG00001322',
        });

        expect(result.status).toBe('offline');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('stores requirements with copy-on-write', async () => {
        stubNavigator(true);
        stubFetch(() =>
            Promise.resolve(
                makeJsonResponse({ name: 'Program A' }, { status: 200 })
            )
        );
        mockGetMeta.mockResolvedValue({
            key: 'requirementsActiveProgramId',
            value: 'OLD_PROGRAM',
        });

        const result = await syncRequirements({
            catalogId: '2025_200',
            facultyId: '00002010',
            programId: 'SC00001403_CG00001322',
        });

        expect(result.status).toBe('updated');
        expect(mockReplace).toHaveBeenCalledWith(
            {
                catalogId: '2025_200',
                facultyId: '00002010',
                programId: 'SC00001403_CG00001322',
                data: { name: 'Program A' },
            },
            'OLD_PROGRAM'
        );
        expect(mockSetMeta).toHaveBeenCalledWith(
            expect.objectContaining({ key: 'requirementsLastSync' })
        );
    });
});
