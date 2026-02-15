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

export type CourseQueryParams = {
    query?: string;
    availableOnly?: boolean;
    faculty?: string;
    pointsMin?: number;
    pointsMax?: number;
    medianMin?: number;
    requirementCourseCodes?: readonly string[];
    page?: number;
    pageSize?: number | 'all';
};

export type CourseQueryResult = {
    courses: CourseRecord[];
    total: number;
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
    if (limit <= 0) {
        return [];
    }

    const result = await queryCourses({
        query,
        page: 1,
        pageSize: limit,
    });

    return result.courses;
}

export async function getCourseFaculties(): Promise<string[]> {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const faculties = new Set<string>();

        const tx = db.transaction(STORE_COURSES, 'readonly');
        const store = tx.objectStore(STORE_COURSES);
        const request = store.openCursor();

        request.onsuccess = (): void => {
            const cursor = request.result;
            if (cursor === null) {
                return;
            }

            const course = cursor.value as CourseRecord;
            if (
                typeof course.faculty === 'string' &&
                course.faculty.trim().length > 0
            ) {
                faculties.add(course.faculty.trim());
            }

            cursor.continue();
        };

        request.onerror = (): void => {
            reject(
                request.error ?? new Error('Failed to read course faculties')
            );
        };

        tx.oncomplete = (): void => {
            db.close();
            resolve(
                Array.from(faculties).sort((left, right) =>
                    left.localeCompare(right)
                )
            );
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('Course faculty transaction failed'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('Course faculty transaction aborted'));
        };
    });
}

export async function getCoursesCount(): Promise<number> {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        let count = 0;
        const tx = db.transaction(STORE_COURSES, 'readonly');
        const store = tx.objectStore(STORE_COURSES);
        const request = store.openCursor();

        request.onsuccess = (): void => {
            const cursor = request.result;
            if (cursor === null) {
                return;
            }

            count += 1;
            cursor.continue();
        };

        request.onerror = (): void => {
            reject(request.error ?? new Error('Failed to count courses'));
        };

        tx.oncomplete = (): void => {
            db.close();
            resolve(count);
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('Course count transaction failed'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('Course count transaction aborted'));
        };
    });
}

export async function queryCourses(
    params: CourseQueryParams
): Promise<CourseQueryResult> {
    const normalizedQuery = normalizeSearchQuery(params.query ?? '');
    const queryTokens =
        normalizedQuery.length === 0 ? [] : normalizedQuery.split(' ');
    const normalizedFaculty = normalizeFilterText(params.faculty);
    const pointsMin = normalizePositiveNumber(params.pointsMin);
    const pointsMax = normalizePositiveNumber(params.pointsMax);
    const medianMin = normalizePositiveNumber(params.medianMin);
    const requirementCodes = new Set(params.requirementCourseCodes ?? []);
    const shouldFilterRequirement = requirementCodes.size > 0;

    const pageSize = normalizePageSize(params.pageSize);
    const page = normalizePage(params.page);
    const offset = pageSize === 'all' ? 0 : (page - 1) * pageSize;

    const db = await openDb();

    return new Promise((resolve, reject) => {
        const plainMatches: CourseRecord[] = [];
        const codeMatches: CourseRecord[] = [];
        const namePrefixMatches: CourseRecord[] = [];
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
            if (
                !isCourseMatchingFilters(
                    course,
                    params.availableOnly === true,
                    normalizedFaculty,
                    pointsMin,
                    pointsMax,
                    medianMin,
                    requirementCodes,
                    shouldFilterRequirement
                )
            ) {
                cursor.continue();
                return;
            }

            if (queryTokens.length === 0) {
                plainMatches.push(course);
                cursor.continue();
                return;
            }

            const normalizedCode = normalizeSearchQuery(course.code);
            const normalizedName = normalizeSearchQuery(course.name ?? '');
            const searchText = normalizeSearchQuery(
                `${course.code} ${course.name ?? ''}`
            );
            const hasAllTokens = queryTokens.every((token) =>
                searchText.includes(token)
            );
            if (!hasAllTokens) {
                cursor.continue();
                return;
            }

            if (normalizedCode.startsWith(normalizedQuery)) {
                codeMatches.push(course);
            } else if (normalizedName.startsWith(normalizedQuery)) {
                namePrefixMatches.push(course);
            } else {
                textMatches.push(course);
            }

            cursor.continue();
        };

        request.onerror = (): void => {
            reject(request.error ?? new Error('Failed to query courses'));
        };

        tx.oncomplete = (): void => {
            db.close();
            const ranked =
                queryTokens.length === 0
                    ? plainMatches
                    : [...codeMatches, ...namePrefixMatches, ...textMatches];
            const total = ranked.length;

            if (pageSize === 'all') {
                resolve({ courses: ranked, total });
                return;
            }

            resolve({
                courses: ranked.slice(offset, offset + pageSize),
                total,
            });
        };
        tx.onerror = (): void => {
            reject(tx.error ?? new Error('Course query transaction failed'));
        };
        tx.onabort = (): void => {
            reject(tx.error ?? new Error('Course query transaction aborted'));
        };
    });
}

function normalizeSearchQuery(value: string): string {
    return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function normalizeFilterText(value: string | undefined): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim();
    if (normalized.length === 0) {
        return undefined;
    }
    return normalized;
}

function normalizePositiveNumber(
    value: number | undefined
): number | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return undefined;
    }

    return value;
}

function normalizePage(value: number | undefined): number {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
        return 1;
    }

    return value;
}

function normalizePageSize(value: number | 'all' | undefined): number | 'all' {
    if (value === 'all' || value === undefined) {
        return 'all';
    }

    if (!Number.isInteger(value) || value <= 0) {
        return 'all';
    }

    return value;
}

function isCourseMatchingFilters(
    course: CourseRecord,
    availableOnly: boolean,
    faculty: string | undefined,
    pointsMin: number | undefined,
    pointsMax: number | undefined,
    medianMin: number | undefined,
    requirementCodes: Set<string>,
    shouldFilterRequirement: boolean
): boolean {
    if (availableOnly && course.current !== true) {
        return false;
    }

    if (faculty !== undefined && course.faculty !== faculty) {
        return false;
    }

    if (pointsMin !== undefined) {
        const points = toFiniteNumber(course.points);
        if (points === undefined) {
            return false;
        }
        if (points < pointsMin) {
            return false;
        }
    }

    if (pointsMax !== undefined) {
        const points = toFiniteNumber(course.points);
        if (points === undefined) {
            return false;
        }
        if (points > pointsMax) {
            return false;
        }
    }

    if (medianMin !== undefined) {
        const median = toFiniteNumber(course.median);
        if (median === undefined) {
            return false;
        }
        if (median < medianMin) {
            return false;
        }
    }

    if (shouldFilterRequirement && !requirementCodes.has(course.code)) {
        return false;
    }

    return true;
}

function toFiniteNumber(value: unknown): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
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
