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

/** @param {boolean} online */
function stubNavigator(online) {
    vi.stubGlobal('navigator', { onLine: online });
}

/**
 * @param {(input: RequestInfo) => Promise<Response>} impl
 */
function stubFetch(impl) {
    vi.stubGlobal('fetch', vi.fn(impl));
}

/** @param {RequestInfo} input */
function getRequestUrl(input) {
    if (typeof input === 'string') {
        return input;
    }

    if (input instanceof URL) {
        return input.toString();
    }

    if (input instanceof Request) {
        return input.url;
    }

    return '';
}

/**
 * @param {unknown} data
 * @param {ResponseInit | undefined} init
 * @returns {Response}
 */
function makeJsonResponse(data, init) {
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
        const remoteDate = '2024-01-01T00:00:00Z';
        stubNavigator(true);
        stubFetch((input) => {
            if (getRequestUrl(input).includes('api.github.com')) {
                return Promise.resolve(
                    makeJsonResponse([
                        { commit: { committer: { date: remoteDate } } },
                    ])
                );
            }
            return Promise.resolve(makeJsonResponse({}, { status: 304 }));
        });

        mockGetMeta.mockImplementation((key) => {
            if (key === 'courseDataRemoteUpdatedAt') {
                return Promise.resolve({ key, value: remoteDate });
            }
            if (key === 'courseDataLastSync') {
                return Promise.resolve({ key, value: '2024-01-02T00:00:00Z' });
            }
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
        expect(mockSetMeta).toHaveBeenCalledWith({
            key: 'courseDataRemoteUpdatedAt',
            value: remoteDate,
        });
        expect(mockSetMeta).toHaveBeenCalledWith(
            expect.objectContaining({ key: 'courseDataLastChecked' })
        );
    });

    it('updates courses when remote data changes', async () => {
        const remoteDate = '2024-02-01T00:00:00Z';
        stubNavigator(true);
        stubFetch((input) => {
            if (getRequestUrl(input).includes('api.github.com')) {
                return Promise.resolve(
                    makeJsonResponse([
                        { commit: { committer: { date: remoteDate } } },
                    ])
                );
            }

            return Promise.resolve(
                makeJsonResponse(
                    {
                        CS101: { code: 'CS101', name: 'Intro' },
                        CS102: { code: 'CS102', name: 'Data Structures' },
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
    });
});
