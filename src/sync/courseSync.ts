import { getMeta, putCourses, setMetaValue } from '../db/indexeddb';
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
        await setMetaValue(COURSE_META_KEYS.lastSync, new Date().toISOString());
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
            ? setMetaValue(COURSE_META_KEYS.etag, etag)
            : Promise.resolve(),
        lastModified !== null && lastModified.length > 0
            ? setMetaValue(COURSE_META_KEYS.lastModified, lastModified)
            : Promise.resolve(),
        setMetaValue(COURSE_META_KEYS.lastSync, new Date().toISOString()),
        setMetaValue(COURSE_META_KEYS.count, courses.length),
    ]);

    return { status: 'updated', count: courses.length };
}

export function initCourseSync(): void {
    async function runSync(): Promise<void> {
        try {
            await syncCourseData();
        } catch (error) {
            console.error('Course sync failed', error);
        }
    }

    window.addEventListener('online', () => {
        void runSync();
    });

    if (isOnline()) {
        void runSync();
    }
}
