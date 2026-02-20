import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getMeta, putCatalogs, setMeta } from '$lib/indexeddb';
import { syncCatalogs } from '$lib/catalogSync';

vi.mock('$lib/indexeddb', () => ({
    getMeta: vi.fn(),
    setMeta: vi.fn(),
    putCatalogs: vi.fn(),
}));

const mockGetMeta = vi.mocked(getMeta);
const mockSetMeta = vi.mocked(setMeta);
const mockPutCatalogs = vi.mocked(putCatalogs);
const generatedTimestamp = 1739894400000;
const generatedAtIso = new Date(generatedTimestamp).toISOString();

function stubNavigator(online: boolean): void {
    vi.stubGlobal('navigator', { onLine: online });
}

function stubFetch(impl: (input: RequestInfo) => Promise<Response>): void {
    vi.stubGlobal('fetch', vi.fn(impl));
}

function makeJsonResponse(data: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(data), init);
}

describe('catalog sync lib', () => {
    beforeEach(() => {
        mockGetMeta.mockReset();
        mockSetMeta.mockReset();
        mockPutCatalogs.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns offline when navigator is offline', async () => {
        stubNavigator(false);
        stubFetch(() => Promise.resolve(new Response('', { status: 200 })));

        const result = await syncCatalogs();

        expect(result.status).toBe('offline');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('skips when remote data is unchanged', async () => {
        stubNavigator(true);
        stubFetch(() => Promise.resolve(new Response(null, { status: 304 })));

        mockGetMeta.mockImplementation((key) => {
            if (key === 'catalogsDataEtag') {
                return Promise.resolve({ key, value: 'etag' });
            }
            if (key === 'catalogsDataLastModified') {
                return Promise.resolve({ key, value: 'last-modified' });
            }
            return Promise.resolve(undefined);
        });

        const result = await syncCatalogs();

        expect(result.status).toBe('skipped');
        expect(mockPutCatalogs).not.toHaveBeenCalled();
        expect(mockSetMeta).not.toHaveBeenCalled();
    });

    it('updates catalogs when remote data changes', async () => {
        stubNavigator(true);
        let callIndex = 0;
        stubFetch(() => {
            callIndex += 1;
            if (callIndex === 1) {
                return Promise.resolve(
                    makeJsonResponse(
                        {
                            '2025_200': {
                                en: '2025 Summer',
                                he: '2025 קיץ',
                            },
                            '2025_201': {
                                en: '2025 Winter',
                                he: '2025 חורף',
                            },
                        },
                        {
                            status: 200,
                            headers: {
                                etag: 'etag-1',
                                'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT',
                            },
                        }
                    )
                );
            }
            return Promise.resolve(
                makeJsonResponse({ timestamp: generatedTimestamp }, { status: 200 })
            );
        });

        mockGetMeta.mockResolvedValue(undefined);

        const result = await syncCatalogs();

        expect(result.status).toBe('updated');
        expect(result.count).toBe(2);
        expect(mockPutCatalogs).toHaveBeenCalledWith({
            '2025_200': { en: '2025 Summer', he: '2025 קיץ' },
            '2025_201': { en: '2025 Winter', he: '2025 חורף' },
        });
        expect(mockSetMeta).toHaveBeenCalledWith({
            key: 'catalogsDataCount',
            value: 2,
        });
        expect(mockSetMeta).toHaveBeenCalledWith({
            key: 'catalogsDataGeneratedAt',
            value: generatedAtIso,
        });
    });
});
