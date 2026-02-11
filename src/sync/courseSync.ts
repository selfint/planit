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

const isOnline = (): boolean => {
    return 'onLine' in navigator ? navigator.onLine : true;
};

const fetchCourseData = async (): Promise<Response> => {
    const [etagEntry, lastModifiedEntry] = await Promise.all([
        getMeta(COURSE_META_KEYS.etag),
        getMeta(COURSE_META_KEYS.lastModified),
    ]);

    const headers = new Headers();
    if (etagEntry?.value !== undefined) {
        headers.set('If-None-Match', String(etagEntry.value));
    }
    if (lastModifiedEntry?.value !== undefined) {
        headers.set('If-Modified-Since', String(lastModifiedEntry.value));
    }

    return fetch(COURSE_DATA_URL, { headers });
};

export const syncCourseData = async (): Promise<CourseSyncResult> => {
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
            `Failed to fetch course data: ${response.status} ${response.statusText}`
        );
    }

    const data = (await response.json()) as Record<string, CourseRecord>;
    const courses = Object.values(data);

    await putCourses(courses);

    const etag = response.headers.get('etag');
    const lastModified = response.headers.get('last-modified');
    await Promise.all([
        etag ? setMetaValue(COURSE_META_KEYS.etag, etag) : Promise.resolve(),
        lastModified
            ? setMetaValue(COURSE_META_KEYS.lastModified, lastModified)
            : Promise.resolve(),
        setMetaValue(COURSE_META_KEYS.lastSync, new Date().toISOString()),
        setMetaValue(COURSE_META_KEYS.count, courses.length),
    ]);

    return { status: 'updated', count: courses.length };
};

export const initCourseSync = (): void => {
    const runSync = async (): Promise<void> => {
        try {
            await syncCourseData();
        } catch (error) {
            console.error('Course sync failed', error);
        }
    };

    window.addEventListener('online', () => {
        void runSync();
    });

    if (isOnline()) {
        void runSync();
    }
};
