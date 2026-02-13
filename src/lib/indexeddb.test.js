import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    getCatalogs,
    getCourse,
    getCoursesPage,
    getMeta,
    getRequirement,
    putCatalogs,
    putCourses,
    replaceRequirementsWithCow,
    setMeta,
} from '$lib/indexeddb';

/**
 * @typedef {{
 *   keyPath: string,
 *   data: Map<string, unknown>,
 *   indexNames: Set<string>
 * }} StoreConfig
 */

/** @typedef {Map<string, StoreConfig>} StoreMap */

/**
 * @template T
 * @typedef {(this: IDBRequest<T>, ev: Event) => unknown} RequestCallback
 */

/** @template T */
class FakeRequest {
    /** @type {T} */
    result = /** @type {T} */ (/** @type {unknown} */ (undefined));
    /** @type {Error | null} */
    error = null;
    /** @type {RequestCallback<T> | null} */
    onsuccess = null;
    /** @type {RequestCallback<T> | null} */
    onerror = null;
    /** @type {((this: IDBOpenDBRequest, ev: Event) => unknown) | null} */
    onupgradeneeded = null;
    /** @type {FakeTransaction | null} */
    transaction = null;
    /** @type {(() => void) | null} */
    afterSuccess = null;

    fireSuccess() {
        this.onsuccess?.call(
            /** @type {IDBRequest<T>} */ (/** @type {unknown} */ (this)),
            new Event('success')
        );
        this.afterSuccess?.();
    }
}

class FakeCursor {
    /** @type {unknown} */
    value;
    index = 0;
    /** @type {unknown[]} */
    values;
    /** @type {FakeRequest<IDBCursorWithValue | null>} */
    request;
    requested = false;

    /**
     * @param {unknown[]} values
     * @param {FakeRequest<IDBCursorWithValue | null>} request
     */
    constructor(values, request) {
        this.values = values;
        this.request = request;
        this.value = values[0];
    }

    /** @param {number} count */
    advance(count) {
        this.index += count;
        this.requested = true;
        this.updateRequest();
    }

    continue() {
        this.index += 1;
        this.requested = true;
        this.updateRequest();
    }

    updateRequest() {
        if (this.index >= this.values.length) {
            this.request.result = null;
            queueMicrotask(() => {
                this.request.fireSuccess();
            });
            return;
        }

        this.value = this.values[this.index];
        this.request.result = /** @type {IDBCursorWithValue} */ (
            /** @type {unknown} */ (this)
        );
        queueMicrotask(() => {
            this.request.fireSuccess();
        });
    }
}

class FakeObjectStore {
    /** @type {StoreConfig} */
    store;
    /** @type {FakeTransaction} */
    transaction;
    indexNames = {
        /** @param {string} name */
        contains: (name) => this.store.indexNames.has(name),
    };

    /**
     * @param {StoreConfig} store
     * @param {FakeTransaction} transaction
     */
    constructor(store, transaction) {
        this.store = store;
        this.transaction = transaction;
    }

    /** @param {string} key */
    get(key) {
        /** @type {FakeRequest<unknown>} */
        const request = new FakeRequest();
        request.result = this.store.data.get(key);
        this.transaction.trackRequest(request);
        queueMicrotask(() => {
            request.fireSuccess();
        });
        return /** @type {IDBRequest<unknown>} */ (
            /** @type {unknown} */ (request)
        );
    }

    /** @param {unknown} value */
    put(value) {
        if (typeof value !== 'object' || value === null) {
            return;
        }
        const record = /** @type {Record<string, unknown>} */ (value);
        const keyValue = record[this.store.keyPath];
        if (typeof keyValue === 'string' && keyValue.length > 0) {
            this.store.data.set(keyValue, value);
        }
    }

    /** @param {string} key */
    delete(key) {
        /** @type {FakeRequest<unknown>} */
        const request = new FakeRequest();
        this.store.data.delete(key);
        this.transaction.trackRequest(request);
        queueMicrotask(() => {
            request.fireSuccess();
        });
        return /** @type {IDBRequest<unknown>} */ (
            /** @type {unknown} */ (request)
        );
    }

    /** @param {string} name */
    createIndex(name) {
        this.store.indexNames.add(name);
    }

    /** @returns {IDBRequest<IDBCursorWithValue | null>} */
    openCursor() {
        /** @type {FakeRequest<IDBCursorWithValue | null>} */
        const request = new FakeRequest();
        const values = Array.from(this.store.data.values());
        if (values.length === 0) {
            request.result = null;
            this.transaction.trackRequest(request);
            queueMicrotask(() => {
                request.fireSuccess();
            });
            return /** @type {IDBRequest<IDBCursorWithValue | null>} */ (
                /** @type {unknown} */ (request)
            );
        }

        const cursor = new FakeCursor(values, request);
        request.result = /** @type {IDBCursorWithValue} */ (
            /** @type {unknown} */ (cursor)
        );
        this.transaction.trackCursorRequest(request, cursor);
        queueMicrotask(() => {
            request.fireSuccess();
        });
        return /** @type {IDBRequest<IDBCursorWithValue | null>} */ (
            /** @type {unknown} */ (request)
        );
    }
}

class FakeTransaction {
    /** @type {((this: IDBTransaction, ev: Event) => unknown) | null} */
    oncomplete = null;
    /** @type {((this: IDBTransaction, ev: Event) => unknown) | null} */
    onerror = null;
    /** @type {((this: IDBTransaction, ev: Event) => unknown) | null} */
    onabort = null;

    pending = 0;
    finished = false;
    /** @type {StoreMap} */
    stores;

    /** @param {StoreMap} stores */
    constructor(stores) {
        this.stores = stores;
        queueMicrotask(() => {
            if (this.pending === 0) {
                this.finish();
            }
        });
    }

    /** @param {string} name */
    objectStore(name) {
        const store = this.stores.get(name);
        if (store === undefined) {
            throw new Error(`Missing store ${name}`);
        }
        return new FakeObjectStore(store, this);
    }

    /** @template T @param {FakeRequest<T>} request */
    trackRequest(request) {
        this.pending += 1;
        request.afterSuccess = () => {
            this.pending -= 1;
            if (this.pending <= 0) {
                this.finish();
            }
        };
    }

    /**
     * @param {FakeRequest<IDBCursorWithValue | null>} request
     * @param {FakeCursor} cursor
     */
    trackCursorRequest(request, cursor) {
        this.pending += 1;
        request.afterSuccess = () => {
            if (cursor.requested) {
                cursor.requested = false;
                return;
            }
            this.pending -= 1;
            if (this.pending <= 0) {
                this.finish();
            }
        };
    }

    finish() {
        if (this.finished) {
            return;
        }
        this.finished = true;
        queueMicrotask(() => {
            this.oncomplete?.call(
                /** @type {IDBTransaction} */ (/** @type {unknown} */ (this)),
                new Event('complete')
            );
        });
    }
}

class FakeDatabase {
    /** @type {StoreMap} */
    stores = new Map();
    /** @type {FakeTransaction | null} */
    upgradeTransaction = null;
    objectStoreNames = {
        /** @param {string} name */
        contains: (name) => this.stores.has(name),
    };

    /**
     * @param {string} name
     * @param {{ keyPath: string } | undefined} options
     */
    createObjectStore(name, options) {
        const keyPath = options?.keyPath ?? 'id';
        /** @type {StoreConfig} */
        const storeConfig = {
            keyPath,
            data: new Map(),
            indexNames: new Set(),
        };
        this.stores.set(name, storeConfig);
        const transaction =
            this.upgradeTransaction ?? new FakeTransaction(this.stores);
        return new FakeObjectStore(storeConfig, transaction);
    }

    /** @param {FakeTransaction | null} transaction */
    setUpgradeTransaction(transaction) {
        this.upgradeTransaction = transaction;
    }

    /** @param {string} _name */
    transaction(_name) {
        return new FakeTransaction(this.stores);
    }

    /** @returns {StoreMap} */
    getStores() {
        return this.stores;
    }

    close() {
        return;
    }
}

/** @returns {IDBFactory} */
function createFakeIndexedDB() {
    /** @type {Map<string, FakeDatabase>} */
    const dbs = new Map();
    return /** @type {IDBFactory} */ ({
        /** @param {string} name */
        open(name) {
            /** @type {FakeRequest<IDBDatabase>} */
            const request = new FakeRequest();
            const existing = dbs.get(name);
            const isNew = existing === undefined;
            const db = existing ?? new FakeDatabase();
            dbs.set(name, db);
            request.result = /** @type {IDBDatabase} */ (
                /** @type {unknown} */ (db)
            );

            if (isNew) {
                const upgradeTransaction = new FakeTransaction(db.getStores());
                db.setUpgradeTransaction(upgradeTransaction);
                request.transaction = upgradeTransaction;
            }

            queueMicrotask(() => {
                if (isNew) {
                    request.onupgradeneeded?.call(
                        /** @type {IDBOpenDBRequest} */ (
                            /** @type {unknown} */ (request)
                        ),
                        new Event('upgradeneeded')
                    );
                }
                if (isNew) {
                    db.setUpgradeTransaction(null);
                }
                request.fireSuccess();
            });

            return /** @type {IDBOpenDBRequest} */ (
                /** @type {unknown} */ (request)
            );
        },
    });
}

describe('indexeddb lib', () => {
    beforeEach(() => {
        vi.stubGlobal('indexedDB', createFakeIndexedDB());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('stores and reads meta entries', async () => {
        await setMeta({ key: 'lastSync', value: '2024-01-01T00:00:00Z' });

        const entry = await getMeta('lastSync');

        expect(entry?.value).toBe('2024-01-01T00:00:00Z');
    });

    it('writes courses and paginates results', async () => {
        await putCourses([
            { code: 'CS101', name: 'Intro' },
            { code: 'CS102', name: 'Data Structures' },
            { code: 'CS103', name: 'Algorithms' },
        ]);

        const course = await getCourse('CS102');
        const page = await getCoursesPage(2, 1);

        expect(course?.name).toBe('Data Structures');
        expect(page).toHaveLength(2);
        expect(page[0]?.code).toBe('CS102');
        expect(page[1]?.code).toBe('CS103');
    });

    it('writes catalogs and reads back data', async () => {
        await putCatalogs({
            '2025_200': { en: '2025 Summer', he: '2025 קיץ' },
            '2025_201': { en: '2025 Winter', he: '2025 חורף' },
        });

        const catalogs = await getCatalogs();

        expect(catalogs['2025_200']).toEqual({
            en: '2025 Summer',
            he: '2025 קיץ',
        });
        expect(catalogs['2025_201']).toEqual({
            en: '2025 Winter',
            he: '2025 חורף',
        });
    });

    it('replaces requirements with copy-on-write semantics', async () => {
        await replaceRequirementsWithCow(
            {
                catalogId: '2025_200',
                facultyId: '00002010',
                programId: 'SC00001403_CG00001322',
                data: { name: 'Program A' },
            },
            undefined
        );

        await replaceRequirementsWithCow(
            {
                catalogId: '2025_200',
                facultyId: '00002010',
                programId: 'SC00001404_CG00010389',
                data: { name: 'Program B' },
            },
            'SC00001403_CG00001322'
        );

        const oldRequirement = await getRequirement('SC00001403_CG00001322');
        const newRequirement = await getRequirement('SC00001404_CG00010389');

        expect(oldRequirement).toBeUndefined();
        expect(newRequirement?.data).toEqual({ name: 'Program B' });
        expect(newRequirement?.catalogId).toBe('2025_200');
    });
});
