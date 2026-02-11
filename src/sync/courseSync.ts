import { getMeta, putCourses, setMeta } from '../db/indexeddb';
import type { CourseRecord } from '../db/indexeddb';

const COURSE_DATA_URL =
    'https://raw.githubusercontent.com/selfint/degree-planner/main/static/courseData.json';

const COURSE_META_KEYS = {
    etag: 'courseDataEtag',
    lastModified: 'courseDataLastModified',
    lastSync: 'courseDataLastSync',
    count: 'courseDataCount',
};

export type CourseSyncResult = {
    status: 'updated' | 'skipped' | 'offline';
    count?: number;
};

export type CourseSyncOptions = {
    onSync?: (result: CourseSyncResult) => void;
    onError?: (error: unknown) => void;
};

function isOnline(): boolean {
    return 'onLine' in navigator ? navigator.onLine : true;
}

async function fetchCourseData(): Promise<Response> {
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

export async function syncCourseData(): Promise<CourseSyncResult> {
    if (!isOnline()) {
        return { status: 'offline' };
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

    const data = (await response.json()) as Record<string, CourseRecord>;
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
    ]);

    return { status: 'updated', count: courses.length };
}

export function initCourseSync(options?: CourseSyncOptions): void {
    async function runSync(): Promise<void> {
        try {
            const result = await syncCourseData();
            options?.onSync?.(result);
        } catch (error) {
            console.error('Course sync failed', error);
            options?.onError?.(error);
        }
    }

    function handleOnline(): void {
        void runSync();
    }

    window.addEventListener('online', handleOnline);

    if (isOnline()) {
        void runSync();
    }
}
