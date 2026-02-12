export const DB_NAME = 'db';
export const DB_VERSION = 1;

export const STORE_COURSES = 'courses';
export const STORE_META = 'meta';

export type MetaEntry = {
    key: string;
    value: unknown;
};

export type CourseRecord = {
    code: string;
    median?: number;
    about?: string;
    points?: number;
    name?: string;
    connections?: {
        dependencies?: string[][];
        adjacent?: string[];
        exclusive?: string[];
    };
    seasons?: string[];
    faculty?: string;
    current?: boolean;
    tests?: ({
        year: number;
        monthIndex: number;
        day: number;
    } | null)[];
};

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (): void => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_COURSES)) {
                db.createObjectStore(STORE_COURSES, { keyPath: 'code' });
            }
            if (!db.objectStoreNames.contains(STORE_META)) {
                db.createObjectStore(STORE_META, { keyPath: 'key' });
            }
        };

        request.onsuccess = (): void => {
            resolve(request.result);
        };

        request.onerror = (): void => {
            reject(request.error ?? new Error('Failed to open IndexedDB'));
        };
    });
}

async function withStore<T>(
    storeName: string,
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => IDBRequest<T> | null
): Promise<T | undefined> {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = fn(store);

        if (request !== null) {
            request.onsuccess = (): void => {
                resolve(request.result);
            };
            request.onerror = (): void => {
                reject(request.error ?? new Error('IndexedDB request failed'));
            };
        }

        tx.oncomplete = (): void => {
            db.close();
            if (request === null) {
                resolve(undefined);
            }
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('IndexedDB transaction failed'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('IndexedDB transaction aborted'));
        };
    });
}

export async function getMeta(key: string): Promise<MetaEntry | undefined> {
    const entry = await withStore<MetaEntry>(STORE_META, 'readonly', (store) =>
        store.get(key)
    );
    return entry;
}

export async function setMeta(entry: MetaEntry): Promise<void> {
    await withStore(STORE_META, 'readwrite', (store) => {
        store.put(entry);
        return null;
    });
}

export async function putCourses(courses: CourseRecord[]): Promise<void> {
    const db = await openDb();

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_COURSES, 'readwrite');
        const store = tx.objectStore(STORE_COURSES);

        for (const course of courses) {
            store.put(course);
        }

        tx.oncomplete = (): void => {
            db.close();
            resolve();
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('Failed to save courses'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('Course transaction aborted'));
        };
    });
}

export async function getCourse(
    code: string
): Promise<CourseRecord | undefined> {
    const course = await withStore<CourseRecord>(
        STORE_COURSES,
        'readonly',
        (store) => store.get(code)
    );
    return course;
}

export async function getCourses(limit: number): Promise<CourseRecord[]> {
    return getCoursesPage(limit, 0);
}

export async function getAllCourses(): Promise<CourseRecord[]> {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const results: CourseRecord[] = [];
        const tx = db.transaction(STORE_COURSES, 'readonly');
        const store = tx.objectStore(STORE_COURSES);
        const request = store.openCursor();

        request.onsuccess = (): void => {
            const cursor = request.result;
            if (cursor === null) {
                return;
            }
            results.push(cursor.value as CourseRecord);
            cursor.continue();
        };

        request.onerror = (): void => {
            reject(request.error ?? new Error('Failed to read courses'));
        };

        tx.oncomplete = (): void => {
            db.close();
            resolve(results);
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('Course transaction failed'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('Course transaction aborted'));
        };
    });
}

export async function getCoursesPage(
    limit: number,
    offset: number
): Promise<CourseRecord[]> {
    if (limit <= 0 || offset < 0) {
        return [];
    }

    const db = await openDb();

    return new Promise((resolve, reject) => {
        const results: CourseRecord[] = [];
        let skipped = false;
        const tx = db.transaction(STORE_COURSES, 'readonly');
        const store = tx.objectStore(STORE_COURSES);
        const request = store.openCursor();

        request.onsuccess = (): void => {
            const cursor = request.result;
            if (cursor === null || results.length >= limit) {
                return;
            }

            if (!skipped && offset > 0) {
                skipped = true;
                cursor.advance(offset);
                return;
            }

            results.push(cursor.value as CourseRecord);
            cursor.continue();
        };

        request.onerror = (): void => {
            reject(request.error ?? new Error('Failed to read courses'));
        };

        tx.oncomplete = (): void => {
            db.close();
            resolve(results);
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('Course transaction failed'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('Course transaction aborted'));
        };
    });
}
