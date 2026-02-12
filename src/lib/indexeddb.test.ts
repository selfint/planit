import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    getCourse,
    getCoursesPage,
    getMeta,
    putCourses,
    setMeta,
} from '$lib/indexeddb';

type StoreConfig = {
    keyPath: string;
    data: Map<string, unknown>;
    indexNames: Set<string>;
};

type StoreMap = Map<string, StoreConfig>;

type RequestCallback<T> = ((this: IDBRequest<T>, ev: Event) => unknown) | null;

class FakeRequest<T> {
    result!: T;
    error: Error | null = null;
    onsuccess: RequestCallback<T> = null;
    onerror: RequestCallback<T> = null;
    onupgradeneeded: ((this: IDBOpenDBRequest, ev: Event) => unknown) | null =
        null;
    transaction: FakeTransaction | null = null;
    afterSuccess: (() => void) | null = null;

    fireSuccess(): void {
        this.onsuccess?.call(
            this as unknown as IDBRequest<T>,
            new Event('success')
        );
        this.afterSuccess?.();
    }
}

class FakeCursor {
    value: unknown;
    private index = 0;
    private readonly values: unknown[];
    private readonly request: FakeRequest<IDBCursorWithValue | null>;
    requested = false;

    constructor(
        values: unknown[],
        request: FakeRequest<IDBCursorWithValue | null>
    ) {
        this.values = values;
        this.request = request;
        this.value = values[0];
    }

    advance(count: number): void {
        this.index += count;
        this.requested = true;
        this.updateRequest();
    }

    continue(): void {
        this.index += 1;
        this.requested = true;
        this.updateRequest();
    }

    private updateRequest(): void {
        if (this.index >= this.values.length) {
            this.request.result = null;
            queueMicrotask(() => {
                this.request.fireSuccess();
            });
            return;
        }

        this.value = this.values[this.index];
        this.request.result = this as unknown as IDBCursorWithValue;
        queueMicrotask(() => {
            this.request.fireSuccess();
        });
    }
}

class FakeObjectStore {
    private readonly store: StoreConfig;
    private readonly transaction: FakeTransaction;
    readonly indexNames = {
        contains: (name: string): boolean => this.store.indexNames.has(name),
    };

    constructor(store: StoreConfig, transaction: FakeTransaction) {
        this.store = store;
        this.transaction = transaction;
    }

    get(key: string): IDBRequest<unknown> {
        const request = new FakeRequest<unknown>();
        request.result = this.store.data.get(key);
        this.transaction.trackRequest(request);
        queueMicrotask(() => {
            request.fireSuccess();
        });
        return request as unknown as IDBRequest<unknown>;
    }

    put(value: unknown): void {
        if (typeof value !== 'object' || value === null) {
            return;
        }
        const record = value as Record<string, unknown>;
        const keyValue = record[this.store.keyPath];
        if (typeof keyValue === 'string' && keyValue.length > 0) {
            this.store.data.set(keyValue, value);
        }
    }

    createIndex(name: string): void {
        this.store.indexNames.add(name);
    }

    openCursor(): IDBRequest<IDBCursorWithValue | null> {
        const request = new FakeRequest<IDBCursorWithValue | null>();
        const values = Array.from(this.store.data.values());
        if (values.length === 0) {
            request.result = null;
            this.transaction.trackRequest(request);
            queueMicrotask(() => {
                request.fireSuccess();
            });
            return request as unknown as IDBRequest<IDBCursorWithValue | null>;
        }

        const cursor = new FakeCursor(values, request);
        request.result = cursor as unknown as IDBCursorWithValue;
        this.transaction.trackCursorRequest(request, cursor);
        queueMicrotask(() => {
            request.fireSuccess();
        });
        return request as unknown as IDBRequest<IDBCursorWithValue | null>;
    }
}

class FakeTransaction {
    oncomplete: ((this: IDBTransaction, ev: Event) => unknown) | null = null;
    onerror: ((this: IDBTransaction, ev: Event) => unknown) | null = null;
    onabort: ((this: IDBTransaction, ev: Event) => unknown) | null = null;

    private pending = 0;
    private finished = false;
    private readonly stores: StoreMap;

    constructor(stores: StoreMap) {
        this.stores = stores;
        queueMicrotask(() => {
            if (this.pending === 0) {
                this.finish();
            }
        });
    }

    objectStore(name: string): FakeObjectStore {
        const store = this.stores.get(name);
        if (store === undefined) {
            throw new Error(`Missing store ${name}`);
        }
        return new FakeObjectStore(store, this);
    }

    trackRequest<T>(request: FakeRequest<T>): void {
        this.pending += 1;
        request.afterSuccess = (): void => {
            this.pending -= 1;
            if (this.pending <= 0) {
                this.finish();
            }
        };
    }

    trackCursorRequest(
        request: FakeRequest<IDBCursorWithValue | null>,
        cursor: FakeCursor
    ): void {
        this.pending += 1;
        request.afterSuccess = (): void => {
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

    private finish(): void {
        if (this.finished) {
            return;
        }
        this.finished = true;
        queueMicrotask(() => {
            this.oncomplete?.call(
                this as unknown as IDBTransaction,
                new Event('complete')
            );
        });
    }
}

class FakeDatabase {
    private readonly stores: StoreMap = new Map();
    private upgradeTransaction: FakeTransaction | null = null;
    readonly objectStoreNames = {
        contains: (name: string): boolean => this.stores.has(name),
    };

    createObjectStore(
        name: string,
        options?: { keyPath: string }
    ): FakeObjectStore {
        const keyPath = options?.keyPath ?? 'id';
        const storeConfig: StoreConfig = {
            keyPath,
            data: new Map(),
            indexNames: new Set<string>(),
        };
        this.stores.set(name, storeConfig);
        const transaction =
            this.upgradeTransaction ?? new FakeTransaction(this.stores);
        return new FakeObjectStore(storeConfig, transaction);
    }

    setUpgradeTransaction(transaction: FakeTransaction | null): void {
        this.upgradeTransaction = transaction;
    }

    transaction(_name: string): FakeTransaction {
        return new FakeTransaction(this.stores);
    }

    getStores(): StoreMap {
        return this.stores;
    }

    close(): void {
        return;
    }
}

function createFakeIndexedDB(): IDBFactory {
    const dbs = new Map<string, FakeDatabase>();
    return {
        open(name: string): IDBOpenDBRequest {
            const request = new FakeRequest<IDBDatabase>();
            const existing = dbs.get(name);
            const isNew = existing === undefined;
            const db = existing ?? new FakeDatabase();
            dbs.set(name, db);
            request.result = db as unknown as IDBDatabase;

            if (isNew) {
                const upgradeTransaction = new FakeTransaction(db.getStores());
                db.setUpgradeTransaction(upgradeTransaction);
                request.transaction = upgradeTransaction;
            }

            queueMicrotask(() => {
                if (isNew) {
                    request.onupgradeneeded?.call(
                        request as unknown as IDBOpenDBRequest,
                        new Event('upgradeneeded')
                    );
                }
                if (isNew) {
                    db.setUpgradeTransaction(null);
                }
                request.fireSuccess();
            });

            return request as unknown as IDBOpenDBRequest;
        },
    } as IDBFactory;
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
});
