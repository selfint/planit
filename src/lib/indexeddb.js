export const DB_NAME = 'db';
export const DB_VERSION = 3;

export const STORE_COURSES = 'courses';
export const STORE_META = 'meta';
export const STORE_CATALOGS = 'catalogs';
export const STORE_REQUIREMENTS = 'requirements';

/**
 * @typedef {{
 *   key: string,
 *   value: unknown
 * }} MetaEntry
 */

/**
 * @typedef {{
 *   code: string,
 *   median?: number,
 *   about?: string,
 *   points?: number,
 *   name?: string,
 *   connections?: {
 *     dependencies?: string[][],
 *     adjacent?: string[],
 *     exclusive?: string[]
 *   },
 *   seasons?: string[],
 *   faculty?: string,
 *   current?: boolean,
 *   tests?: ({
 *     year: number,
 *     monthIndex: number,
 *     day: number
 *   } | null)[]
 * }} CourseRecord
 */

/**
 * @typedef {{
 *   id: string,
 *   data: unknown
 * }} CatalogRecord
 */

/**
 * @typedef {{
 *   programId: string,
 *   catalogId: string,
 *   facultyId: string,
 *   path?: string,
 *   data: unknown
 * }} RequirementRecord
 */

/** @typedef {'code' | 'name' | 'points' | 'median'} CourseSortKey */
/** @typedef {'asc' | 'desc'} CourseSortDirection */
/** @typedef {Omit<IDBCursorWithValue, 'value'> & { value: CourseRecord }} CourseCursor */

/**
 * @returns {Promise<IDBDatabase>}
 */
function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
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

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error ?? new Error('Failed to open IndexedDB'));
        };
    });
}

/**
 * @template T
 * @param {string} storeName
 * @param {IDBTransactionMode} mode
 * @param {(store: IDBObjectStore) => IDBRequest<T> | null} fn
 * @returns {Promise<T | undefined>}
 */
async function withStore(storeName, mode, fn) {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = fn(store);

        if (request !== null) {
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error ?? new Error('IndexedDB request failed'));
            };
        }

        tx.oncomplete = () => {
            db.close();
            if (request === null) {
                resolve(undefined);
            }
        };
        tx.onerror = () => {
            reject(tx.error ?? new Error('IndexedDB transaction failed'));
        };
        tx.onabort = () => {
            reject(tx.error ?? new Error('IndexedDB transaction aborted'));
        };
    });
}

/**
 * @param {string[]} storeNames
 * @param {IDBTransactionMode} mode
 * @param {(stores: Record<string, IDBObjectStore>) => void} fn
 * @returns {Promise<void>}
 */
async function withStores(storeNames, mode, fn) {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeNames, mode);
        /** @type {Record<string, IDBObjectStore>} */
        const stores = {};
        for (const name of storeNames) {
            stores[name] = tx.objectStore(name);
        }
        fn(stores);

        tx.oncomplete = () => {
            db.close();
            resolve(undefined);
        };
        tx.onerror = () => {
            reject(tx.error ?? new Error('IndexedDB transaction failed'));
        };
        tx.onabort = () => {
            reject(tx.error ?? new Error('IndexedDB transaction aborted'));
        };
    });
}

/**
 * @param {string} key
 * @returns {Promise<MetaEntry | undefined>}
 */
export async function getMeta(key) {
    const entry = await withStore(
        STORE_META,
        'readonly',
        (store) => /** @type {IDBRequest<MetaEntry>} */ (store.get(key))
    );
    return entry;
}

/**
 * @param {MetaEntry} entry
 * @returns {Promise<void>}
 */
export async function setMeta(entry) {
    await withStore(STORE_META, 'readwrite', (store) => {
        store.put(entry);
        return null;
    });
}

/**
 * @param {CourseRecord[]} courses
 * @returns {Promise<void>}
 */
export async function putCourses(courses) {
    const db = await openDb();

    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_COURSES, 'readwrite');
        const store = tx.objectStore(STORE_COURSES);

        for (const course of courses) {
            store.put(course);
        }

        tx.oncomplete = () => {
            db.close();
            resolve(undefined);
        };
        tx.onerror = () => {
            reject(tx.error ?? new Error('Failed to save courses'));
        };
        tx.onabort = () => {
            reject(tx.error ?? new Error('Course transaction aborted'));
        };
    });
}

/**
 * @param {Record<string, unknown>} catalogs
 * @returns {Promise<void>}
 */
export async function putCatalogs(catalogs) {
    const db = await openDb();

    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_CATALOGS, 'readwrite');
        const store = tx.objectStore(STORE_CATALOGS);

        for (const [id, data] of Object.entries(catalogs)) {
            store.put(/** @type {CatalogRecord} */ ({ id, data }));
        }

        tx.oncomplete = () => {
            db.close();
            resolve(undefined);
        };
        tx.onerror = () => {
            reject(tx.error ?? new Error('Failed to save catalogs'));
        };
        tx.onabort = () => {
            reject(tx.error ?? new Error('Catalog transaction aborted'));
        };
    });
}

/**
 * @returns {Promise<Record<string, unknown>>}
 */
export async function getCatalogs() {
    const db = await openDb();

    return new Promise((resolve, reject) => {
        /** @type {Record<string, unknown>} */
        const results = {};
        const tx = db.transaction(STORE_CATALOGS, 'readonly');
        const store = tx.objectStore(STORE_CATALOGS);
        /** @type {IDBRequest<IDBCursorWithValue | null>} */
        const request = store.openCursor();

        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor === null) {
                return;
            }

            const value = /** @type {CatalogRecord} */ (cursor.value);
            results[value.id] = value.data;
            cursor.continue();
        };

        request.onerror = () => {
            reject(request.error ?? new Error('Failed to read catalogs'));
        };

        tx.oncomplete = () => {
            db.close();
            resolve(results);
        };
        tx.onerror = () => {
            reject(tx.error ?? new Error('Catalog transaction failed'));
        };
        tx.onabort = () => {
            reject(tx.error ?? new Error('Catalog transaction aborted'));
        };
    });
}

/**
 * @param {string} programId
 * @returns {Promise<RequirementRecord | undefined>}
 */
export async function getRequirement(programId) {
    const requirement = await withStore(
        STORE_REQUIREMENTS,
        'readonly',
        (store) =>
            /** @type {IDBRequest<RequirementRecord>} */ (store.get(programId))
    );
    return requirement;
}

/**
 * @param {RequirementRecord} record
 * @param {string | undefined} previousProgramId
 * @returns {Promise<void>}
 */
export async function replaceRequirementsWithCow(record, previousProgramId) {
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

/**
 * @param {string} code
 * @returns {Promise<CourseRecord | undefined>}
 */
export async function getCourse(code) {
    const course = await withStore(
        STORE_COURSES,
        'readonly',
        (store) => /** @type {IDBRequest<CourseRecord>} */ (store.get(code))
    );
    return course;
}

/**
 * @param {number} limit
 * @returns {Promise<CourseRecord[]>}
 */
export async function getCourses(limit) {
    return getCoursesPage(limit, 0);
}

/**
 * @param {number} limit
 * @param {number} offset
 * @param {CourseSortKey} sortKey
 * @param {CourseSortDirection} sortDirection
 * @returns {Promise<CourseRecord[]>}
 */
export async function getCoursesPageSorted(
    limit,
    offset,
    sortKey,
    sortDirection
) {
    if (limit <= 0 || offset < 0) {
        return [];
    }

    const db = await openDb();

    return new Promise((resolve, reject) => {
        /** @type {CourseRecord[]} */
        const results = [];
        const tx = db.transaction(STORE_COURSES, 'readonly');
        const store = tx.objectStore(STORE_COURSES);
        const source = getCourseSortSource(store, sortKey);
        const direction = getCursorDirection(sortDirection);
        let definedCount = 0;
        let requestedMissingPass = false;

        const countRequest = source.count();
        countRequest.onsuccess = () => {
            definedCount = countRequest.result;
            runDefinedPass();
        };
        countRequest.onerror = () => {
            reject(countRequest.error ?? new Error('Failed to count courses'));
        };

        function runDefinedPass() {
            /** @type {IDBRequest<IDBCursorWithValue | null>} */
            const request = source.openCursor(null, direction);
            let skipped = false;

            request.onsuccess = () => {
                const cursor = /** @type {CourseCursor | null} */ (
                    request.result
                );
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

                const value = cursor.value;
                if (isMissingSortValue(value, sortKey)) {
                    cursor.continue();
                    return;
                }

                results.push(value);
                cursor.continue();
            };

            request.onerror = () => {
                reject(request.error ?? new Error('Failed to read courses'));
            };
        }

        function runMissingPass() {
            const missingNeeded = limit - results.length;
            if (missingNeeded <= 0) {
                return;
            }

            const missingSkip = Math.max(0, offset - definedCount);
            /** @type {IDBRequest<IDBCursorWithValue | null>} */
            const request = store.openCursor();
            let skipped = false;

            request.onsuccess = () => {
                const cursor = /** @type {CourseCursor | null} */ (
                    request.result
                );
                if (cursor === null || results.length >= limit) {
                    return;
                }

                const value = cursor.value;
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

            request.onerror = () => {
                reject(request.error ?? new Error('Failed to read courses'));
            };
        }

        tx.oncomplete = () => {
            db.close();
            resolve(results);
        };
        tx.onerror = () => {
            reject(tx.error ?? new Error('Course transaction failed'));
        };
        tx.onabort = () => {
            reject(tx.error ?? new Error('Course transaction aborted'));
        };
    });
}

/**
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<CourseRecord[]>}
 */
export async function getCoursesPage(limit, offset) {
    if (limit <= 0 || offset < 0) {
        return [];
    }

    const db = await openDb();

    return new Promise((resolve, reject) => {
        /** @type {CourseRecord[]} */
        const results = [];
        let skipped = false;
        const tx = db.transaction(STORE_COURSES, 'readonly');
        const store = tx.objectStore(STORE_COURSES);
        /** @type {IDBRequest<IDBCursorWithValue | null>} */
        const request = store.openCursor();

        request.onsuccess = () => {
            const cursor = /** @type {CourseCursor | null} */ (request.result);
            if (cursor === null || results.length >= limit) {
                return;
            }

            if (!skipped && offset > 0) {
                skipped = true;
                cursor.advance(offset);
                return;
            }

            results.push(cursor.value);
            cursor.continue();
        };

        request.onerror = () => {
            reject(request.error ?? new Error('Failed to read courses'));
        };

        tx.oncomplete = () => {
            db.close();
            resolve(results);
        };
        tx.onerror = () => {
            reject(tx.error ?? new Error('Course transaction failed'));
        };
        tx.onabort = () => {
            reject(tx.error ?? new Error('Course transaction aborted'));
        };
    });
}

/**
 * @param {IDBObjectStore} store
 * @param {CourseSortKey} sortKey
 * @returns {IDBObjectStore | IDBIndex}
 */
function getCourseSortSource(store, sortKey) {
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

/**
 * @param {CourseSortDirection} sortDirection
 * @returns {IDBCursorDirection}
 */
function getCursorDirection(sortDirection) {
    return sortDirection === 'desc' ? 'prev' : 'next';
}

/**
 * @param {CourseRecord} course
 * @param {CourseSortKey} sortKey
 * @returns {boolean}
 */
function isMissingSortValue(course, sortKey) {
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
