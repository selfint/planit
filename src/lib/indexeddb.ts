export const DB_NAME = 'db';
export const DB_VERSION = 3;

export const STORE_COURSES = 'courses';
export const STORE_META = 'meta';
export const STORE_CATALOGS = 'catalogs';
export const STORE_REQUIREMENTS = 'requirements';

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

export type CatalogRecord = {
    id: string;
    data: unknown;
};

export type RequirementRecord = {
    programId: string;
    catalogId: string;
    facultyId: string;
    path?: string;
    data: unknown;
};

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (): void => {
            const db = request.result;
            const tx = request.transaction;
            if (tx === null) {
                throw new Error('IndexedDB upgrade transaction missing');
            }
            const courseStore = db.objectStoreNames.contains(STORE_COURSES)
                ? tx.objectStore(STORE_COURSES)
                : db.createObjectStore(STORE_COURSES, { keyPath: 'code' });
            if (!db.objectStoreNames.contains(STORE_META)) {
                db.createObjectStore(STORE_META, { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains(STORE_CATALOGS)) {
                db.createObjectStore(STORE_CATALOGS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_REQUIREMENTS)) {
                db.createObjectStore(STORE_REQUIREMENTS, {
                    keyPath: 'programId',
                });
            }

            if (!courseStore.indexNames.contains('name')) {
                courseStore.createIndex('name', 'name');
            }
            if (!courseStore.indexNames.contains('points')) {
                courseStore.createIndex('points', 'points');
            }
            if (!courseStore.indexNames.contains('median')) {
                courseStore.createIndex('median', 'median');
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

async function withStores(
    storeNames: string[],
    mode: IDBTransactionMode,
    fn: (stores: Record<string, IDBObjectStore>) => void
): Promise<void> {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeNames, mode);
        const stores: Record<string, IDBObjectStore> = {};
        for (const name of storeNames) {
            stores[name] = tx.objectStore(name);
        }
        fn(stores);

        tx.oncomplete = (): void => {
            db.close();
            resolve();
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

export async function putCatalogs(
    catalogs: Record<string, unknown>
): Promise<void> {
    const db = await openDb();

    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_CATALOGS, 'readwrite');
        const store = tx.objectStore(STORE_CATALOGS);

        for (const [id, data] of Object.entries(catalogs)) {
            store.put({ id, data } satisfies CatalogRecord);
        }

        tx.oncomplete = (): void => {
            db.close();
            resolve();
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('Failed to save catalogs'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('Catalog transaction aborted'));
        };
    });
}

export async function getCatalogs(): Promise<Record<string, unknown>> {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const results: Record<string, unknown> = {};
        const tx = db.transaction(STORE_CATALOGS, 'readonly');
        const store = tx.objectStore(STORE_CATALOGS);
        const request = store.openCursor();

        request.onsuccess = (): void => {
            const cursor = request.result;
            if (cursor === null) {
                return;
            }

            const value = cursor.value as CatalogRecord;
            results[value.id] = value.data;
            cursor.continue();
        };

        request.onerror = (): void => {
            reject(request.error ?? new Error('Failed to read catalogs'));
        };

        tx.oncomplete = (): void => {
            db.close();
            resolve(results);
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('Catalog transaction failed'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('Catalog transaction aborted'));
        };
    });
}

export async function getRequirement(
    programId: string
): Promise<RequirementRecord | undefined> {
    const requirement = await withStore<RequirementRecord>(
        STORE_REQUIREMENTS,
        'readonly',
        (store) => store.get(programId)
    );
    return requirement;
}

export async function replaceRequirementsWithCow(
    record: RequirementRecord,
    previousProgramId?: string
): Promise<void> {
    await withStores(
        [STORE_REQUIREMENTS, STORE_META],
        'readwrite',
        (stores) => {
            stores[STORE_REQUIREMENTS].put(record);
            if (
                previousProgramId !== undefined &&
                previousProgramId.length > 0 &&
                previousProgramId !== record.programId
            ) {
                stores[STORE_REQUIREMENTS].delete(previousProgramId);
            }
            stores[STORE_META].put({
                key: 'requirementsActiveCatalogId',
                value: record.catalogId,
            });
            stores[STORE_META].put({
                key: 'requirementsActiveFacultyId',
                value: record.facultyId,
            });
            stores[STORE_META].put({
                key: 'requirementsActiveProgramId',
                value: record.programId,
            });
            stores[STORE_META].put({
                key: 'requirementsActivePath',
                value: record.path ?? '',
            });
        }
    );
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

export async function getCoursesPageSorted(
    limit: number,
    offset: number,
    sortKey: 'code' | 'name' | 'points' | 'median',
    sortDirection: 'asc' | 'desc'
): Promise<CourseRecord[]> {
    if (limit <= 0 || offset < 0) {
        return [];
    }

    const db = await openDb();

    return new Promise((resolve, reject) => {
        const results: CourseRecord[] = [];
        const tx = db.transaction(STORE_COURSES, 'readonly');
        const store = tx.objectStore(STORE_COURSES);
        const source = getCourseSortSource(store, sortKey);
        const direction = getCursorDirection(sortDirection);
        let definedCount = 0;
        let requestedMissingPass = false;

        const countRequest = source.count();
        countRequest.onsuccess = (): void => {
            definedCount = countRequest.result;
            runDefinedPass();
        };
        countRequest.onerror = (): void => {
            reject(countRequest.error ?? new Error('Failed to count courses'));
        };

        function runDefinedPass(): void {
            const request = source.openCursor(null, direction);
            let skipped = false;

            request.onsuccess = (): void => {
                const cursor = request.result;
                if (cursor === null || results.length >= limit) {
                    if (!requestedMissingPass) {
                        requestedMissingPass = true;
                        runMissingPass();
                    }
                    return;
                }

                if (!skipped && offset > 0) {
                    skipped = true;
                    cursor.advance(offset);
                    return;
                }

                const value = cursor.value as CourseRecord;
                if (isMissingSortValue(value, sortKey)) {
                    cursor.continue();
                    return;
                }

                results.push(value);
                cursor.continue();
            };

            request.onerror = (): void => {
                reject(request.error ?? new Error('Failed to read courses'));
            };
        }

        function runMissingPass(): void {
            const missingNeeded = limit - results.length;
            if (missingNeeded <= 0) {
                return;
            }

            const missingSkip = Math.max(0, offset - definedCount);
            const request = store.openCursor();
            let skipped = false;

            request.onsuccess = (): void => {
                const cursor = request.result;
                if (cursor === null || results.length >= limit) {
                    return;
                }

                const value = cursor.value as CourseRecord;
                if (!isMissingSortValue(value, sortKey)) {
                    cursor.continue();
                    return;
                }

                if (!skipped && missingSkip > 0) {
                    skipped = true;
                    cursor.advance(missingSkip);
                    return;
                }

                results.push(value);
                cursor.continue();
            };

            request.onerror = (): void => {
                reject(request.error ?? new Error('Failed to read courses'));
            };
        }

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

export async function searchCourses(
    query: string,
    limit: number
): Promise<CourseRecord[]> {
    const normalizedQuery = normalizeSearchQuery(query);
    if (normalizedQuery.length === 0 || limit <= 0) {
        return [];
    }

    const queryTokens = normalizedQuery.split(' ');
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const prefixMatches: CourseRecord[] = [];
        const codeMatches: CourseRecord[] = [];
        const textMatches: CourseRecord[] = [];

        const tx = db.transaction(STORE_COURSES, 'readonly');
        const store = tx.objectStore(STORE_COURSES);
        const request = store.openCursor();

        request.onsuccess = (): void => {
            const cursor = request.result;
            if (cursor === null) {
                return;
            }

            const course = cursor.value as CourseRecord;
            const searchText = normalizeSearchQuery(
                `${course.code} ${course.name ?? ''}`
            );
            const hasAllTokens = queryTokens.every((token) =>
                searchText.includes(token)
            );

            if (hasAllTokens) {
                const normalizedCode = normalizeSearchQuery(course.code);
                const normalizedName = normalizeSearchQuery(course.name ?? '');

                if (normalizedCode.startsWith(normalizedQuery)) {
                    codeMatches.push(course);
                } else if (normalizedName.startsWith(normalizedQuery)) {
                    prefixMatches.push(course);
                } else {
                    textMatches.push(course);
                }
            }

            cursor.continue();
        };

        request.onerror = (): void => {
            reject(request.error ?? new Error('Failed to search courses'));
        };

        tx.oncomplete = (): void => {
            db.close();
            const mergedResults = [
                ...codeMatches,
                ...prefixMatches,
                ...textMatches,
            ];
            resolve(mergedResults.slice(0, limit));
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('Course search transaction failed'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('Course search transaction aborted'));
        };
    });
}

function normalizeSearchQuery(value: string): string {
    return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function getCourseSortSource(
    store: IDBObjectStore,
    sortKey: 'code' | 'name' | 'points' | 'median'
): IDBObjectStore | IDBIndex {
    switch (sortKey) {
        case 'code':
            return store;
        case 'name':
            return store.index('name');
        case 'points':
            return store.index('points');
        case 'median':
            return store.index('median');
    }
}

function getCursorDirection(sortDirection: 'asc' | 'desc'): IDBCursorDirection {
    return sortDirection === 'desc' ? 'prev' : 'next';
}

function isMissingSortValue(
    course: CourseRecord,
    sortKey: 'code' | 'name' | 'points' | 'median'
): boolean {
    switch (sortKey) {
        case 'code':
            return course.code.length === 0;
        case 'name':
            return course.name === undefined;
        case 'points':
            return (
                course.points === undefined || !Number.isFinite(course.points)
            );
        case 'median':
            return (
                course.median === undefined || !Number.isFinite(course.median)
            );
    }
}
