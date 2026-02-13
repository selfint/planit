import { getMeta, putCourses, setMeta } from '$lib/indexeddb';

/** @typedef {import('$lib/indexeddb').CourseRecord} CourseRecord */

const COURSE_DATA_URL =
    'https://raw.githubusercontent.com/selfint/degree-planner/main/static/courseData.json';

const COURSE_META_KEYS = {
    etag: 'courseDataEtag',
    lastModified: 'courseDataLastModified',
    lastSync: 'courseDataLastSync',
    count: 'courseDataCount',
    remoteUpdatedAt: 'courseDataRemoteUpdatedAt',
    lastChecked: 'courseDataLastChecked',
};

/**
 * @typedef {{
 *   status: 'updated' | 'skipped' | 'offline',
 *   count?: number
 * }} CourseSyncResult
 */

/**
 * @typedef {{
 *   onSync?: (result: CourseSyncResult) => void,
 *   onError?: (error: unknown) => void
 * }} CourseSyncOptions
 */

/**
 * @returns {boolean}
 */
function isOnline() {
    return 'onLine' in navigator ? navigator.onLine : true;
}

/**
 * @returns {Promise<Response>}
 */
async function fetchCourseData() {
    const [etagEntry, lastModifiedEntry] = await Promise.all([
        getMeta(COURSE_META_KEYS.etag),
        getMeta(COURSE_META_KEYS.lastModified),
    ]);

    const headers = new Headers();
    const etagValue =
        typeof etagEntry?.value === 'string' ? etagEntry.value : undefined;
    const lastModifiedValue =
        typeof lastModifiedEntry?.value === 'string'
            ? lastModifiedEntry.value
            : undefined;

    if (etagValue !== undefined && etagValue.length > 0) {
        headers.set('If-None-Match', etagValue);
    }
    if (lastModifiedValue !== undefined && lastModifiedValue.length > 0) {
        headers.set('If-Modified-Since', lastModifiedValue);
    }

    return fetch(COURSE_DATA_URL, { headers });
}

/**
 * @returns {Promise<string | undefined>}
 */
async function fetchRemoteUpdatedAt() {
    const response = await fetch(
        'https://api.github.com/repos/selfint/degree-planner/commits?path=static/courseData.json&per_page=1',
        {
            headers: {
                Accept: 'application/vnd.github+json',
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to fetch remote update metadata: ${String(
                response.status
            )} ${response.statusText}`
        );
    }

    const raw = /** @type {unknown} */ (await response.json());
    const data =
        /** @type {{ commit?: { committer?: { date?: string } } }[]} */ (raw);
    const date = data[0]?.commit?.committer?.date;
    if (typeof date === 'string' && date.length > 0) {
        return date;
    }

    return undefined;
}

/**
 * @param {string | undefined} remoteUpdatedAt
 * @returns {Promise<boolean>}
 */
async function shouldFetchCourseData(remoteUpdatedAt) {
    const [storedRemote, lastSync] = await Promise.all([
        getMeta(COURSE_META_KEYS.remoteUpdatedAt),
        getMeta(COURSE_META_KEYS.lastSync),
    ]);
    const storedRemoteValue =
        typeof storedRemote?.value === 'string'
            ? storedRemote.value
            : undefined;

    if (remoteUpdatedAt === undefined) {
        return true;
    }

    if (storedRemoteValue === undefined || storedRemoteValue.length === 0) {
        return true;
    }

    if (storedRemoteValue !== remoteUpdatedAt) {
        return true;
    }

    return lastSync?.value === undefined;
}

/**
 * @returns {Promise<CourseSyncResult>}
 */
export async function syncCourseData() {
    if (!isOnline()) {
        return { status: 'offline' };
    }

    /** @type {string | undefined} */
    let remoteUpdatedAt;
    try {
        remoteUpdatedAt = await fetchRemoteUpdatedAt();
    } catch (error) {
        console.error('Failed to fetch remote course metadata', error);
    }

    if (remoteUpdatedAt !== undefined) {
        await setMeta({
            key: COURSE_META_KEYS.remoteUpdatedAt,
            value: remoteUpdatedAt,
        });
        await setMeta({
            key: COURSE_META_KEYS.lastChecked,
            value: new Date().toISOString(),
        });
    }

    if (!(await shouldFetchCourseData(remoteUpdatedAt))) {
        return { status: 'skipped' };
    }

    const response = await fetchCourseData();
    if (response.status === 304) {
        await setMeta({
            key: COURSE_META_KEYS.lastSync,
            value: new Date().toISOString(),
        });
        return { status: 'skipped' };
    }

    if (!response.ok) {
        throw new Error(
            `Failed to fetch course data: ${String(response.status)} ${
                response.statusText
            }`
        );
    }

    const raw = /** @type {unknown} */ (await response.json());
    const data = /** @type {Record<string, CourseRecord>} */ (raw);
    const courses = Object.values(data);

    await putCourses(courses);

    const etag = response.headers.get('etag');
    const lastModified = response.headers.get('last-modified');
    await Promise.all([
        etag !== null && etag.length > 0
            ? setMeta({ key: COURSE_META_KEYS.etag, value: etag })
            : Promise.resolve(),
        lastModified !== null && lastModified.length > 0
            ? setMeta({
                  key: COURSE_META_KEYS.lastModified,
                  value: lastModified,
              })
            : Promise.resolve(),
        setMeta({
            key: COURSE_META_KEYS.lastSync,
            value: new Date().toISOString(),
        }),
        setMeta({ key: COURSE_META_KEYS.count, value: courses.length }),
        remoteUpdatedAt !== undefined
            ? setMeta({
                  key: COURSE_META_KEYS.remoteUpdatedAt,
                  value: remoteUpdatedAt,
              })
            : Promise.resolve(),
    ]);

    return { status: 'updated', count: courses.length };
}

/**
 * @param {CourseSyncOptions | undefined} options
 * @returns {void}
 */
export function initCourseSync(options) {
    async function runSync() {
        try {
            const result = await syncCourseData();
            options?.onSync?.(result);
        } catch (error) {
            console.error('Course sync failed', error);
            options?.onError?.(error);
        }
    }

    function handleOnline() {
        void runSync();
    }

    window.addEventListener('online', handleOnline);

    if (isOnline()) {
        void runSync();
    }
}
