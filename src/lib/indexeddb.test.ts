import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    getCatalogs,
    getCourse,
    getCourseFaculties,
    getCoursesCount,
    getCoursesPage,
    getMeta,
    getRequirement,
    putCatalogs,
    putCourses,
    queryCourses,
    replaceRequirementsWithCow,
    searchCourses,
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

    delete(key: string): IDBRequest<unknown> {
        const request = new FakeRequest<unknown>();
        this.store.data.delete(key);
        this.transaction.trackRequest(request);
        queueMicrotask(() => {
            request.fireSuccess();
        });
        return request as unknown as IDBRequest<unknown>;
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

    it('searches courses by code and name in ranked order', async () => {
        await putCourses([
            { code: '234114', name: 'מבוא למדעי המחשב' },
            { code: '234124', name: 'מבני נתונים' },
            { code: '104031', name: 'אלגוריתמים 1' },
            { code: '104166', name: 'מבוא לאלגוריתמים' },
        ]);

        const byCode = await searchCourses('2341', 10);
        const byName = await searchCourses('אלגוריתמים', 10);

        expect(byCode.map((course) => course.code)).toEqual([
            '234114',
            '234124',
        ]);
        expect(byName.map((course) => course.code)).toEqual([
            '104031',
            '104166',
        ]);
    });

    it('limits course search results', async () => {
        await putCourses([
            { code: '1', name: 'א' },
            { code: '2', name: 'אב' },
            { code: '3', name: 'אבג' },
        ]);

        const results = await searchCourses('א', 2);

        expect(results).toHaveLength(2);
    });

    it('queries courses with combined filters and pagination', async () => {
        await putCourses([
            {
                code: '234114',
                name: 'מבוא למדעי המחשב',
                faculty: 'CS',
                points: 4,
                median: 85,
                current: true,
            },
            {
                code: '234124',
                name: 'מבני נתונים',
                faculty: 'CS',
                points: 3,
                median: 74,
                current: true,
            },
            {
                code: '104031',
                name: 'אלגברה',
                faculty: 'Math',
                points: 5,
                median: 88,
                current: false,
            },
        ]);

        const filtered = await queryCourses({
            query: 'מב',
            availableOnly: true,
            faculty: 'CS',
            pointsMin: 3,
            pointsMax: 4,
            medianMin: 80,
            requirementCourseCodes: ['234114', '999999'],
            page: 1,
            pageSize: 10,
        });

        const paged = await queryCourses({
            availableOnly: true,
            faculty: 'CS',
            page: 1,
            pageSize: 1,
        });

        expect(filtered.total).toBe(1);
        expect(filtered.courses.map((course) => course.code)).toEqual([
            '234114',
        ]);
        expect(paged.total).toBe(2);
        expect(paged.courses).toHaveLength(1);
    });

    it('returns all records when page size is all and lists faculties', async () => {
        await putCourses([
            { code: '1', faculty: 'CS', current: true },
            { code: '2', faculty: 'Math', current: true },
            { code: '3', faculty: 'CS', current: false },
        ]);

        const all = await queryCourses({
            availableOnly: false,
            pageSize: 'all',
        });
        const faculties = await getCourseFaculties();

        expect(all.total).toBe(3);
        expect(all.courses).toHaveLength(3);
        expect(faculties).toEqual(['CS', 'Math']);
    });

    it('returns total number of stored courses', async () => {
        await putCourses([
            { code: '1', name: 'א' },
            { code: '2', name: 'ב' },
            { code: '3', name: 'ג' },
        ]);

        const count = await getCoursesCount();

        expect(count).toBe(3);
    });

    it('applies median minimum filter when median is stored as a string', async () => {
        await putCourses([
            { code: 'A1', name: 'Alpha', median: '85' as unknown as number },
            { code: 'B1', name: 'Beta', median: '70' as unknown as number },
        ]);

        const filtered = await queryCourses({
            medianMin: 80,
            page: 1,
            pageSize: 'all',
        });

        expect(filtered.courses.map((course) => course.code)).toEqual(['A1']);
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
