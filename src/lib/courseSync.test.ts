import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getMeta, putCourses, setMeta } from '$lib/indexeddb';
import { syncCourseData } from '$lib/courseSync';

vi.mock('$lib/indexeddb', () => ({
    getMeta: vi.fn(),
    setMeta: vi.fn(),
    putCourses: vi.fn(),
}));

const mockGetMeta = vi.mocked(getMeta);
const mockSetMeta = vi.mocked(setMeta);
const mockPutCourses = vi.mocked(putCourses);
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

describe('course sync lib', () => {
    beforeEach(() => {
        mockGetMeta.mockReset();
        mockSetMeta.mockReset();
        mockPutCourses.mockReset();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns offline when navigator is offline', async () => {
        stubNavigator(false);
        stubFetch(() => Promise.resolve(new Response('', { status: 200 })));

        const result = await syncCourseData();

        expect(result.status).toBe('offline');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('skips when remote data is unchanged', async () => {
        stubNavigator(true);
        stubFetch(() => Promise.resolve(new Response(null, { status: 304 })));

        mockGetMeta.mockImplementation((key) => {
            if (key === 'courseDataEtag') {
                return Promise.resolve({ key, value: 'etag' });
            }
            if (key === 'courseDataLastModified') {
                return Promise.resolve({ key, value: 'last-modified' });
            }
            return Promise.resolve(undefined);
        });

        const result = await syncCourseData();

        expect(result.status).toBe('skipped');
        expect(mockPutCourses).not.toHaveBeenCalled();
        expect(mockSetMeta).not.toHaveBeenCalled();
    });

    it('updates courses when remote data changes', async () => {
        stubNavigator(true);
        let callIndex = 0;
        stubFetch(() => {
            callIndex += 1;
            if (callIndex === 1) {
                return Promise.resolve(
                    makeJsonResponse(
                        {
                            CS101: { code: 'CS101', name: 'Intro' },
                            CS102: {
                                code: 'CS102',
                                name: 'Data Structures',
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

        const result = await syncCourseData();

        expect(result.status).toBe('updated');
        expect(result.count).toBe(2);
        expect(mockPutCourses).toHaveBeenCalledWith([
            { code: 'CS101', name: 'Intro' },
            { code: 'CS102', name: 'Data Structures' },
        ]);
        expect(mockSetMeta).toHaveBeenCalledWith({
            key: 'courseDataCount',
            value: 2,
        });
        expect(mockSetMeta).toHaveBeenCalledWith({
            key: 'courseDataGeneratedAt',
            value: generatedAtIso,
        });
    });
});
